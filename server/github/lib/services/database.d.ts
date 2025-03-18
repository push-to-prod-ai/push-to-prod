import type { JiraCredentials, ServiceResponse } from '../types/index.js';
export declare class DatabaseService {
    private db;
    private logger;
    constructor();
    /**
     * Get Jira credentials for a user from Firestore
     * @param userId The ID of the user whose credentials to retrieve
     * @returns A promise resolving to the user's Jira credentials
     */
    getJiraCredentials(userId: string): ServiceResponse<JiraCredentials>;
}
