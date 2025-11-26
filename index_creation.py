import os
import glob
import fitz  # PyMuPDF for PDF processing
import faiss
import pickle
from sentence_transformers import SentenceTransformer
from langchain.text_splitter import RecursiveCharacterTextSplitter


def extract_text_from_pdf(pdf_path: str) -> str:
    """
    Extracts and concatenates text from all pages of a PDF file.
    """
    doc = fitz.open(pdf_path)
    text = []
    for page in doc:
        text.append(page.get_text())
    return "\n".join(text)


def build_embeddings(chunks: list[str], model_name: str = 'all-mpnet-base-v2') -> list[list[float]]:
    """
    Generates vector embeddings for a list of text chunks using SentenceTransformers.
    """
    model = SentenceTransformer(model_name)
    embeddings = model.encode(chunks, show_progress_bar=True)
    return embeddings


def build_faiss_index(
    pdfs_dir: str = 'pdfs',
    index_path: str = 'faiss_index.bin',
    meta_path: str = 'index_metadata.pkl',
    chunk_size: int = 1000,
    chunk_overlap: int = 200
) -> None:
    """
    Reads all PDFs from `pdfs_dir`, splits the text into chunks,
    generates embeddings, and builds a FAISS index saved to disk.

    Also saves a metadata file mapping vector IDs to source text and filename.
    """
    # Load and split PDF texts
    pdf_paths = glob.glob(os.path.join(pdfs_dir, '*.pdf'))
    if not pdf_paths:
        raise FileNotFoundError(f"No PDF files found in directory: {pdfs_dir}")

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap
    )

    all_chunks = []
    metadata = []  # list of dicts with keys: 'source', 'text'

    for pdf_path in pdf_paths:
        raw_text = extract_text_from_pdf(pdf_path)
        chunks = splitter.split_text(raw_text)
        all_chunks.extend(chunks)
        metadata.extend([
            {'source': os.path.basename(pdf_path), 'text': chunk}
            for chunk in chunks
        ])

    # Generate embeddings
    print(f"Generating embeddings for {len(all_chunks)} chunks...")
    embeddings = build_embeddings(all_chunks)

    # Convert to float32 numpy array and normalize for cosine similarity
    import numpy as np
    embeddings = np.array(embeddings, dtype='float32')
    faiss.normalize_L2(embeddings)

    # Build FAISS index (Inner Product on normalized vectors = Cosine similarity)
    dim = embeddings.shape[1]
    index = faiss.IndexFlatIP(dim)
    index.add(embeddings)

    # Persist index and metadata
    faiss.write_index(index, index_path)
    with open(meta_path, 'wb') as f:
        pickle.dump(metadata, f)

    print(f"FAISS index saved to '{index_path}' with {index.ntotal} vectors.")
    print(f"Metadata saved to '{meta_path}'.")


if __name__ == '__main__':
    build_faiss_index()
