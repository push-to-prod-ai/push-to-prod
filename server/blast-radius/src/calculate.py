from pydantic import BaseModel
import numpy as np
from fastapi import FastAPI, Header, HTTPException
from sentence_transformers import SentenceTransformer

from .data_models.jira import JiraIssues
from .data_models.calculation import CalculationRequestModel, CalculationResponseModel


blast_radius_calculation_sub_app = FastAPI()
model = SentenceTransformer('all-MiniLM-L6-v2')


@blast_radius_calculation_sub_app.post("/calculation")
async def calculate_blast_radius(
    request: CalculationRequestModel,  # Receive the body as the CalculationRequestModel
    authorization: str = Header(None),  # The Authorization header
    jira_url: str = Header(None)  # Custom Jira URL header
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token")

    if not jira_url:
        raise HTTPException(status_code=400, detail="Jira URL is missing")

    # Your logic with the summary and Jira URL
    issues = JiraIssues(jira_url=jira_url).get_all(headers={"Authorization": authorization})

    issues_strs = [i.textual_representation for i in issues]

    summary_embedding = model.encode([request.summary])
    issues_embeddings = model.encode(issues_strs)

    similarities = model.similarity_pairwise(summary_embedding, issues_embeddings).numpy()

    threshold = 0.7
    indices = np.where(similarities >= threshold)[0]
    relevant_issues = [issues[i] for i in indices][:request.max_items]

    # Below is logic for handling when there are 0 "relevant" issues.
    # So instead of pushing directly to Jira, maybe these will be sent to the PR conversation?

    print('Code summary:', request.summary)
    if len(relevant_issues) > 0:
        print('Relevant Issues:')
        for r in relevant_issues:
            print('   -', r.key, r.summary, r.URL)

    else:
        top_indices = np.argsort(similarities)[::-1][:request.max_items]  # in descending order
        most_similar_issues = [issues[i] for i in top_indices]

        print(f'No relevant issues found. Returning the top {request.max_items} most similar issues:')
        for issue in most_similar_issues:
            print(f'   - {issue.key} {issue.summary} {issue.URL}')

    return CalculationResponseModel(relevant_issues=relevant_issues)
