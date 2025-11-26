from flask import Flask, render_template, request, redirect, flash, jsonify
import google.generativeai as genai
from PIL import Image
import io
import fitz  
import tempfile
import os
import markdown2  
import re  
from groq import Groq
from pinecone import Pinecone, ServerlessSpec

genai.configure(api_key="AIzaSyA3joMQMnael_heUCwpNvoRznCUiU3avf4")
GROQ_API_KEY = "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"
PINECONE_API_KEY = "pcsk_45FE9b_Tfu3NVkFqAwBT2qQBvEeVA36ab8HJXpq2VgDWyWnP4o2WWakAi5yDiEitMiexKu"
INDEX_NAME = "cavistahack"

app = Flask(__name__)
app.secret_key = "supersecretkey"  

pc = Pinecone(api_key=PINECONE_API_KEY)

try:
    if INDEX_NAME not in pc.list_indexes().names():
        pc.create_index(
            name=INDEX_NAME,
            dimension=768,
            metric='cosine',
            spec=ServerlessSpec(
                cloud='aws',
                region='us-west-2'
            )
        )
except Exception as e:
    print(f"Error creating Pinecone index: {str(e)}")

try:
    index = pc.Index(INDEX_NAME)
except Exception as e:
    print(f"Error connecting to Pinecone index: {str(e)}")

def retrieve_query(query_text, k=1):
    """Retrieve similar medical data from Pinecone"""
    try:
        from sentence_transformers import SentenceTransformer
        model = SentenceTransformer('all-mpnet-base-v2')
        
        query_embedding = model.encode(query_text).tolist()
        
        results = index.query(
            vector=query_embedding,
            top_k=k,
            include_metadata=True
        )
        
        if results and results.matches:
            return results.matches[0].metadata.get('text', 'No relevant medical data found.')
        return "No relevant medical data found."
    except Exception as e:
        print(f"Error in retrieve_query: {str(e)}")
        return "Error retrieving medical data."

def generate_prescription(diagnosis_details):
    """Generate prescription using Groq"""
    try:
        client = Groq(api_key=GROQ_API_KEY)
        
        system_prompt = (
            "You are an expert medical practitioner. Based on the given diagnosis, provide the best medication prescription. "
            "Strictly start the report, don't give any garbage comments. Only give for the mentioned age. "
            "Don't give everything, just suggest medication clean and crisp. "
            "Only and only suggest medicines and at-home treatments, since this report will be read by the patient."
        )

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": diagnosis_details}
            ],
            temperature=0.5,
            max_tokens=1024,
            top_p=1,
            stream=False  
        )
        
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error in generate_prescription: {str(e)}")
        return "Error generating prescription."

def process_file(file):
    """Process file into appropriate format for Gemini"""
    if file.content_type == 'application/pdf':
        try:
            pdf_bytes = file.read()
            pdf_document = fitz.open(stream=pdf_bytes, filetype="pdf")
            
            first_page = pdf_document[0]
            pix = first_page.get_pixmap()
            
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            
            return img, file.filename
            
        except Exception as e:
            raise Exception(f"Error processing PDF {file.filename}: {str(e)}")
    else:
        try:
            image_bytes = file.read()
            image = Image.open(io.BytesIO(image_bytes))
            return image, file.filename
        except Exception as e:
            raise Exception(f"Error processing image {file.filename}: {str(e)}")

def fix_table_formatting(text):
    """Fix markdown table formatting"""
    lines = text.split('\n')
    fixed_lines = []
    in_table = False
    
    for line in lines:
        if line.strip().startswith('|') and line.strip().endswith('|'):
            in_table = True
            cells = [cell.strip() for cell in line.split('|')]
            cells = [cell for cell in cells if cell]
            fixed_line = '| ' + ' | '.join(cells) + ' |'
            fixed_lines.append(fixed_line)
        else:
            if in_table:
                in_table = False
            fixed_lines.append(line)
    
    return '\n'.join(fixed_lines)

@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        if "files" not in request.files:
            return jsonify({"error": "No files uploaded"})

        files = request.files.getlist("files")
        if not files or files[0].filename == "":
            return jsonify({"error": "No files selected"})

        try:
            processed_files = []
            for file in files:
                processed_content, filename = process_file(file)
                processed_files.append((processed_content, filename))

            filenames = [f[1] for f in processed_files]
            files_list = "\n".join([f"- {fname}" for fname in filenames])

            content_parts = []
            for img, _ in processed_files:
                content_parts.append(img)

            content_parts.append(
                f"""Analyze all {len(files)} medical documents provided and create a comprehensive summary.
                Documents being analyzed:
                {files_list}
                Provide a unified analysis in the following format:
                generate a combine summary of all the reports in one paragraph
                """
            )

            model = genai.GenerativeModel("gemini-1.5-flash")
            response = model.generate_content(content_parts)
            
            if response and response.text:
                summary = response.text.strip()
                if summary.lower().startswith("please provide"):
                    return jsonify({"error": "Could not analyze the documents"})
                
                try:
                    retrieved_data = retrieve_query(summary)
                    
                    combined_input = f"Summary: {summary}\nAdditional Medical Context: {retrieved_data}"
                    prescription = generate_prescription(combined_input)
                    
                    final_output = f"""
                    # 📊 Medical Report Analysis

                    ## 📋 Document Summary
                    {summary}

                    ## 💊 Recommended Treatment
                    ### Medications and Treatment Plan:
                    {prescription}

                    ---
                    """
                    
                    def format_markdown(text):
                        """Improve markdown formatting"""
                        lines = [line.strip() for line in text.split('\n')]
                        
                        formatted_lines = []
                        for i, line in enumerate(lines):
                            if line.startswith('#'):
                                if i > 0:
                                    formatted_lines.append('')
                                formatted_lines.append(line)
                                formatted_lines.append('')
                            elif line:
                                formatted_lines.append(line)
                        
                        text = '\n'.join(formatted_lines)
                        
                        text = re.sub(r'(?m)^(\s*)-', r'\1•', text)
                        
                        text = re.sub(r'\n(•[^\n]+)(?:\n(?!•)|\Z)', r'\n\1\n', text)
                        
                        return text

                    fixed_output = format_markdown(final_output)
                    html_output = markdown2.markdown(
                        fixed_output,
                        extras=[
                            'tables',
                            'fenced-code-blocks',
                            'break-on-newline',
                            'cuddled-lists'
                        ]
                    )
                    return jsonify({"summary": fixed_output, "html_summary": html_output})
                except Exception as e:
                    print(f"Error in prescription generation: {str(e)}")
                    return jsonify({"error": "Error generating prescription"})
            else:
                return jsonify({"error": "No summary could be generated"})
                
        except Exception as e:
            return jsonify({"error": f"Error processing files: {str(e)}"})

    return render_template("index2.html")

if __name__ == "__main__":
    app.run(debug=True, port=1234)
