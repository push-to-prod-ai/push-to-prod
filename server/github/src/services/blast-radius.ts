import axios from "axios";
import { GoogleAuth } from "google-auth-library";
import { config } from "../config/index.js";
import type { BlastRadiusResult, ServiceResponse } from "../types/index.js";

export class BlastRadiusService {
  private auth: GoogleAuth;

  constructor() {
    this.auth = new GoogleAuth();
  }

  private async getAuthenticatedClient() {
    const client = await this.auth.getIdTokenClient(config.urls.blastRadius);
    const { Authorization } = await client.getRequestHeaders();
    return axios.create({
      headers: {
        "Content-Type": "application/json",
        "Authorization": Authorization,
      },
    });
  }

  async calculateBlastRadius(summary: string): ServiceResponse<BlastRadiusResult> {
    const client = await this.getAuthenticatedClient();
    const response = await client.post(
      `${config.urls.blastRadius}/blast-radius/calculation`,
      {
        summary,
        max_items: 1,
      }
    );
    return response.data;
  }
} 