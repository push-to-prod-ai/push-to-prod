import numpy as np
from fastapi import FastAPI
from sentence_transformers import SentenceTransformer

from data_models.jira import JiraIssues
from data_models.calculation import CalculationRequestModel, CalculationResponseModel


blast_radius_calculation_sub_app = FastAPI()
model = SentenceTransformer('all-MiniLM-L6-v2')


@blast_radius_calculation_sub_app.post("/calculation")
def calculate_blast_radius(request: CalculationRequestModel):
    threshold = 0.5

    # TODO: add batching
    # batch_size = 1024
    # batch_number = 0

    issues = JiraIssues().get_all()
    issues_strs = [i.textual_representation for i in issues]

    summary_embedding = model.encode([request.summary])
    issues_embeddings = model.encode(issues_strs)

    similarities = model.similarity_pairwise(summary_embedding, issues_embeddings).numpy()

    indices = np.where(similarities >= threshold)[0]
    relevant_issues = [issues[i] for i in indices][:request.max_items]

    print('Code summary:', request.summary)
    print('Relevant Issues:')
    for r in relevant_issues:
        print('   -', r.key, r.summary, r.URL)

    return CalculationResponseModel(relevant_issues=relevant_issues)
