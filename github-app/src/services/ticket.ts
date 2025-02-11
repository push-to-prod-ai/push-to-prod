import axios from "axios";
import { config } from "../config/index.js";
import type { TicketComment, TicketSystem, ServiceResponse } from "../types/index.js";

export class TicketService {
  private system: TicketSystem;

  constructor() {
    if (!process.env.JIRA_EMAIL || !process.env.JIRA_API_TOKEN) {
      throw new Error('JIRA_EMAIL and JIRA_API_TOKEN environment variables are required');
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
  }

  async addComment(ticketId: string, comment: TicketComment): ServiceResponse<void> {
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

    await axios.post(
      `${this.system.baseUrl}/issue/${ticketId}/comment`,
      payload,
      { headers: this.system.headers }
    );
  }
} 