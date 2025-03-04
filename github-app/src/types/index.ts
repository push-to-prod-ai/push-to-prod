// Generic service types
export type ServiceResponse<T> = Promise<T>;

// AI Service types
export type AIPrompt = string;
export type AISummary = string;

// Blast Radius types
export type BlastRadiusIssue = {
  key: string;
  URL: string;
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