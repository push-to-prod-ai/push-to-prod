import axios from "axios";
import { DatabaseService } from "./database.js";
import { Logger } from '../utils/logger.js';
export class TicketService {
    system = null;
    databaseService;
    logger;
    constructor() {
        // Initialize the system when needed, not in constructor
        // This allows getting credentials from the database per-user
        this.logger = new Logger();
        this.databaseService = new DatabaseService();
    }
    /**
     * Initialize the ticket system with Jira credentials
     * @param userId The user ID to get credentials for
     * @returns boolean indicating whether initialization was successful
     */
    async initializeSystem(userId) {
        this.logger.debug(`Initializing Jira system for user: ${userId}`);
        // Get credentials from the database
        const credentials = await this.databaseService.getJiraCredentials(userId);
        if (!credentials.exists || !credentials.jiraEmail || !credentials.jiraApiToken) {
            this.logger.info(`No Jira credentials found for user: ${userId}`);
            return;
        }
        // Use credentials from the database
        this.system = {
            headers: {
                "Authorization": `Basic ${Buffer.from(`${credentials.jiraEmail}:${credentials.jiraApiToken}`).toString("base64")}`,
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            baseUrl: credentials.jiraDomain.endsWith('/rest/api/3')
                ? credentials.jiraDomain
                : `${credentials.jiraDomain}/rest/api/3`
        };
        this.logger.info(`Initialized Jira system with credentials for user: ${userId}`);
        return;
    }
    async addComment(ticketId, comment, userId) {
        // Initialize the system with the user's credentials if not already initialized
        if (!this.system) {
            await this.initializeSystem(userId);
            if (!this.system) {
                this.logger.info(`Skipping comment addition to ticket ${ticketId} due to missing credentials`);
                return;
            }
        }
        this.logger.info(`Adding comment to ticket: ${ticketId}`);
        const payload = {
            body: {
                version: 1,
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: comment.text,
                            },
                        ],
                    },
                ],
            },
        };
        await axios.post(`${this.system.baseUrl}/issue/${ticketId}/comment`, payload, { headers: this.system.headers });
        this.logger.info(`Successfully added comment to ticket: ${ticketId}`);
    }
}
//# sourceMappingURL=ticket.js.map