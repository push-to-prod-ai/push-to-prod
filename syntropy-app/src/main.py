from fastapi import FastAPI
from fastapi.routing import APIRouter

from .components.code_summarizer import code_summarization_app
from .components.requirements_summarizer import product_requirements_app

app = FastAPI()

# Create a router to group both functionalities under `/syntropy`
syntropy_router = APIRouter()

# Include the routes from both applications
syntropy_router.include_router(code_summarization_app, prefix="/code", tags=["Code Summarization"])
syntropy_router.include_router(product_requirements_app, prefix="/requirements", tags=["Product Requirements"])


# Mount the combined router under `/syntropy`
app.include_router(syntropy_router, prefix="/syntropy")

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/")
async def root():
    return {"message": "Syntropy API is running"}