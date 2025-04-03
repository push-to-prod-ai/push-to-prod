import axios from "axios";
// import { config } from "../config/index.js";
import type {BlastRadiusResult, ServiceResponse, TicketSystem} from "../types/index.js";
import { DatabaseService } from "./database.js";

export class BlastRadiusService {
  private databaseService: DatabaseService;

  constructor() {
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

  async calculateBlastRadius(userId: string, summary: string): ServiceResponse<BlastRadiusResult> {
    // Step 1: Get the system (Jira credentials, headers, and base URL)
    const system = await this.getSystem(userId);

    // Prepare the payload with the summary
    const payload = { summary, max_items: 20 };

    // Send the POST request to the FastAPI service
    const response = await axios.post(
      "http://localhost:8080/blast-radius/calculation", // Use the actual service endpoint
      payload, // Send the payload with the summary
      {
        headers: {
          ...system.headers, // Pass the existing headers
          "jira_url": system.baseUrl, // Add jira_url as a custom header
        }
      }
    );
    return response.data;
  }
}