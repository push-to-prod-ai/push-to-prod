import numpy as np
from fastapi import FastAPI
from sentence_transformers import SentenceTransformer
import structlog
from .data_models.jira import JiraIssues
from .data_models.calculation import CalculationRequestModel, CalculationResponseModel


logger = structlog.getLogger(__name__)
blast_radius_calculation_sub_app = FastAPI()
model = SentenceTransformer('all-MiniLM-L6-v2')


@blast_radius_calculation_sub_app.post("/calculation")
async def calculate_blast_radius(
    request: CalculationRequestModel,  # Receive the body as the CalculationRequestModel
):
    # Your logic with the summary and Jira URL
    issues = JiraIssues().get_all()

    issues_strs = [i.textual_representation for i in issues]

    summary_embedding = model.encode([request.summary])
    issues_embeddings = model.encode(issues_strs)

    similarities = model.similarity_pairwise(summary_embedding, issues_embeddings).numpy()

    threshold = 0.7
    indices = np.where(similarities >= threshold)[0]
    relevant_issues = [issues[i] for i in indices][:request.max_items]

    # Below is logic for handling when there are 0 "relevant" issues.
    # So instead of pushing directly to Jira, maybe these will be sent to the PR conversation?

    logger.info('Code summary', summary_contents=request.summary)
    if len(relevant_issues) > 0:
        logger.info('Relevant Issues are present.', num_issues=len(relevant_issues))
        for r in relevant_issues:
            logger.info(f'   - {r.key}, {r.summary}, {r.URL}')

    else:
        top_indices = np.argsort(similarities)[::-1][:request.max_items]  # in descending order
        most_similar_issues = [issues[i] for i in top_indices]

        logger.info(f'No relevant issues found. Returning the top {request.max_items} most similar issues:')
        for issue in most_similar_issues:
            logger.info(f'   - {issue.key} {issue.summary} {issue.URL}')
            return CalculationResponseModel(relevant_issues=most_similar_issues)

    return CalculationResponseModel(relevant_issues=relevant_issues)
