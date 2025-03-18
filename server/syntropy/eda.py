import csv
import os
import json
import time

import requests

# Define API endpoints
CODE_SUMMARIZATION_URL = "http://localhost:8080/syntropy/code/summarize"
REQUIREMENTS_SUMMARIZATION_URL = "http://localhost:8080/syntropy/requirements/summarize"
COMPARISON_SUMMARIZATION_URL = "http://localhost:8080/syntropy/comparison/summarize"

# Create results directory
RESULTS_DIR = "dataset_results"
os.makedirs(RESULTS_DIR, exist_ok=True)

# Check if dataset pair has already been processed

def is_already_processed(dp_id):
    result_dir = os.path.join(RESULTS_DIR, str(dp_id))
    return os.path.exists(result_dir)


# Load CSV and process each row
with open("dataset.csv", "r", newline='', encoding='utf-8') as file:
    reader = csv.DictReader(file)
    for row in reader:
        print(row.keys())
        if not "Dataset Pair ID" in row.keys():
            continue
        dataset_pair_id = row["Dataset Pair ID"]
        code_block = row["Code Block(s)"]
        requirements = row["Requirements"]

        if is_already_processed(dataset_pair_id):
            print(f"Skipping already processed Dataset Pair ID: {dataset_pair_id}")
            continue

        # Create a directory for each dataset_pair_id
        result_path = os.path.join(RESULTS_DIR, dataset_pair_id)
        os.makedirs(result_path, exist_ok=True)

        print('Hitting the code summarization endpoint...')
        # Hit the code summarization endpoint
        code_response = requests.post(CODE_SUMMARIZATION_URL, json={"diffs": code_block})
        code_summary = code_response.json()
        with open(os.path.join(result_path, "code_summarization.json"), "w", encoding='utf-8') as f:
            json.dump(code_summary, f, indent=2)

        print('Done.')

        print('Hitting the requirements summarization endpoint...')
        # Hit the requirements summarization endpoint
        requirements_response = requests.post(REQUIREMENTS_SUMMARIZATION_URL, json={"requirements": requirements})
        requirements_summary = requirements_response.json()
        with open(os.path.join(result_path, "requirements_summarization.json"), "w", encoding='utf-8') as f:
            json.dump(requirements_summary, f, indent=2)

        print('Done.')

        print('Hitting the comparison summarization endpoint...')
        # Hit the comparison summarization endpoint
        comparison_response = requests.post(
            COMPARISON_SUMMARIZATION_URL,
            json={
                "code_summary": code_summary,
                "requirements_summary": requirements_summary
            }
        )
        comparison_summary = comparison_response.json()
        with open(os.path.join(result_path, "comparison_summarization.json"), "w", encoding='utf-8') as f:
            json.dump(comparison_summary, f, indent=2)

        print('Done.')

        time.sleep(5)

print("Processing complete.")
