export const config = {
  urls: {
    blastRadius: "https://blast-radius-620323149335.us-central1.run.app",
    jira: "https://push-to-prod.atlassian.net/rest/api/3"
  },
  ai: {
    model: "gemini-2.0-flash"
  },
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || "pushtoprod-5b295",
    collections: {
      organizations: 'organizations',
      settings: 'settings',
      users: 'users',
    }
  }
} as const;

// Validate required environment variables
const requiredEnvVars = [
  'GEMINI_API_KEY',
  'FIREBASE_PROJECT_ID'
] as const;


requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    throw new Error(`${envVar} environment variable is required`);
  }
}); 