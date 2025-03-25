import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { config } from "../config/index.js";
import type { AIPrompt, AISummary, ServiceResponse } from "../types/index.js";

const axios = require('axios');

const BASE_URL = 'http://syntropy:8080';  // Docker FastAPI URL

export class AIService {

  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: config.ai.model });
    }

  async generateContent(prompt: AIPrompt): ServiceResponse<AISummary> {
    const response = await this.model.generateContent(prompt);
    return response.response.text();
  }

  // Function to summarize code diffs
  async summarizeCode(diffs: string): Promise<any> {
    try {
      const response: Record<string, any> = await axios.post(`${BASE_URL}/syntropy/code/summarize`, { diffs }, {
        headers: { 'Content-Type': 'application/json' }
      });

      console.log('Code Summary:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error: any) {
      console.error('Error summarizing code:', error.response ? error.response.data : error.message);
      return '';
    }
  }

  // Function to summarize requirements
  async summarizeRequirements(requirements: string): Promise<any> {
    try {
      const response: Record<string, any> = await axios.post(`${BASE_URL}/syntropy/requirements/summarize`, { requirements }, {
        headers: { 'Content-Type': 'application/json' }
      });

      console.log('Requirements Summary:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error: any) {
      console.error('Error summarizing requirements:', error.response ? error.response.data : error.message);
      return '';
    }
  }

  // Function to compare code and requirements summaries
  async compareSummaries(codeSummary: any, requirementsSummary: any): Promise<any> {
    try {
      const response: Record<string, any> = await axios.post(`${BASE_URL}/syntropy/comparison/summarize`, {
        code_summary: codeSummary,
        requirements_summary: requirementsSummary
      }, {
        headers: { 'Content-Type': 'application/json' }
      });

      console.log('Comparison Summary:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error: any) {
      console.error('Error comparing summaries:', error.response ? error.response.data : error.message);
      return '';
    }
  }
}