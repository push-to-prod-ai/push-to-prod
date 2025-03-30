import numpy as np
from fastapi import FastAPI
from sentence_transformers import SentenceTransformer

from .data_models.jira import JiraIssues
from .data_models.calculation import CalculationRequestModel, CalculationResponseModel
blast_radius_calculation_sub_app = FastAPI()
model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')


@blast_radius_calculation_sub_app.post("/calculation", response_model=CalculationResponseModel)
def calculate_blast_radius(request: CalculationRequestModel):
    threshold = 0.5

    # TODO: add batching
    # batch_size = 1024
    # batch_number = 0

    issues = JiraIssues().get_all()

    if len(issues) == 0:
        return CalculationResponseModel(relevant_issues=[])

    issues_strs = [i.textual_representation for i in issues]


    summary_embedding = model.encode([request.summary])
    issues_embeddings = model.encode(issues_strs)

    summary_embedding = summary_embedding / np.linalg.norm(summary_embedding, axis=1, keepdims=True)
    issues_embeddings = issues_embeddings / np.linalg.norm(issues_embeddings, axis=1, keepdims=True)

    similarities = model.similarity_pairwise(summary_embedding, issues_embeddings).numpy()

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
