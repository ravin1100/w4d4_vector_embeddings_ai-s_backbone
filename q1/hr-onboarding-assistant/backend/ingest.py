import os
from typing import List
import fitz  # PyMuPDF
from docx import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.http import models
from qdrant_client.http.exceptions import UnexpectedResponse
from dotenv import load_dotenv
import uuid

load_dotenv()

# Initialize Qdrant client
client = QdrantClient(
    host=os.getenv("QDRANT_HOST", "localhost"),
    port=int(os.getenv("QDRANT_PORT", 6333))
)

# Initialize sentence transformer model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Check if collection exists, create only if it doesn't
collections = client.get_collections().collections
collection_names = [collection.name for collection in collections]
if 'documents' not in collection_names:
    client.create_collection(
        collection_name='documents',
        vectors_config=models.VectorParams(
            size=model.get_sentence_embedding_dimension(),
            distance=models.Distance.COSINE
        )
    )

def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from PDF file"""
    text = ""
    with fitz.open(file_path) as doc:
        for page in doc:
            text += page.get_text()
    return text

def extract_text_from_docx(file_path: str) -> str:
    """Extract text from DOCX file"""
    doc = Document(file_path)
    return "\n".join([paragraph.text for paragraph in doc.paragraphs])

async def process_document(file_path: str, original_filename: str) -> None:
    """Process document and store chunks in Qdrant"""
    # Extract text based on file type
    if file_path.lower().endswith('.pdf'):
        text = extract_text_from_pdf(file_path)
    elif file_path.lower().endswith('.docx'):
        text = extract_text_from_docx(file_path)
    else:
        raise ValueError("Unsupported file type")

    # Split text into chunks
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len
    )
    chunks = text_splitter.split_text(text)

    # Generate embeddings and store in Qdrant
    for i, chunk in enumerate(chunks):
        embedding = model.encode(chunk)
        
        client.upsert(
            collection_name='documents',
            points=[
                models.PointStruct(
                    id=str(uuid.uuid4()),  # Using UUID for unique point IDs
                    vector=embedding.tolist(),
                    payload={
                        'text': chunk,
                        'source': original_filename,  # Store original filename instead of hashed name
                        'chunk_index': i  # Store chunk index for potential ordering
                    }
                )
            ]
        ) 