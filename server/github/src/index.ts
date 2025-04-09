import { Probot } from "probot";
import axios from "axios";
import { AIService } from "./services/ai.js";
import { BlastRadiusService } from "./services/blast-radius.js";
import { TicketService } from "./services/ticket.js";
import { DatabaseService } from "./services/database.js";
import { Logger } from "./utils/logger.js";
import {SyntropyService} from "./services/syntropy.js";
import {
  getPRFilesAsRawCode,
  formatJsonForGithubComment,
  issuesToMarkdown,
  convertToSimpleJiraFormat,
  convertMarkdownToPlainText
} from "./utils/octokit_tools.js"

/**
 * AppService class that handles all GitHub app functionality
 */
export class AppService {
  private logger: Logger;
  private aiService: AIService;
  private blastRadiusService: BlastRadiusService;
  private ticketService: TicketService;
  private databaseService: DatabaseService;
  private syntropyService: SyntropyService
  
  constructor() {
    this.logger = new Logger();
    this.aiService = new AIService();
    this.blastRadiusService = new BlastRadiusService();
    this.ticketService = new TicketService();
    this.databaseService = new DatabaseService();
    this.syntropyService = new SyntropyService();
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
    
    // Add PR handler - check feature flag at runtime with user ID
    app.on(["pull_request.opened", "pull_request.reopened"], async (context) => {
      // Get the user ID from the sender
      const userId = context.payload.sender?.id?.toString() || 'default';
      
      // Get feature flags at runtime for this user
      const featureFlags = await this.databaseService.getFeatureFlags(userId);
      
      // Skip if PR summaries are disabled
      if (!featureFlags.prSummariesEnabled) {
        this.logger.info("PR summaries feature is disabled for this user, skipping", {
          repo: context.repo(),
          pr: context.payload.pull_request.number,
          userId
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
      }

      // Get custom or default PR analysis prompt template
      const promptTemplate = await this.aiService.getPrAnalysisPrompt(userId);
      
      // Build prompt using template
      const prompt = promptTemplate
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
        
      // Pass userId to generateContent for custom system instructions
      const prDescription = await this.aiService.generateContent(prompt, userId);
      
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

    // Jira ticket integration - check feature flag at runtime with user ID
    app.on(["pull_request.opened", "pull_request.closed", "pull_request.reopened"], async (context) => {
      const userId = context.payload.sender?.id?.toString() || 'default';
      this.logger.info("USER ID FETCHED", {uid : userId})

      const featureFlags = await this.databaseService.getFeatureFlags(userId);
      this.logger.info("featureFlags", {featureFlags : featureFlags})

      if (!featureFlags.jiraTicketEnabled) {
        return;
      }
      
      const { pull_request: pr, repository, sender } = context.payload;
      const action = context.payload.action;
      
      this.logger.info("Processing pull request for Jira integration", {
        repo: context.repo(),
        pr: pr.number,
        action,
        labels: {
          repository: repository?.full_name,
          sender: sender?.login,
        },
      });

      // Get the PR details to access the diff
      const prResponse = await context.octokit.pulls.get({
        ...context.repo(),
        pull_number: pr.number
      });
      
      // Get the raw diff using axios
      const diffResponse = await axios.get(prResponse.data.diff_url);
      const rawDiff = diffResponse.data; // This will be a string
      
      // Create a formatted diff string
      const diffs = `Pull Request #${pr.number} (${action})\nTitle: ${pr.title}\n\n${rawDiff}`;

      // Build prompt for Jira analysis - adjust messaging based on PR action
      const actionText = action === 'opened' ? 'opened' : 'merged/closed';
      const prompt = `Analyze these code changes from a ${actionText} pull request and provide a concise summary for a Jira ticket:\n\n${diffs}`;
      
      // Pass userId to generateContent for custom system instructions
      const summaryText: string = await this.aiService.generateContent(prompt, userId);
      this.logger.info("Generated AI summary for Jira", { summaryLength: summaryText.length });

      // Get blast radius calculation to find relevant Jira tickets
      const blastRadiusResponse = await this.blastRadiusService.calculateBlastRadius(summaryText);
      this.logger.info("Calculated blast radius", {
        issuesFound: blastRadiusResponse.relevant_issues.length,
      });

      if (!blastRadiusResponse.relevant_issues.length) {
        this.logger.info("No relevant tickets found for this PR");
        await context.octokit.issues.createComment(
          {
            ...context.repo(),
            issue_number: pr.number,
            body: "There don't seem to be any relevant tickets for this PR."
          });
        return;
      }

      this.logger.info("Adding Blast Radius comment to PR.")
      const comment_body: string = issuesToMarkdown(blastRadiusResponse.relevant_issues)
      await context.octokit.issues.createComment(
          {
            ...context.repo(),
            issue_number: pr.number,
            body: comment_body
          });

      // TODO: determine if it makes sense to add the comment to each and every "relevant" issue found?
      const relevantIssue = blastRadiusResponse.relevant_issues[0];
      this.logger.info("Selected relevant ticket", { ticketKey: relevantIssue.key });

      // Create different comment content based on PR action
      const commentPrefix = action === 'opened'
        ? ` **PR Opened**: Pull request #${pr.number} has been opened.\n\n`
        : ` **PR ${pr.merged ? 'Merged' : 'Closed'}**: Pull request #${pr.number} has been ${pr.merged ? 'merged' : 'closed'}.\n\n`;
      
      const commentText = convertMarkdownToPlainText(
          // `${commentPrefix}**Summary:**\n${summaryText}\n\n**PR Link:** ${pr.html_url}`
          `${commentPrefix}\n[PR Link](${pr.html_url})`
      );

      // Add comment to ticket - pass the user ID (using GitHub user ID as a fallback)
      await this.ticketService.addComment(
        relevantIssue.key, 
        { text: commentText },
        userId
      );
      this.logger.info("Added comment to ticket", { ticketKey: relevantIssue.key });

      // Add status check with ticket link
      await context.octokit.repos.createCommitStatus({
        ...context.repo(),
        sha: pr.head.sha,
        state: "success",
        description: `PR ${action} - Linked to ${relevantIssue.key}`,
        target_url: relevantIssue.URL,
        context: "PushToProd/jira-link",
      });
      this.logger.info("Created commit status with Jira link", {
        sha: pr.head.sha,
        ticketKey: relevantIssue.key,
      });
      return;
      this.logger.info("Fetching raw files from PR for analysis.")
      const PRFilesAsRawCode: string = JSON.stringify(await getPRFilesAsRawCode(context, this.logger));

      this.logger.info("Synthesizing");
      const synthesisSummary: Record<string, Record<string, string>> = await this.syntropyService.generateSynthesisSummary(
            PRFilesAsRawCode,
            JSON.stringify(blastRadiusResponse)
      );

      await this.ticketService.addComment(
        relevantIssue.key,
        { text: convertToSimpleJiraFormat(synthesisSummary) },
        userId
      );

      await context.octokit.issues.createComment(
        {
          ...context.repo(),
          issue_number: pr.number,
          body: formatJsonForGithubComment(synthesisSummary)
        });
    });
  }
}

export const createApp = (app: Probot) => {
  const appService = new AppService();
  appService.initialize(app);
};

export default createApp;