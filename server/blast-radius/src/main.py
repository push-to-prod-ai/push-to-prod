from fastapi import FastAPI
from .calculate import blast_radius_calculation_sub_app

app = FastAPI()

app.mount("/blast-radius", blast_radius_calculation_sub_app)

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/")
async def root():
    return {"message": "Blast Radius API is running"}