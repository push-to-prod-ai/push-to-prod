import os
from pydantic import BaseModel, Field
from fastapi.routing import APIRouter
from google import genai

product_requirements_app = APIRouter()


class ProductRequirementsSummary(BaseModel):
    core_business_functionality: str = Field(
        ...,
        description="Defines the core business needs and expected value of the product."
    )
    structural_and_modular_requirements: str = Field(
        ...,
        description="Specifies architectural and modular expectations for long-term maintainability."
    )
    performance_and_scalability_criteria: str = Field(
        ...,
        description="Outlines performance benchmarks and expected scalability requirements."
    )
    data_handling_and_integrity: str = Field(
        ...,
        description="Specifies data validation, integrity, and compliance needs."
    )
    error_handling_and_user_experience: str = Field(
        ...,
        description="Defines expected behaviors for error handling and user impact mitigation."
    )
    efficiency_requirements_for_product_use_cases: str = Field(
        ...,
        description="Details efficiency benchmarks specific to product operations."
    )
    readability_maintainability_and_team_adoption: str = Field(
        ...,
        description="Outlines best practices for maintainability and cross-team usability."
    )
    testing_and_validation_criteria: str = Field(
        ...,
        description="Lists testing standards and validation requirements."
    )
    external_dependencies_and_integrations: str = Field(
        ...,
        description="Specifies dependencies and expected integrations with other services."
    )
    security_standards_and_threat_mitigation: str = Field(
        ...,
        description="Defines security expectations and measures for risk mitigation."
    )
    compliance_and_regulatory_considerations: str = Field(
        ...,
        description="Outlines regulatory constraints and compliance measures (e.g., GDPR, HIPAA)."
    )
    adherence_to_standards_and_best_practices: str = Field(
        ...,
        description="Ensures alignment with industry standards and best practices."
    )


class PRModel(BaseModel):
    requirements: str  # Now represents product requirements document


@product_requirements_app.post(path='/summarize', response_model=ProductRequirementsSummary)
async def generate_requirements_summary(pr_data: PRModel) -> ProductRequirementsSummary:
    prompt = f"""
        Analyze the following product requirements document and return a structured JSON output 
        summarizing key expectations in the following categories:

        - Core Business Functionality: Define the core business needs and expected value the product must deliver.
        - Structural & Modular Requirements: Outline expectations for product modularity, architecture, and maintainability.
        - Performance & Scalability: Specify performance benchmarks and scalability requirements.
        - Data Handling & Integrity: Define data validation, integrity checks, and compliance needs.
        - Error Handling & User Experience: Establish how errors should be managed and their impact on users.
        - Efficiency Requirements for Product Use Cases: Highlight efficiency expectations for core product operations.
        - Readability, Maintainability & Team Adoption: Detail best practices for maintainability and cross-team usability.
        - Testing & Validation Criteria: Define required test coverage and validation strategies.
        - External Dependencies & Integrations: Identify necessary integrations and external dependencies.
        - Security Standards & Threat Mitigation: Describe security measures and risk mitigation strategies.
        - Compliance & Regulatory Considerations: Specify any legal or compliance requirements (e.g., GDPR, HIPAA).
        - Adherence to Standards & Best Practices: Outline coding and product development best practices.

        Expected Output Format:
        {{
            "core_business_functionality": "...",
            "structural_and_modular_requirements": "...",
            "performance_and_scalability_criteria": "...",
            "data_handling_and_integrity": "...",
            "error_handling_and_user_experience": "...",
            "efficiency_requirements_for_product_use_cases": "...",
            "readability_maintainability_and_team_adoption": "...",
            "testing_and_validation_criteria": "...",
            "external_dependencies_and_integrations": "...",
            "security_standards_and_threat_mitigation": "...",
            "compliance_and_regulatory_considerations": "...",
            "adherence_to_standards_and_best_practices": "..."
        }}

        Here is the product requirements document:
        {pr_data.requirements}
    """

    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
    response = client.models.generate_content(
        model='gemini-2.0-flash',
        contents=prompt,
        config={
            'response_mime_type': 'application/json',
            'response_schema': ProductRequirementsSummary,
        },
    )

    return response.parsed
