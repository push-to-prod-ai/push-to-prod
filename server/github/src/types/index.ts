// Generic service types
export type ServiceResponse<T> = Promise<T>;

// AI Service types
export type AIPrompt = string;
export type AISummary = string;

// Blast Radius types
export type BlastRadiusIssue = {
  key: string;
  URL: string;
  summary: string;
  description: string;
  issue_type: string;
};

export type BlastRadiusResult = {
  relevant_issues: BlastRadiusIssue[];
};

// Ticket Service types
export type TicketComment = {
  text: string;
};

export type TicketSystem = {
  headers: Record<string, string>;
  baseUrl: string;
};

// Database Service types
export type JiraCredentials = {
  jiraEmail: string;
  jiraDomain: string;
  jiraApiToken: string;
  exists: boolean;
};

// Syntropy Service
export type SyntropyCodeSummary = {
  code_functionality_and_business_logic: string
  code_structure_and_modularity: string
  performance_and_scalability: string
  variables_data_types_and_data_integrity: string
  error_handling_and_user_impact: string
  code_efficiency_for_product_use_cases: string
  readability_maintainability_and_collaboration: string
  testing_validation_and_product_requirements: string
  external_dependencies_and_integration: string
  security_considerations_in_context_of_product_use: string
  compliance_and_regulatory_requirements: string
  code_standards_and_best_practices: string

}

export type SyntropyRequirementsSummary = {
  core_business_functionality: string
  structural_and_modular_requirements: string
  performance_and_scalability_criteria: string
  data_handling_and_integrity: string
  error_handling_and_user_experience: string
  efficiency_requirements_for_product_use_cases: string
  readability_maintainability_and_team_adoption: string
  testing_and_validation_criteria: string
  external_dependencies_and_integrations: string
  security_standards_and_threat_mitigation: string
  compliance_and_regulatory_considerations: string
  adherence_to_standards_and_best_practices: string
}

export type ComparisonCategory = {
  did_right: string
  did_wrong: string
  ambiguous: string
}

export type ComparisonSummary = {
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
}
