from fastapi import FastAPI
import uvicorn

from blast_radius.calculate import blast_radius_calculation_sub_app

app = FastAPI()

app.mount("/blast-radius", blast_radius_calculation_sub_app)

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
