
const axios = require('axios');

const BASE_URL = 'http://syntropy:8080';  // Docker FastAPI URL

export class AIService {

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
    }
  }
}