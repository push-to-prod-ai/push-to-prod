from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

code_summary = {
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

requirements_summary = {
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

def test_compare_endpoint():
    response = client.post(
        "/syntropy/comparison/summarize",
        json={"code_summary": code_summary, "requirements_summary": requirements_summary}
    )

    print(response.status_code)  # 200 if successful
    print(response.json())  # Output JSON

    assert response.status_code == 200
