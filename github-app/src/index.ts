import { Probot } from "probot";
import Anthropic from "@anthropic-ai/sdk";
import axios from 'axios';
import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    })
  ],
  // This ensures logs are properly structured for Google Cloud Logging
  defaultMeta: {
    serviceContext: {
      service: 'push-to-prod',
      version: '1.0.0'
    }
  }
});

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY environment variable is required');
}

const anthropic = new Anthropic({
  apiKey: String(process.env.ANTHROPIC_API_KEY),
});

export default async (app: Probot) => {
  app.on(["push"], async (context) => {
    logger.info('Processing push event', {
      repo: context.repo(),
      ref: context.payload.ref,
      // Adding structured data helps with filtering in Cloud Logging
      labels: {
        repository: context.payload.repository?.full_name,
        sender: context.payload.sender?.login
      }
    });
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

      // Test commit to check deployment

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

      // Call blast radius service to find the most relevant ticket
      const blastRadiusResponse = await axios.post(
        'https://blast-radius-620323149335.us-central1.run.app/blast-radius/calculation',
        {
          summary: summaryText,
          max_items: 1  
        }
      );

      // Skip Jira update if no relevant issues found
      if (!blastRadiusResponse.data.relevant_issues.length) {
        logger.info('No relevant Jira tickets found for this change');
        return;
      }

      const relevantIssue = blastRadiusResponse.data.relevant_issues[0];
      
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
                  type: "text",
                  text: summaryText
                }
              ]
            }
          ]
        }
      };

      await axios.post(
        `https://push-to-prod.atlassian.net/rest/api/3/issue/${relevantIssue.key}/comment`,
        jiraPayload,
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(
              `${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`
            ).toString('base64')}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );

      // Add status check with Jira link
      await context.octokit.repos.createCommitStatus({
        ...context.repo(),
        sha: push.after,
        state: 'success',
        description: `Analysis linked to ${relevantIssue.key}`,
        target_url: relevantIssue.URL,
        context: 'PushToProd/analysis'
      });

    } catch (error) {
      logger.error('Error processing push:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        repo: context.repo(),
        sha: context.payload.after
      });
      
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
