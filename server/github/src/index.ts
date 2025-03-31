import { Probot } from "probot";
import axios from "axios";
import { AIService } from "./services/ai.js";
import { BlastRadiusService } from "./services/blast-radius.js";
import { TicketService } from "./services/ticket.js";
import { DatabaseService } from "./services/database.js";
import { defaultPRTemplate, prAnalysisPrompt } from "./templates/index.js";
import { Logger } from "./utils/logger.js";

/**
 * AppService class that handles all GitHub app functionality
 */
export class AppService {
  private logger: Logger;
  private aiService: AIService;
  private blastRadiusService: BlastRadiusService;
  private ticketService: TicketService;
  private databaseService: DatabaseService;
  
  constructor() {
    this.logger = new Logger();
    this.aiService = new AIService();
    this.blastRadiusService = new BlastRadiusService();
    this.ticketService = new TicketService();
    this.databaseService = new DatabaseService();
  }

  /**
   * Initialize the app with Probot
   * @param app Probot instance
   */
  async initialize(app: Probot) {
    // Handle marketplace events
    app.on(['marketplace_purchase'], async (context) => {
      const event = context.name; // 'marketplace_purchase'
      const action = context.payload.action; // 'purchased', 'cancelled', etc
      
      this.logger.info("Processing marketplace event", {
        event,
        action,
        sender: context.payload.sender.login,
      });
    });
    
    // Add PR handler - check feature flag at runtime
    app.on(["pull_request.opened", "pull_request.reopened"], async (context) => {
      // Get feature flags at runtime
      const featureFlags = await this.databaseService.getFeatureFlags();
      
      // Skip if PR summaries are disabled
      if (!featureFlags.prSummariesEnabled) {
        this.logger.info("PR summaries feature is disabled, skipping", {
          repo: context.repo(),
          pr: context.payload.pull_request.number
        });
        return;
      }
      
      const { pull_request: pr } = context.payload;
      this.logger.info("Processing pull request event", {
        repo: context.repo(),
        pr: pr.number
      });

      // First, get the PR metadata to access the diff_url
      const prResponse = await context.octokit.pulls.get({
        ...context.repo(),
        pull_number: pr.number
      });
      
      // Extract the head commit SHA for generating permalinks
      const commitSha = prResponse.data.head.sha;
      
      // Get the raw diff using axios to fetch from the diff_url
      const diffResponse = await axios.get(prResponse.data.diff_url);
      const rawDiff = diffResponse.data; // This will be a string
      
      this.logger.info("PR diff summary", {
        diffUrl: prResponse.data.diff_url,
        diffSize: rawDiff.length,
        commitSha
      });
      
      // Log preview of the diff
      this.logger.debug("PR diff preview", { 
        diffPreview: rawDiff.substring(0, 1000) + "..." 
      });

      // Try to get PR template
      let template = "";
      try {
        const { data: templateFile } = await context.octokit.repos.getContent({
          ...context.repo(),
          path: '.github/PULL_REQUEST_TEMPLATE.md',
        });

        if ('content' in templateFile) {
          template = Buffer.from(templateFile.content, 'base64').toString();
        }
      } catch (error) {
        this.logger.info("No PR template found, using default format");
        template = defaultPRTemplate;
      }

      // Build prompt using template
      const prompt = prAnalysisPrompt
        .replace("{{template}}", template)
        .replace("{{title}}", pr.title || "")
        .replace("{{existingDescription}}", pr.body || "")
        .replace("{{baseBranch}}", pr.base.ref)
        .replace(/\{\{repository\}\}/g, pr.base.repo.full_name)
        .replace(/\{\{commitSha\}\}/g, commitSha)
        .replace("{{diffs}}", rawDiff);
        
      this.logger.info("Generated prompt", { 
        promptLength: prompt.length,
        promptPreview: prompt.substring(0, 500) + "..." 
      });
      this.logger.debug("Full prompt", { prompt });
        
      const prDescription = await this.aiService.generateContent(prompt);
      
      // Update the PR description
      await context.octokit.pulls.update({
        ...context.repo(),
        pull_number: pr.number,
        body: prDescription,
      });

      // Add a status check to indicate the description was updated
      await context.octokit.repos.createCommitStatus({
        ...context.repo(),
        sha: commitSha,
        state: 'success',
        context: 'PushToProd.ai',
        description: 'Documented',
        target_url: prResponse.data.html_url + '#discussion_bucket' // Link to the PR description section
      });
      
      // // Ensure the 'documented' label exists with a color
      // try {
      //   // Try to get the label to see if it exists
      //   await context.octokit.issues.getLabel({
      //     ...context.repo(),
      //     name: labelConfig.name
      //   });
      // } catch (error) {
      //   // Label doesn't exist, create it with a color
      //   await context.octokit.issues.createLabel({
      //     ...context.repo(),
      //     ...labelConfig
      //   });
      //   this.logger.info("Created label with color", { label: labelConfig.name, color: labelConfig.color });
      // }

      // // Add label to indicate the description was updated
      // await context.octokit.issues.addLabels({
      //   ...context.repo(),
      //   issue_number: pr.number,
      //   labels: [labelConfig.name]
      // });

      this.logger.info("Updated PR description and added status check", { pr: pr.number });
    });

    // Ticket integration - check feature flag at runtime
    app.on(["push"], async (context) => {
      // Get feature flags at runtime
      const featureFlags = await this.databaseService.getFeatureFlags();
      
      // Skip if Jira ticket integration is disabled
      if (!featureFlags.jiraTicketEnabled) {
        return;
      }
      
      const { ref, repository, sender } = context.payload;
      this.logger.info("Processing push event", {
        repo: context.repo(),
        ref,
        labels: {
          repository: repository?.full_name,
          sender: sender?.login,
        },
      });

      // Skip if not targeting the main branch.
      if (ref !== "refs/heads/main") {
        this.logger.info("Skipping non-main branch", { ref });
        return;
      }

      // Get the diff for analysis
      const compare = await context.octokit.repos.compareCommits({
        ...context.repo(),
        base: context.payload.before,
        head: context.payload.after,
      });
      this.logger.info("Retrieved commit comparison", {
        files: compare.data.files?.length,
        commits: compare.data.commits?.length,
      });

      // Create a diff string for the prompt.
      const diffs = compare.data.files
        ?.map(file => `File: ${file.filename}\n${file.patch || ""}`)
        .join("\n\n");

      // Build prompt and generate summary
      const prompt = `Analyze these code changes and provide a concise summary:\n\n${diffs}`;
      const summaryText = await this.aiService.generateContent(prompt);
      this.logger.info("Generated AI summary", { summaryLength: summaryText.length });

      // Get blast radius calculation, we will flesh out this part of the app later
      const blastRadiusResponse = await this.blastRadiusService.calculateBlastRadius(summaryText);
      this.logger.info("Calculated blast radius", {
        issuesFound: blastRadiusResponse.relevant_issues.length,
      });

      if (!blastRadiusResponse.relevant_issues.length) {
        this.logger.info("No relevant tickets found for this change");
        return;
      }
      const relevantIssue = blastRadiusResponse.relevant_issues[0];
      this.logger.info("Selected relevant ticket", { ticketKey: relevantIssue.key });

      // Add comment to ticket - pass the user ID (using GitHub user ID as a fallback)
      const userId = sender?.id?.toString() || "";
      await this.ticketService.addComment(
        relevantIssue.key, 
        { text: summaryText },
        userId
      );
      this.logger.info("Added comment to ticket", { ticketKey: relevantIssue.key });

      // Add status check with ticket link
      await context.octokit.repos.createCommitStatus({
        ...context.repo(),
        sha: context.payload.after,
        state: "success",
        description: `Analysis linked to ${relevantIssue.key}`,
        target_url: relevantIssue.URL,
        context: "PushToProd/analysis",
      });
      this.logger.info("Created commit status", {
        sha: context.payload.after,
        ticketKey: relevantIssue.key,
      });
    });
  }
}

/**
 * Create the app with Probot
 * @param app Probot instance
 */
export const createApp = (app: Probot) => {
  const appService = new AppService();
  appService.initialize(app);
};

export default createApp;