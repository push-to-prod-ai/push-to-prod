import axios from "axios";
import { config } from "../config/index.js";
import type { TicketComment, TicketSystem, ServiceResponse } from "../types/index.js";
import { DatabaseService } from "./database.js";
import { Logger } from '../utils/logger.js';

export class TicketService {
  private system: TicketSystem | null = null;
  private databaseService: DatabaseService;
  private logger: Logger;

  constructor() {
    this.logger = new Logger();
    this.databaseService = new DatabaseService();
  }

  /**
   * Initialize the ticket system with Jira credentials
   * @param userId The user ID to get credentials for
   */
  private async initializeSystem(userId: string) {
    try {
      this.logger.debug(`Initializing Jira system for user: ${userId}`);
      // Try to get credentials from the database
      const credentials = await this.databaseService.getJiraCredentials(userId);
      
      if (!credentials.exists || !credentials.jiraEmail || !credentials.jiraApiToken) {
        this.logger.info('No credentials found in database, falling back to environment variables');
        // Fall back to environment variables if database credentials don't exist
        if (!process.env.JIRA_EMAIL || !process.env.JIRA_API_TOKEN) {
          this.logger.error('No Jira credentials found in database or environment variables');
          throw new Error('No Jira credentials found in database or environment variables');
        }
        
        this.system = {
          headers: {
            "Authorization": `Basic ${Buffer.from(
              `${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`
            ).toString("base64")}`,
            "Accept": "application/json",
            "Content-Type": "application/json",
          },
          baseUrl: config.urls.jira
        };
        this.logger.info('Initialized Jira system with environment variables');
      } else {
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
        this.logger.info(`Initialized Jira system with credentials from database for user: ${userId}`);
      }
    } catch (error) {
      this.logger.error(`Error initializing Jira system: ${error}`);
      throw new Error('Failed to initialize Jira system');
    }
  }

  async addComment(ticketId: string, comment: TicketComment, userId: string): ServiceResponse<void> {
    // Initialize the system with the user's credentials if not already initialized
    if (!this.system) {
      await this.initializeSystem(userId);
    }
    
    if (!this.system) {
      this.logger.error('Failed to initialize Jira system');
      throw new Error('Failed to initialize Jira system');
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
      throw error;
    }
  }
} 