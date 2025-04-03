import os
from fastapi import FastAPI
from src.calculate import blast_radius_calculation_sub_app

app = FastAPI()

app.mount("/blast-radius", blast_radius_calculation_sub_app)

if os.getenv("ENV_TYPE") == "dev":
    from fastapi.middleware.cors import CORSMiddleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:8082"],  # Update with the correct origin for dev / prod
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/")
async def root():
    return {"message": "Blast Radius API is running"}