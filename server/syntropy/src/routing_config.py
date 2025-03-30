import os

prod_urls = {
    "blastRadius": "https://blast-radius-620323149335.us-central1.run.app"
}

dev_urls = {
    "blastRadius": "http://localhost:8081"
}

def get_blast_radius_api_url():
    if os.getenv("ENV_TYPE") == "dev":
        return dev_urls["blastRadius"]
    else:
        return prod_urls["blastRadius"]