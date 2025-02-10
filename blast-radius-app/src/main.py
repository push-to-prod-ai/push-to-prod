from fastapi import FastAPI

from src.blast_radius.calculate import blast_radius_calculation_sub_app

app = FastAPI()

app.mount("/blast-radius", blast_radius_calculation_sub_app)
