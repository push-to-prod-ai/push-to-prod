import { Probot } from "probot";
import Anthropic from "@anthropic-ai/sdk";
import axios from 'axios';
import { Request, Response } from 'express';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export default async (app: Probot, { getRouter }: { getRouter: Function }) => {
  const router = getRouter('/probot');

  // Setup page
  router.get('/setup', async (_req: Request, res: Response) => {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Push to Prod Setup</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        </head>
        <body class="bg-gray-50 p-8">
          <div class="max-w-2xl mx-auto">
            <h1 class="text-3xl font-bold mb-8">Push to Prod Configuration</h1>
            
            <form action="/probot/setup/save" method="POST" class="space-y-6">
              <div>
                <label class="block text-sm font-medium">Repository (owner/repo)</label>
                <input type="text" name="repository" 
                  placeholder="octocat/Hello-World"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
              </div>

              <div>
                <label class="block text-sm font-medium">Jira Domain</label>
                <input type="text" name="jiraDomain" 
                  placeholder="your-company.atlassian.net"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
              </div>

              <div>
                <label class="block text-sm font-medium">Jira Email</label>
                <input type="email" name="jiraEmail" 
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
              </div>

              <div>
                <label class="block text-sm font-medium">Jira API Token</label>
                <input type="password" name="jiraApiToken"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
              </div>

              <div>
                <label class="block text-sm font-medium">Default Jira Project Key</label>
                <input type="text" name="jiraProjectKey" 
                  placeholder="PROJ"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
              </div>

              <button type="submit" 
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                Save Configuration
              </button>
            </form>
          </div>
        </body>
      </html>
    `;
    res.send(html);
  });

  // Save configuration
  router.post('/setup/save', async (req: Request, res: Response) => {
    const { repository, jiraDomain, jiraEmail, jiraApiToken, jiraProjectKey } = req.body;
    const [owner, repo] = repository.split('/');
    
    try {
      // First, get the installation ID for this repository
      const github = await app.auth();
      const installation = await github.rest.apps.getRepoInstallation({
        owner,
        repo,
      });
      
      // Get an authenticated client using the installation ID
      const installationClient = await app.auth(installation.data.id);
      
      // Save as repository secrets
      await installationClient.rest.actions.createOrUpdateRepoSecret({
        owner,
        repo,
        secret_name: 'JIRA_DOMAIN',
        encrypted_value: jiraDomain
      });

      await installationClient.rest.actions.createOrUpdateRepoSecret({
        owner,
        repo,
        secret_name: 'JIRA_EMAIL',
        encrypted_value: jiraEmail
      });

      await installationClient.rest.actions.createOrUpdateRepoSecret({
        owner,
        repo,
        secret_name: 'JIRA_API_TOKEN',
        encrypted_value: jiraApiToken
      });

      await installationClient.rest.actions.createOrUpdateRepoSecret({
        owner,
        repo,
        secret_name: 'JIRA_PROJECT_KEY',
        encrypted_value: jiraProjectKey
      });
      
      res.redirect('/probot/setup?success=true');
    } catch (error) {
      console.error('Error saving secrets:', error);
      res.status(500).send('Error saving configuration');
    }
  });

  // GitHub webhook handler
  app.on(["push"], async (context) => {
    // Get secrets from environment (set by GitHub Actions)
    const config = {
      jira: {
        domain: process.env.JIRA_DOMAIN,
        email: process.env.JIRA_EMAIL,
        apiToken: process.env.JIRA_API_TOKEN,
        projectKey: process.env.JIRA_PROJECT_KEY
      }
    };

    if (!config.jira.domain || !config.jira.email || !config.jira.apiToken || !config.jira.projectKey) {
      throw new Error('Jira configuration not found in environment');
    }

    const push = context.payload;
    
    // Skip if not targeting main branch
    if (push.ref !== 'refs/heads/main') {
      return;
    }

    try {
      // Get the diff for analysis
      const compare = await context.octokit.repos.compareCommits({
        ...context.repo(),
        base: push.before,
        head: push.after,
      });

      // Generate summary using Anthropic
      const diffs = compare.data.files?.map(file => 
        `File: ${file.filename}\n${file.patch || ""}`
      ).join('\n\n');

      const summary = anthropic.messages.stream({
        model: 'claude-3-5-sonnet-latest',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `Analyze these code changes and provide a concise summary:\n\n${diffs}`
        }]
      });

      const summaryText = await summary.finalText();

      // Update Jira ticket
      const jiraPayload = {
        body: {
          version: 1,
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  text: summaryText,
                  type: "text"
                }
              ]
            }
          ]
        }
      };

      await axios.post(
        `https://${config.jira.domain}/rest/api/3/issue/${config.jira.projectKey}-1/comment`,
        jiraPayload,
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(
              `${config.jira.email}:${config.jira.apiToken}`
            ).toString('base64')}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );

      // Add status check
      await context.octokit.repos.createCommitStatus({
        ...context.repo(),
        sha: push.after,
        state: 'success',
        description: 'Code analysis complete',
        context: 'PushToProd/analysis'
      });

    } catch (error) {
      console.error('Error processing push:', error);
      
      // Add failure status
      await context.octokit.repos.createCommitStatus({
        ...context.repo(),
        sha: push.after,
        state: 'failure',
        description: 'Error analyzing code changes',
        context: 'PushToProd/analysis'
      });
    }
  });
};
