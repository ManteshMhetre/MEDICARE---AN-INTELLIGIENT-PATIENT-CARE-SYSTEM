from flask import Flask, render_template, request, jsonify
from PIL import Image
import io
import fitz  # PyMuPDF for PDF handling
import pickle
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
import markdown2
import re
from groq import Groq
from google import genai

# === Configuration & Initialization ===

# API Keys (hard-coded into the code)
GENAI_API_KEY = "AIzaSyD54ejbjVIVa-F3aD_Urnp8m1EFLUGR__I"
GROQ_API_KEY = "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"
FLASK_SECRET_KEY = "supersecretkey"

# Configure Gemini
genai_client = genai.Client(api_key=GENAI_API_KEY)

# Embedding model (must match the one used during FAISS indexing)
EMBED_MODEL_NAME = 'all-mpnet-base-v2'
embedding_model = SentenceTransformer(EMBED_MODEL_NAME)

# Load FAISS index and metadata
faiss_index = faiss.read_index('faiss_index.bin')
with open('index_metadata.pkl', 'rb') as f:
    metadata = pickle.load(f)

# Initialize Flask app
app = Flask(__name__)
app.secret_key = FLASK_SECRET_KEY


# === Retrieval & Hybrid Reranking ===

def semantic_search(query: str, top_k: int = 10):
    """
    Perform FAISS vector search for the query, returning raw candidates.
    """
    # Embed and normalize query vector
    q_emb = embedding_model.encode([query], convert_to_numpy=True)
    faiss.normalize_L2(q_emb)

    # FAISS inner-product search on normalized vectors = cosine similarity
    distances, indices = faiss_index.search(q_emb, top_k)
    results = []
    for dist, idx in zip(distances[0], indices[0]):
        meta = metadata[idx]
        results.append({
            'text': meta['text'],
            'source': meta['source'],
            'score': float(dist)
        })
    return results


def simple_rerank(candidates: list[dict], query: str, top_k: int = 5):
    """
    Rerank by re-encoding each candidate alongside the query to refine similarity.
    """
    texts = [query] + [c['text'] for c in candidates]
    embs = embedding_model.encode(texts, convert_to_numpy=True)
    q_emb, doc_embs = embs[0], embs[1:]

    # Normalize for cosine similarity
    full = np.vstack([q_emb, *doc_embs])
    faiss.normalize_L2(full)
    q_norm, doc_norms = full[0], full[1:]

    # Compute similarities
    sims = np.dot(doc_norms, q_norm.T)
    for c, sim in zip(candidates, sims):
        c['rerank_score'] = float(sim)

    # Return top-k by rerank_score
    return sorted(candidates, key=lambda x: x['rerank_score'], reverse=True)[:top_k]


def retrieve_all_patient_history(patient_id: str, k: int = 15) -> str:
    """
    Retrieve complete patient history from the vector database.
    This function retrieves more records (k=15) to provide comprehensive history.
    """
    if not patient_id:
        return ""

    history_query = f"Previous medical reports for patient {patient_id}"
    candidates = semantic_search(history_query, top_k=k * 3)
    if not candidates:
        return ""

    # Rerank top candidates but get more items to provide fuller history
    reranked = simple_rerank(candidates, history_query, top_k=k)
    merged = []
    for r in reranked:
        merged.append(f"Source: {r['source']}\n{r['text']}")
    return "\n\n".join(merged)


def retrieve_query(query_text: str, k: int = 3) -> str:
    """
    Hybrid retrieval: semantic search + reranking to return consolidated medical excerpts.
    """
    # 1) Semantic retrieval
    candidates = semantic_search(query_text, top_k=k * 5)
    if not candidates:
        return "No relevant medical data found."

    # 2) Rerank top candidates
    reranked = simple_rerank(candidates, query_text, top_k=k)
    merged = []
    for r in reranked:
        merged.append(f"Source: {r['source']}\n{r['text']}")
    return "\n\n".join(merged)


# === Prescription Generation via Groq ===

def generate_prescription(diagnosis_details: str, patient_history: str = "") -> str:
    client = Groq(api_key=GROQ_API_KEY)

    history_section = ""
    if patient_history:
        history_section = f"\nPATIENT HISTORY:\n{patient_history}\n"

    system_prompt = (
        "You are an expert medical practitioner. Based on the given diagnosis and patient history {patient_history}, provide the best medication prescription. "
        "Start directly with the report. "
        "Suggest medication clean and crisp. "
        "Only suggest medicines and at-home treatments, since this report will be read by the patient."
        "Analyze current diagnosis alongside patient history to create a comprehensive care plan. "

        "\nFORMAT YOUR RESPONSE WITH THESE SECTIONS:\n"

        "\n## DIAGNOSIS SUMMARY\n"
        "- Summarize the current medical condition in simple terms with proper formatting (in two 5-6 lien spapragrpash possibly)\n"
        "- Highlight any significant findings from medical tests\n"
        "- Note any relevant patterns observed from patient history\n"
        "- hey dont mention like patient history jnot given etc.. and also domnt go much medical terms keep it simple understandabel by patient"

        "\n## MEDICATION PLAN\n"
        "1. [MEDICATION NAME] ([form: tablet/capsule/etc])\n"
        "   - Dosage: [exact amount based on patient profile]\n"
        "   - Schedule: [specific times of day to take]\n"
        "   - Duration: [how long to continue]\n"
        "   - Purpose: [what specific symptom/condition this treats]\n"
        "   - Note: [any special instructions like 'take with food']\n"

        "\n## HOME TREATMENT\n"
        "- [Detailed step-by-step instructions for home care]\n"
        "- [Include frequency and duration of each treatment]\n"

        "\n## DIET & LIFESTYLE\n"
        "- [Foods to include or increase]\n"
        "- [Foods to avoid or limit]\n"
        "- [Specific activity recommendations]\n"
        "- [Rest and recovery guidance]\n"

        "\n## FOLLOW-UP PLAN\n"
        "- [When to schedule next appointment]\n"
        "- [Warning signs that require immediate attention]\n"
        "- [Monitoring instructions]\n"

        "\n## PROGRESS NOTES\n"
        "- [Comparison with previous conditions if applicable]\n"
        "- [Expected timeline for improvement]\n"

        "\nIMPORTANT GUIDELINES:\n"
        "- Use simple, everyday language\n"
        "- Compare current condition with patient history to identify patterns\n"
        "- Clearly state whether the patient's condition has improved or deteriorated based on history\n"
        "- Keep sentences short (15 words or less)\n"
        "- Use bullet points for easy reading\n"
        "- Maintain justified text alignment in each section\n"
        "- Start directly with the content - no introductions or disclaimers\n"
        "- Provide specific, actionable instructions rather than general advice\n"
        "- DO NOT include any phrases like 'I have analyzed', 'in this document', 'not found in document'\n"
        "- DO NOT include any disclaimers, introductions, or statements about AI limitations\n"
    )


    enhanced_details = (
        f"CURRENT DIAGNOSIS:\n{diagnosis_details}\n"
        f"{history_section}\n"
        "Based on both the current diagnosis and patient history, create a personalized "
        "treatment plan that addresses the current condition while considering previous "
        "health patterns. Explicitly mention if the patient's condition has improved, "
        "deteriorated, or remained stable compared to previous records."
    )

    resp = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": enhanced_details}
        ],
        temperature=0.2,
        max_tokens=1500,
        top_p=0.85,
        stream=False
    )

    prescription = resp.choices[0].message.content

    # Post-processing to ensure proper formatting and remove unwanted elements
    prescription = re.sub(
        r"(Disclaimer|Note to doctor|Please consult|This is not medical advice|I've analyzed|Based on the document).*?(\n|$)",
        "",
        prescription, flags=re.IGNORECASE | re.DOTALL)

    justified_prescription = ""
    for line in prescription.split('\n'):
        if line.startswith('#'):
            justified_prescription += f"\n{line}\n"
        elif line.strip():
            justified_prescription += f"{line}\n"
        else:
            justified_prescription += "\n"

    return justified_prescription.strip()


# === File Processing & Markdown Helpers ===

def process_file(file):
    if file.content_type == 'application/pdf':
        pdf_bytes = file.read()
        pdf = fitz.open(stream=pdf_bytes, filetype="pdf")
        page = pdf[0]
        pix = page.get_pixmap()
        return Image.frombytes("RGB", [pix.width, pix.height], pix.samples), file.filename
    else:
        img_bytes = file.read()
        return Image.open(io.BytesIO(img_bytes)), file.filename


def fix_table_formatting(text: str) -> str:
    lines, fixed, in_table = text.split('\n'), [], False
    for line in lines:
        if line.strip().startswith('|') and line.strip().endswith('|'):
            in_table = True
            cells = [c.strip() for c in line.split('|') if c.strip()]
            fixed.append('| ' + ' | '.join(cells) + ' |')
        else:
            in_table = False
            fixed.append(line)
    return '\n'.join(fixed)


# === Flask Routes ===

@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        if "files" not in request.files:
            return jsonify({"error": "No files uploaded"})

        files = request.files.getlist("files")
        if not files or not files[0].filename:
            return jsonify({"error": "No files selected"})

        patient_id = request.form.get("patient_id", None)

        try:
            processed = []
            for f in files:
                img, name = process_file(f)
                processed.append((img, name))

            names = [n for _, n in processed]
            parts = [img for img, _ in processed]

            # Get comprehensive patient history if ID is provided
            patient_history = retrieve_all_patient_history(patient_id, k=15) if patient_id else ""

            # Modified Gemini prompt to include complete patient history
            model = "gemini-2.0-flash"

            # Building the content prompt with full patient history included
            content_prompt = (
                    "Provide a simple medical summary of these documents in exactly TWO short paragraphs: "
                    + ", ".join(names)
            )

            if patient_history:
                content_prompt += "\n\nCOMPLETE PATIENT HISTORY:\n" + patient_history

            content_prompt += (
                "\n\nFirst paragraph (6-7 sentences): Summarize key test results, diagnoses, and critical findings from current documents. "
                "Keep it simple and concise, focusing only on crucial information."
                "\n\nSecond paragraph (3-4 sentences): Directly state whether the patient's condition has improved, deteriorated, or remained stable "
                "compared to previous records. Mention specific changes in health metrics when available."
                "\n\nDO NOT include any introductory text or disclaimers. Start directly with the findings. "
                "DO NOT use phrases like 'I analyzed' or 'this document shows'."
            )

            response = genai_client.models.generate_content(
                model=model,
                contents=content_prompt
            )

            if not response or not response.text:
                return jsonify({"error": "No summary generated"})

            summary = response.text.strip()
            # Remove any lingering disclaimers or introductions
            summary = re.sub(r"^(I have analyzed|Based on the|The document shows|In this document).*?(\n|$)",
                             "",
                             summary,
                             flags=re.IGNORECASE)

            # Generate prescription using both the summary and complete patient history
            prescription = generate_prescription(
                f"Summary: {summary}",
                patient_history=patient_history
            )

            output = (
                "# 📊 Medical Report\n\n"
                f"## 📋 Key Findings\n{summary}\n\n"
                f"## 💊 Treatment Plan\n{prescription}"
            )

            def fmt(text):
                lines = [l.strip() for l in text.split('\n')]
                out = []
                for i, l in enumerate(lines):
                    if l.startswith('#'):
                        if i > 0: out.append('')
                        out.append(l)
                        out.append('')
                    elif l:
                        out.append(l)
                t = '\n'.join(out)
                return re.sub(r'(?m)^-', '•', t)

            fixed = fmt(output)

            justified_css = "<style>.justified {text-align: justify; text-justify: inter-word;}</style>"

            html = markdown2.markdown(
                fixed,
                extras=['tables', 'fenced-code-blocks', 'break-on-newline', 'cuddled-lists']
            )

            html = re.sub(r'<p>', '<p class="justified">', html)
            html = justified_css + html

            return jsonify({"summary": fixed, "html_summary": html})

        except Exception as ex:
            return jsonify({"error": str(ex)})

    return render_template("index.html")


if __name__ == '__main__':
    app.run(debug=True)