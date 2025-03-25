export const config = {
  urls: {
    blastRadius: "https://blast-radius-620323149335.us-central1.run.app",
    syntropy: "https://syntropy-620323149335.us-central1.run.app"
  },
  ai: {
    model: "gemini-2.0-flash-thinking-exp"
  },
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
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