from contextlib import asynccontextmanager

import numpy as np
from fastapi import FastAPI, Request
from sentence_transformers import SentenceTransformer

from data_models.jira import JiraIssues


model_callable = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.model = SentenceTransformer('all-MiniLM-L6-v2')
    yield
    app.state.model = None


blast_radius_calculation_sub_app = FastAPI(lifespan=lifespan)


@blast_radius_calculation_sub_app.post("/calculation")
def calculate_blast_radius(request: Request, input_data: TextInput):

    model = request.app.state.model

    threshold = 0.5

    summary = 'This code connects the GitHub repo to Jira.'
    issues = JiraIssues().get_all()
    issues_strs = [i.textual_representation for i in issues]

    summary_embedding = model.encode([summary])
    issues_embeddings = model.encode(issues_strs)

    similarities = model.similarity_pairwise(summary_embedding, issues_embeddings).numpy()

    indices = np.where(similarities >= threshold)[0]
    relevant_issues = [issues[i] for i in indices]

    print('Code summary:', summary)
    print('Relevant Issues:')
    for r in relevant_issues:
        print('   -', r.key, r.summary, r.URL)

    return relevant_issues


calculate_blast_radius()
