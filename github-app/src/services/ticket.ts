import axios from "axios";
import type { TicketComment, TicketSystem } from "../types/index.js";
import { DatabaseService } from "./database.js";
import { Logger } from '../utils/logger.js';

export class TicketService {
  private system: TicketSystem | null = null;
  private databaseService: DatabaseService;
  private logger: Logger;

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
  private async initializeSystem(userId: string) {
    this.logger.debug(`Initializing Jira system for user: ${userId}`);
    
    // Get credentials from the database
    const credentials = await this.databaseService.getJiraCredentials(userId);
    
    if (!credentials.exists || !credentials.jiraEmail || !credentials.jiraApiToken) {
      this.logger.info(`No Jira credentials found for user: ${userId}`);
      return false;
    }
    
    // Use credentials from the database
    this.system = {
      headers: {
        "Authorization": `Basic ${Buffer.from(
          `${credentials.jiraEmail}:${credentials.jiraApiToken}`
        ).toString("base64")}`,
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      baseUrl: credentials.jiraDomain.endsWith('/rest/api/3') 
        ? credentials.jiraDomain
        : `${credentials.jiraDomain}/rest/api/3`
    };
    
    this.logger.info(`Initialized Jira system with credentials for user: ${userId}`);
    return true;
  }

  async addComment(ticketId: string, comment: TicketComment, userId: string) {
    // Initialize the system with the user's credentials if not already initialized
    if (!this.system) {
      const initialized = await this.initializeSystem(userId);
      if (!initialized) {
        this.logger.info(`Skipping comment addition to ticket ${ticketId} due to missing credentials`);
        return;
      }
    }
    
    // At this point we know this.system is initialized
    if (!this.system) {
      // This should never happen, but it satisfies the type checker
      return;
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

    try {
      await axios.post(
        `${this.system.baseUrl}/issue/${ticketId}/comment`,
        payload,
        { headers: this.system.headers }
      );
      this.logger.info(`Successfully added comment to ticket: ${ticketId}`);
    } catch (error) {
      this.logger.error(`Error adding comment to ticket ${ticketId}: ${error}`);
      // Re-throw to let caller handle the error
      throw error;
    }
  }
} 