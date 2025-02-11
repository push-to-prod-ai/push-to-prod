export const config = {
  urls: {
    blastRadius: "https://blast-radius-620323149335.us-central1.run.app",
    jira: "https://push-to-prod.atlassian.net/rest/api/3"
  },
  ai: {
    model: "gemini-2.0-flash"
  }
} as const;

// Validate required environment variables
const requiredEnvVars = [
  'GEMINI_API_KEY',
  'JIRA_EMAIL',
  'JIRA_API_TOKEN'
] as const;

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    throw new Error(`${envVar} environment variable is required`);
  }
}); 