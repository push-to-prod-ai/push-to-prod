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

  async summarizeCode(toAnalyze: string): ServiceResponse<SyntropyCodeSummary> {
    const client = await this.getAuthenticatedClient();
    const response = await client.post(
      //`${config.urls.syntropy}/syntropy/code/summarize`,
        "http://localhost:8083/syntropy/code/summarize",
      {
        diffs: toAnalyze,
      }
    );
    return response.data;
  }

  async summarizeRequirements(requirements: string): ServiceResponse<SyntropyRequirementsSummary> {
    const client = await this.getAuthenticatedClient();
    const response = await client.post(
      // `${config.urls.syntropy}/syntropy/requirements/summarize`,
        "http://localhost:8083/syntropy/requirements/summarize",
      {
        requirements: requirements,
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
        "http://localhost:8083/syntropy/comparison/summarize",
      {
        code_summary: codeSummary,
        requirements_summary: requirementsSummary
      }
    );
    return response.data;
  }

  async generateSynthesisSummary(codeToSummarize: string, requirements: string): ServiceResponse<ComparisonSummary>{
      const [codeSummary, requirementsSummary] = await Promise.all([
          this.summarizeCode(codeToSummarize),
          this.summarizeRequirements(requirements)
        ]);

      return this.generateStructuredSynthesisSummary(codeSummary, requirementsSummary)
  }

}