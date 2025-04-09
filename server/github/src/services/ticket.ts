import axios from "axios";
import type { TicketComment, TicketSystem } from "../types/index.js";
import { DatabaseService } from "./database.js";
import { Logger } from '../utils/logger.js';

export class TicketService {
  private databaseService: DatabaseService;
  private logger: Logger;

  constructor() {
    this.logger = new Logger();
    this.databaseService = new DatabaseService();
  }

  private async getSystem(userId: string): Promise<TicketSystem> {
    const credentials = await this.databaseService.getJiraCredentials(userId);
    
    if (!credentials.exists || !credentials.jiraEmail || !credentials.jiraApiToken) {
      throw new Error(`No Jira credentials found for user: ${userId}`);
    }
    
    return {
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
  }

  async addComment(ticketId: string, comment: TicketComment, userId: string) {
    this.logger.info(`Adding comment to ticket: ${ticketId}`);
    
    const system = await this.getSystem(userId);
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
    if (!/^https?:\/\//i.test(system.baseUrl)) {
      system.baseUrl = `https://${system.baseUrl}`;
    }
    await axios.post(
      `${system.baseUrl}/issue/${ticketId}/comment`,
      payload,
      { headers: system.headers }
    );
    this.logger.info(`Successfully added comment to ticket: ${ticketId}`);
  }
} 