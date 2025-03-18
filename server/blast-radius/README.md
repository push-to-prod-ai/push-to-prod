# Blast Radius Service

A microservice that calculates the potential impact radius of code changes by analyzing semantic similarity between code summaries and Jira issues.

## Local Development Setup

### Prerequisites

- Python 3.12 or higher
- Poetry (Python package manager)

### Installation

1. Install Poetry if you haven't already:
```bash
curl -sSL https://install.python-poetry.org | python3 -
```

2. Clone the repository and navigate to the blast-radius-app directory:
```bash
cd blast-radius-app
```

3. Install dependencies using Poetry:
```bash
poetry install
```

4. Activate the virtual environment:
```bash
poetry env activate
```

### Running the Service Locally

Start the FastAPI server using Uvicorn:
```bash
poetry run uvicorn src.main:app --reload --host 0.0.0.0 --port 8080
```

The API will be available at `http://localhost:8080`

### API Documentation

Once running, you can access:
- Interactive API docs (Swagger UI): `http://localhost:8080/docs`
- OpenAPI specification: `http://localhost:8080/openapi.json`

## Docker Support

### Building the Docker Image

```bash
docker build -t blast-radius .
```

### Running the Container

```bash
docker run -p 8080:8080 blast-radius
```

The service will be available at `http://localhost:8080`

## API Endpoints

### POST /blast-radius/calculation

Calculate the blast radius for a code change.

Request body:
```json
{
    "summary": "Your code change summary",
    "max_items": 20
}
```

Response:
```json
{
    "relevant_issues": [
        // List of related Jira issues
    ]
}
```

## Environment Variables

- `JIRA_EMAIL`: Jira account email
- `JIRA_API_TOKEN`: Jira API token
- `PRIVATE_KEY`: Private key for authentication

## Deployment

The service is automatically deployed to Google Cloud Run via Cloud Build. See `cloudbuild.yaml` in the root directory for deployment configuration.
