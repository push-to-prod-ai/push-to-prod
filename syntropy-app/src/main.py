from fastapi import FastAPI

from components.code_summarizer import code_summarization_app

app = FastAPI()

app.mount("/syntropy", code_summarization_app)

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/")
async def root():
    return {"message": "Syntropy API is running"}