from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBasic, HTTPBasicCredentials
import os
from dotenv import load_dotenv
from typing import List, Optional, Dict
import secrets

from auth import verify_credentials
from ingest import process_document
from qa import get_answer

# Load environment variables
load_dotenv()

app = FastAPI(title="HR Onboarding Assistant")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite's default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBasic()

# Create uploads directory if it doesn't exist
os.makedirs("uploads", exist_ok=True)

@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    credentials: HTTPBasicCredentials = Depends(security)
):
    """Admin-only endpoint for uploading documents"""
    if not verify_credentials(credentials):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Basic"},
        )
    
    if not file.filename.lower().endswith(('.pdf', '.docx')):
        raise HTTPException(
            status_code=400,
            detail="Only PDF and DOCX files are allowed"
        )
    
    # Store original filename
    original_filename = file.filename
    
    # Generate a secure filename for storage
    file_extension = os.path.splitext(file.filename)[1]
    secure_filename = f"{secrets.token_hex(16)}{file_extension}"
    file_path = os.path.join("uploads", secure_filename)
    
    # Save the file
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    # Process the document
    try:
        await process_document(file_path, original_filename)
        return {"message": "File uploaded and processed successfully"}
    except Exception as e:
        os.remove(file_path)  # Clean up the file if processing fails
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/qa")
async def answer_question(
    body: Dict[str, str] = Body(...)
):
    """Public endpoint for asking questions"""
    if "question" not in body:
        raise HTTPException(
            status_code=400,
            detail="Request body must include 'question' field"
        )
    
    try:
        answer, citations = await get_answer(body["question"])
        return {
            "answer": answer,
            "citations": citations
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 