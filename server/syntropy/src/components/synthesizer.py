import os
from fastapi import APIRouter
from pydantic import BaseModel, Field
from google import genai

from .requirements_summarizer import ProductRequirementsSummary
from .code_summarizer import StructuredSummary

comparison_app = APIRouter()

class ComparisonCategory(BaseModel):
    did_right: str = Field(..., description="Aspects where the code meets requirements.")
    did_wrong: str = Field(..., description="Aspects where the code fails to meet requirements.")
    ambiguous: str = Field(..., description="Aspects where it is unclear if the requirement is met.")

class ComparisonSummary(BaseModel):
    core_business_functionality: ComparisonCategory
    structural_and_modular_requirements: ComparisonCategory
    performance_and_scalability_criteria: ComparisonCategory
    data_handling_and_integrity: ComparisonCategory
    error_handling_and_user_experience: ComparisonCategory
    efficiency_requirements_for_product_use_cases: ComparisonCategory
    readability_maintainability_and_team_adoption: ComparisonCategory
    testing_and_validation_criteria: ComparisonCategory
    external_dependencies_and_integrations: ComparisonCategory
    security_standards_and_threat_mitigation: ComparisonCategory
    compliance_and_regulatory_considerations: ComparisonCategory
    adherence_to_standards_and_best_practices: ComparisonCategory

@comparison_app.post("/summarize", response_model=ComparisonSummary)
def compare_with_llm(
        code_summary: StructuredSummary,
        requirements_summary: ProductRequirementsSummary
) -> ComparisonSummary:
    """Sends both summaries to the LLM for a structured comparison."""
    prompt = f"""
    Given the following product requirements and the corresponding code implementation summaries, 
    analyze each category and classify the findings into:

    - ✅ Did Right: Aspects where the code meets or exceeds the requirement.
    - ❌ Did Wrong: Aspects where the code fails to meet the requirement.
    - 🤷 Ambiguous: Areas where it's unclear if the code meets the requirement.

    Respond in a structured JSON format.

    Example Input:
    **Product Requirements:** {{"core_business_functionality": "...", ...}}
    **Code Implementation:** {{"core_business_functionality": "...", ...}}

    Example Output:
    {{
        "core_business_functionality": {{
            "did_right": "...",
            "did_wrong": "...",
            "ambiguous": "..."
        }},
        ...
    }}

    **Product Requirements:** {requirements_summary}
    **Code Implementation:** {code_summary}
    """

    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
    response = client.models.generate_content(
        model='gemini-2.0-flash',
        contents=prompt,
        config={
            'response_mime_type': 'application/json',
            'response_schema': ComparisonSummary,
        },
    )
    return response.parsed
