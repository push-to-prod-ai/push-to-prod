import {GoogleAuth} from "google-auth-library";
import {config} from "../config/index.js";
import axios from "axios";
import {
    ComparisonSummary,
    ServiceResponse,
    SyntropyCodeSummary,
    SyntropyRequirementsSummary
} from "../types/index.js";


export class SyntropyService {
    private auth: GoogleAuth;

  constructor() {
    this.auth = new GoogleAuth();
  }

  private async getAuthenticatedClient() {
    const client = await this.auth.getIdTokenClient(config.urls.syntropy);
    const { Authorization } = await client.getRequestHeaders();
    return axios.create({
      headers: {
        "Content-Type": "application/json",
        "Authorization": Authorization,
      },
    });
  }

  async summarizeCode(to_analyze: string): ServiceResponse<SyntropyCodeSummary> {
    const client = await this.getAuthenticatedClient();
    const response = await client.post(
      `${config.urls.syntropy}/syntropy/code/summarize`,
      {
        to_analyze,
      }
    );
    return response.data;
  }

  async summarizeRequirements(requirements: string): ServiceResponse<SyntropyRequirementsSummary> {
    const client = await this.getAuthenticatedClient();
    const response = await client.post(
      `${config.urls.syntropy}/syntropy/requirements/summarize`,
      {
        requirements,
      }
    );
    return response.data;
  }

  async generateStructuredSynthesisSummary(
      codeSummary: SyntropyCodeSummary,
      requirementsSummary: SyntropyRequirementsSummary
  ): ServiceResponse<ComparisonSummary> {
    const client = await this.getAuthenticatedClient();
    const response = await client.post(
      // `${config.urls.syntropy}/syntropy/comparison/summarize`,
        "localhost:8083/syntropy/comparison/summarize",
      {
        code_summary: codeSummary,
        requirements_summary: requirementsSummary
      }
    );
    return response.data;
  }

  async generateSynthesisSummary(codeToSummarize: string, requirements: string): ServiceResponse<ComparisonSummary>{
      const [requirementsSummary, codeSummary] = await Promise.all([
          this.summarizeRequirements(requirements),
          this.summarizeCode(JSON.stringify(codeToSummarize))
        ]);

      return this.generateStructuredSynthesisSummary(codeSummary, requirementsSummary)
  }

}