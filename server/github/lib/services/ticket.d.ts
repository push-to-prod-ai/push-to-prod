import type { TicketComment } from "../types/index.js";
export declare class TicketService {
    private system;
    private databaseService;
    private logger;
    constructor();
    /**
     * Initialize the ticket system with Jira credentials
     * @param userId The user ID to get credentials for
     * @returns boolean indicating whether initialization was successful
     */
    private initializeSystem;
    addComment(ticketId: string, comment: TicketComment, userId: string): Promise<void>;
}
