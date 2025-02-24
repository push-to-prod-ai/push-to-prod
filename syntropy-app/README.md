# The Syntropy Application

## Prologue

### Background
The word *syntropy* comes from the Greek roots:

- syn- (συν-) meaning "together" or "with"
- -tropy (τροπή) meaning "turning" or "change"

It was originally introduced in scientific contexts as the opposite of entropy. While entropy describes disorder or 
dissipation in a system, syntropy has been used to refer to processes of order, organization, and convergence. The 
term gained traction in fields like biology, systems theory, and even physics, often in the context of 
self-organizing systems and life processes.

It was notably popularized by the Italian mathematician Luigi Fantappiè in the 1940s when he explored its implications 
in quantum mechanics and relativity.

### The Application
The Syntropy Application leverages AI to seamlessly align code with product requirements, transforming development 
chaos into structured, coherent execution.

## Using the application

### Requirements

The application can be set up in two ways: Poetry or Docker. Docker is the preferred method to maintain consistency 
across platforms.

#### Poetry
To use the application with poetry, ensure you have poetry 2 and python 3.12 (or greater) downloaded. You can run this line in your shell.
```bash
curl -sSL https://install.python-poetry.org | python3 - --version 2.0.1
```

Then you can simply run `poetry install` to initialize your poetry virtual environment.

#### Docker

Ensure you have Docker Client (27.5.1) and Docker Desktop (4.38.0) installed (if on MacOS), or any compatible version 
of each.

You can check your docker version with `docker version` in your shell.

#### Gemini (or latest LLM in use) API Key
Be sure to set your `GEMINI_API_KEY` in your shell, replace the empty quotes with your key. You can generate an API 
key here: https://ai.google.dev/gemini-api/docs/api-key
```bash
export GEMINI_API_KEY=""
```

### Running the FastAPI

#### Poetry
If you are using Poetry, you can start a local instance of the FastAPI by running the following command in your shell:
```bash
poetry run uvicorn src.main:app --host 127.0.0.1 --port 8080
```

#### Docker
If you are using Docker, you can start a local instance of the FastAPI by running the following commands in your shell:

*Build the Image*
```bash
docker build --pull -t syntropy-app .
```

*Start the container*

Ensure that your `GEMINI_API_KEY` is sent to the container, by either passing `-e GEMINI_API_KEY` or specifying an
environment variables file (e.g. `.env`).

Running with exported variable:
```bash
docker run -p 8080:8080 -e GEMINI_API_KEY syntropy-app
```

...or running with `.env` file. (Ensure that your `.env` file is in the repository you're running from!)
```bash
docker run -p 8080:8080 --env-file .env syntropy-app
```

### Available Endpoints
If you followed the above instructions you should have a local FastAPI instance available to you running on 
`http://127.0.0.1:8080`

- */*
  - This is the root endpoint of the FastAPI. Nothing to do here.
- */health* (GET)
  - This is the endpoint to get a healthcheck of the application.
- */syntropy/code/summarize* (POST)
  - This endpoint requires a json-structured POST request.
  - You can pass a json with the following variables.
    - *diffs* : string of the diffs from a Pull Request. (Can also just be a code chunk.)
    - Sample curl request. Uses `jq` and a `sample_code.txt` file
    ```bash 
    jq -Rs '{diffs: .}' < sample_code.txt | curl -X 'POST' \
    'http://localhost:8080/syntropy/code/summarize' \
    -H 'Content-Type: application/json' \
    -d @- | jq
    ```
    - The response will yield the following variables in a json-structured output similar to this example:
    ```json
    {
        "code_functionality_and_business_logic": "Handles user authentication and session management.",
        "code_structure_and_modularity": "Follows MVC architecture with reusable components.",
        "performance_and_scalability": "Optimized query execution; scales horizontally.",
        "variables_data_types_and_data_integrity": "Strict type enforcement and validation in API inputs.",
        "error_handling_and_user_impact": "Graceful error messages; logs unexpected failures.",
        "code_efficiency_for_product_use_cases": "Uses caching to reduce redundant computations.",
        "readability_maintainability_and_collaboration": "Well-documented functions with clear naming conventions.",
        "testing_validation_and_product_requirements": "80% test coverage with unit and integration tests.",
        "external_dependencies_and_integration": "Relies on PostgreSQL and Redis for data storage.",
        "security_considerations_in_context_of_product_use": "Implements OAuth2 for authentication and authorization.",
        "compliance_and_regulatory_requirements": "Ensures GDPR compliance by encrypting user data.",
        "code_standards_and_best_practices": "Follows PEP 8 and internal coding guidelines."
    }
    ```
- */syntropy/requirements/summarize* (POST)
  - This endpoint requires a json-structured POST request.
  - You can pass a json with the following variables.
    - *requirements* : string of the requirements for the code.
    - Sample curl request.
    ```bash 
    curl -X 'POST' \
    'http://localhost:8080/syntropy/requirements/summarize' \
    -H 'Content-Type: application/json' \
    -d '{"requirements": "users need to log into a platform and run a calculation"}' | jq
    ```
  - The response will yield the following variables in a json-structured output similar to this example:
    ```json
    {
      "core_business_functionality": "User authentication and role-based access control.",
      "structural_and_modular_requirements": "Must support plugin-based extensions for new features.",
      "performance_and_scalability_criteria": "API response times under 200ms; handles 10k concurrent users.",
      "data_handling_and_integrity": "Must ensure ACID compliance for database transactions.",
      "error_handling_and_user_experience": "User-friendly error messages with retry mechanisms.",
      "efficiency_requirements_for_product_use_cases": "Optimized performance for high-volume transactions.",
      "readability_maintainability_and_team_adoption": "Clear documentation and modular design.",
      "testing_and_validation_criteria": "Automated tests covering 90%+ of code paths.",
      "external_dependencies_and_integrations": "Must integrate with third-party payment gateways.",
      "security_standards_and_threat_mitigation": "Enforce OWASP best practices for security.",
      "compliance_and_regulatory_considerations": "Must comply with GDPR and HIPAA regulations.",
      "adherence_to_standards_and_best_practices": "Follows ISO 27001 security best practices."
    }
    ```
- */syntropy/comparison/summarize* (POST)
  - This endpoint requires a json-structured POST request.
  - You can pass a json with the following variables.
  - *code_summary* : a json-structure that matches the output of the `/syntropy/code/summarize` endpoint.
  - *requirements_summary* : a json-structure that matches the output of the `/syntropy/requirements/summarize` endpoint.
  - Here is a sample curl request, assuming `code_summary.json` and `requirements_summary.json` exist:
  ```bash
  jq -s '{code_summary: .[0], requirements_summary: .[1]}' code_summary.json requirements_summary.json | curl -X 'POST' \
  'http://localhost:8080/syntropy/comparison/summarize' \
  -H 'Content-Type: application/json' \
  -d @- | jq
  ```
  - The response will yield the following variables in a json-structured output similar to this example:
  ```json
  {
    "core_business_functionality": {
      "did_right": "Handles user authentication and session management aligns with user authentication requirement.",
      "did_wrong": "Role-based access control is not explicitly mentioned in the code implementation.",
      "ambiguous": "It is unclear if session management sufficiently covers all aspects of role-based access control."
    },
    "structural_and_modular_requirements": {
      "did_right": "MVC architecture with reusable components supports modular design.",
      "did_wrong": "Explicit plugin-based extension support is not mentioned.",
      "ambiguous": "Whether the MVC structure facilitates easy plugin extensions is unclear without more details."
    },
    "performance_and_scalability_criteria": {
      "did_right": "Optimized query execution and horizontal scaling support the scalability requirement.",
      "did_wrong": "API response times of under 200ms and handling 10k concurrent users are not explicitly addressed.",
      "ambiguous": "It's ambiguous if query optimization and horizontal scaling are sufficient to meet the specific performance metrics."
    },
    "data_handling_and_integrity": {
      "did_right": "Strict type enforcement and validation align with data integrity.",
      "did_wrong": "ACID compliance for database transactions is not explicitly mentioned.",
      "ambiguous": "It is unclear if strict type enforcement inherently guarantees ACID compliance."
    },
    "error_handling_and_user_experience": {
      "did_right": "Graceful error messages address user-friendly error messages.",
      "did_wrong": "Retry mechanisms are not explicitly mentioned.",
      "ambiguous": "It is unclear if the error handling includes retry mechanisms."
    },
    "efficiency_requirements_for_product_use_cases": {
      "did_right": "Caching reduces redundant computations, improving performance.",
      "did_wrong": "No specific mention of optimization for high-volume transactions.",
      "ambiguous": "It is unclear if caching strategies are optimized for high-volume transactions."
    },
    "readability_maintainability_and_team_adoption": {
      "did_right": "Well-documented functions and clear naming conventions support readability and maintainability.",
      "did_wrong": "Team adoption aspects are not addressed.",
      "ambiguous": "It is unclear whether the documentation and naming conventions are sufficient for easy team adoption."
    },
    "testing_and_validation_criteria": {
      "did_right": "Unit and integration tests contribute to testing and validation.",
      "did_wrong": "80% test coverage is below the required 90%+",
      "ambiguous": "The type of tests performed are unclear."
    },
    "external_dependencies_and_integrations": {
      "did_right": "PostgreSQL and Redis are external dependencies.",
      "did_wrong": "Third-party payment gateway integration is not explicitly addressed.",
      "ambiguous": "It is unclear if there is support for the specific external dependency of third-party payment gateways."
    },
    "security_standards_and_threat_mitigation": {
      "did_right": "OAuth2 for authentication and authorization enhances security.",
      "did_wrong": "OWASP best practices are not explicitly mentioned.",
      "ambiguous": "It is unclear if OAuth2 implementation fully adheres to OWASP best practices."
    },
    "compliance_and_regulatory_considerations": {
      "did_right": "GDPR compliance is ensured via user data encryption.",
      "did_wrong": "HIPAA compliance is not explicitly addressed.",
      "ambiguous": "It is unclear how fully GDPR is achieved via encryption."
    },
    "adherence_to_standards_and_best_practices": {
      "did_right": "PEP 8 and internal coding guidelines are followed.",
      "did_wrong": "ISO 27001 security best practices are not explicitly mentioned.",
      "ambiguous": "It is unclear if following PEP 8 and internal guidelines implies ISO 27001 adherence."
    }
  }
  ```