"""
TODO:
    1. Create prompt for code analysis based on diffs and other information available in probot.
        - diffs -> DONE
        - README?
        - Other linked code (package-level imports etc.)?
    2. Create Pydantic model for structured output. -> DONE
    3. Create a structured output model invocation. -> DONE
        - Gemini: https://ai.google.dev/gemini-api/docs/structured-output?lang=python
"""

import os
from pydantic import BaseModel, Field
from fastapi import HTTPException
from fastapi.routing import APIRouter
from google import genai

code_summarization_app = APIRouter()


class StructuredSummary(BaseModel):
    code_functionality_and_business_logic: str = Field(
        ...,
        description="Core business functionality and impact on the product.")
    code_structure_and_modularity: str = Field(
        ..., description="Code organization, modularity, and design patterns.")
    performance_and_scalability: str = Field(
        ...,
        description="Performance analysis, scalability, and bottleneck identification.")
    variables_data_types_and_data_integrity: str = Field(
        ...,
        description="Data handling, validation, and integrity mechanisms.")
    error_handling_and_user_impact: str = Field(
        ...,
        description="Error handling and its impact on user experience.")
    code_efficiency_for_product_use_cases: str = Field(
        ...,
        description="Optimization opportunities in product use cases.")
    readability_maintainability_and_collaboration: str = Field(
        ...,
        description="Code readability, maintainability, and collaboration ease.")
    testing_validation_and_product_requirements: str = Field(
        ...,
        description="Testing coverage and alignment with product needs.")
    external_dependencies_and_integration: str = Field(
        ...,
        description="External dependencies and integration within the tech stack.")
    security_considerations_in_context_of_product_use: str = Field(
        ...,
        description="Security risks and compliance with security best practices.")
    compliance_and_regulatory_requirements: str = Field(
        ...,
        description="Compliance with relevant regulations and legal requirements.")
    code_standards_and_best_practices: str = Field(
        ..., description="Adherence to coding standards and best practices.")


class PRModel(BaseModel):
    diffs: str


@code_summarization_app.post("/summarize", response_model=StructuredSummary)
async def generate_code_summary(pr_data: PRModel) -> StructuredSummary:
    prompt = f"""
    Analyze the provided code diff and return a structured JSON summary focusing on:

    - Core business functionality and how the code contributes to the product.
    - Code structure, modularity, and maintainability.
    - Performance and scalability, identifying bottlenecks.
    - Data handling, validation, and integrity mechanisms.
    - Error handling and user impact.
    - Efficiency in product use cases.
    - Readability, maintainability, and team collaboration.
    - Testing coverage and adherence to product requirements.
    - External dependencies and their role in integration.
    - Security concerns in the context of product use.
    - Compliance with regulatory requirements.
    - Adherence to coding standards and best practices.

    Here is the code diff:
    {pr_data.diffs}
    """
    print(pr_data.diffs)

    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
    response = client.models.generate_content(
        model="gemini-1.5-pro-latest",
        contents=prompt,
        config={"response_mime_type": "application/json", "response_schema": StructuredSummary},
    )
    return response.parsed
