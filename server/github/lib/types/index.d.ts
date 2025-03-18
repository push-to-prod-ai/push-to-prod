export type ServiceResponse<T> = Promise<T>;
export type AIPrompt = string;
export type AISummary = string;
export type BlastRadiusIssue = {
    key: string;
    URL: string;
};
export type BlastRadiusResult = {
    relevant_issues: BlastRadiusIssue[];
};
export type TicketComment = {
    text: string;
};
export type TicketSystem = {
    headers: Record<string, string>;
    baseUrl: string;
};
export type JiraCredentials = {
    jiraEmail: string;
    jiraDomain: string;
    jiraApiToken: string;
    exists: boolean;
};
