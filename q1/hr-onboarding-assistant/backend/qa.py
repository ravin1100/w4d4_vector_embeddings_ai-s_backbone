import os
from typing import Tuple, List
import google.generativeai as genai
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from dotenv import load_dotenv

load_dotenv()

# Initialize clients
model = SentenceTransformer('all-MiniLM-L6-v2')
qdrant_client = QdrantClient(
    host=os.getenv("QDRANT_HOST", "localhost"),
    port=int(os.getenv("QDRANT_PORT", 6333))
)

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model_gemini = genai.GenerativeModel('gemini-1.5-flash')

async def get_answer(question: str) -> Tuple[str, List[str]]:
    """
    Get answer for a question using RAG pipeline
    Returns: (answer, list of citations)
    """
    # Generate embedding for the question
    question_embedding = model.encode(question)

    # Search for relevant chunks
    search_results = qdrant_client.search(
        collection_name="documents",
        query_vector=question_embedding.tolist(),
        limit=3
    )

    # Extract relevant texts and their sources
    context_chunks = []
    citations = []
    
    for result in search_results:
        context_chunks.append(result.payload["text"])
        if result.payload["source"] not in citations:
            citations.append(result.payload["source"])

    # Prepare prompt for Gemini
    prompt = f"""Based on the following context, answer the question. If the answer cannot be found in the context, say "I cannot find an answer to this question in the available documents."

Context:
{' '.join(context_chunks)}

Question: {question}

Answer:"""

    # Generate response
    response = model_gemini.generate_content(prompt)
    
    return response.text, citations 