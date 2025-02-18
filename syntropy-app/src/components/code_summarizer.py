"""
TODO:
    1. Create prompt for code analysis based on diffs and other information available in probot.
        - diffs
        - README?
        - Other linked code (package-level imports etc.)?
    2. Create Pydantic model for structured output.
    3. Create a structured output model invocation.
        - Gemini: https://ai.google.dev/gemini-api/docs/structured-output?lang=python
"""

import os
from pydantic import BaseModel, Field
from fastapi import FastAPI
from google import genai

code_summarization_app = FastAPI()

class StructuredSummary(BaseModel):
    code_functionality_and_business_logic: str = Field(
        ...,
        description="Description of the core business functionality and how the code contributes to the product's goal or user experience.")
    code_structure_and_modularity: str = Field(
        ...,
        description="Description of the code's organization, modularity, and design patterns or reusable components.")
    performance_and_scalability: str = Field(
        ...,
        description="Analysis of performance, scalability, and identification of any potential bottlenecks or improvements.")
    variables_data_types_and_data_integrity: str = Field(
        ...,
        description="Description of the variables and data types used, focusing on data handling, validation, and integrity.")
    error_handling_and_user_impact: str = Field(
        ...,
        description="Explanation of error handling mechanisms and their impact on the user experience.")
    code_efficiency_for_product_use_cases: str = Field(
        ...,
        description="Evaluation of code efficiency in product use cases, highlighting areas for optimization.")
    readability_maintainability_and_collaboration: str = Field(
        ...,
        description="Assessment of readability and maintainability, and how easy it is for the team to collaborate on the codebase.")
    testing_validation_and_product_requirements: str = Field(
        ...,
        description="Discussion of testing coverage and how the code meets product requirements.")
    external_dependencies_and_integration: str = Field(
        ...,
        description="List of external dependencies and integration with the product's technical stack.")
    security_considerations_in_context_of_product_use: str = Field(
        ...,
        description="Analysis of security concerns and how the code ensures product security standards.")
    compliance_and_regulatory_requirements: str = Field(
        ...,
        description="Assessment of whether the code complies with relevant regulatory or legal standards.")
    code_standards_and_best_practices: str = Field(
        ...,
        description="Evaluation of adherence to coding standards and best practices, with respect to the product.")


class PRModel(BaseModel):
    diffs: str

@code_summarization_app.post(path='/summarize', response_model=StructuredSummary)
async def generate_summary(diffs: PRModel) -> StructuredSummary:

    prompt = f"""
        Analyze the following code and provide a structured JSON output with detailed classifications. 
        Assume the code is part of a larger product and provide insights that align with 
        typical product development requirements. For each of the following categories, 
        provide a brief description, identifying any relevant elements from the code:
        
            - Code Functionality & Business Logic: What core business functionality does the 
            code implement? How does it contribute to the product's overall goal or user experience? 
            Mention any features or use cases it addresses from the product's perspective.

            - Code Structure & Modularity: How is the code organized to ensure maintainability and 
            scalability in the product? Highlight any design patterns, modular structures, or reusable 
            components. How easily can the code be extended or modified to meet future product requirements?

            - Performance and Scalability: Analyze the code in terms of performance and scalability. How 
            well will the code handle increasing data or user load in production? Identify bottlenecks 
            and any areas where performance might be improved to meet product growth expectations.

            - Variables, Data Types & Data Integrity: Describe the variables and data types used, especially 
            focusing on how data is handled in the context of the product. Are data validation and integrity 
            mechanisms in place to ensure product quality? Are there concerns about data consistency or 
            potential for errors?
    
            - Error Handling & User Impact: How does the code handle errors or unexpected conditions? Is 
            there an impact on the user experience in the event of failure? Discuss any recovery mechanisms 
            or user feedback (e.g., error messages) designed to mitigate negative user impact.
    
            - Code Efficiency for Product Use Cases: Evaluate the efficiency of the code in the context of 
            the product's use cases. Are there specific optimizations needed to meet the performance demands 
            of the product (e.g., faster response times, lower resource consumption)?
    
            - Readability, Maintainability, and Collaboration: Assess the readability and maintainability of 
            the code with the product's development team in mind. Is it easy for new team members to understand 
            and contribute to the codebase? Consider naming conventions, code comments, and adherence to 
            product-specific coding standards.
    
            - Testing, Validation & Product Requirements: Discuss the testing coverage of the code. Does it 
            include unit tests, integration tests, or user acceptance tests that align with product 
            requirements? How does it ensure that the code will perform as expected across different environments 
            and under various conditions?
    
            - External Dependencies & Integration: Identify any external libraries, frameworks, or APIs 
            the code relies on. How do these dependencies align with the product's technical stack, and 
            are they necessary for meeting product requirements (e.g., third-party service integration, 
            cloud infrastructure)?
    
            - Security Considerations in Context of Product Use: Highlight any security concerns relevant 
            to the product’s use cases. Does the code meet product security standards, such as secure 
            authentication, data protection, and secure communication? Discuss how the code prevents security 
            vulnerabilities that might impact users or product integrity.
    
            - Compliance & Regulatory Requirements: If relevant, assess whether the code complies with 
            applicable regulatory or legal standards (e.g., GDPR, HIPAA, financial regulations). How does 
            the code ensure that product features respect user privacy and data security requirements?
    
            - Code Standards & Best Practices: Evaluate the code's adherence to best practices in the context 
            of the product. Does it align with product-specific coding standards or conventions? Identify 
            any deviations that might hinder future product development or create technical debt.
            
        Here is the expected output structure:
            "code_functionality_and_business_logic": 
                - "Description of the core business functionality and how the code contributes to the product's goal or user experience.",
            "code_structure_and_modularity": 
                - "Description of the code's organization, modularity, and design patterns or reusable components.",
            "performance_and_scalability": 
                - "Analysis of performance, scalability, and identification of any potential bottlenecks or improvements.",
            "variables_data_types_and_data_integrity": 
                - "Description of the variables and data types used, focusing on data handling, validation, and integrity.",
            "error_handling_and_user_impact": 
                - "Explanation of error handling mechanisms and their impact on the user experience.",
            "code_efficiency_for_product_use_cases": 
                - "Evaluation of code efficiency in product use cases, highlighting areas for optimization.",
            "readability_maintainability_and_collaboration": 
                - "Assessment of readability and maintainability, and how easy it is for the team to collaborate on the codebase.",
            "testing_validation_and_product_requirements": 
                - "Discussion of testing coverage and how the code meets product requirements.",
            "external_dependencies_and_integration": 
                - "List of external dependencies and integration with the product's technical stack.",
            "security_considerations_in_context_of_product_use": 
                - "Analysis of security concerns and how the code ensures product security standards.",
            "compliance_and_regulatory_requirements": 
                - "Assessment of whether the code complies with relevant regulatory or legal standards.",
            "code_standards_and_best_practices": 
                - "Evaluation of adherence to coding standards and best practices, with respect to the product."
                
            Here is the code:
            {diffs}
    """

    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
    response = client.models.generate_content(
        model='gemini-2.0-flash',
        contents=prompt,
        config={
            'response_mime_type': 'application/json',
            'response_schema': StructuredSummary,
        },
    )

    return response.parsed
