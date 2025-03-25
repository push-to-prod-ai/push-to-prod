import { Probot } from "probot";
import { AIService } from "./services/ai.js";
import { BlastRadiusService } from "./services/blast-radius.js";
import { TicketService } from "./services/ticket.js";
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
  private ticketFeatureFlag = false;

  constructor() {
    this.logger = new Logger();
    this.aiService = new AIService();
    this.blastRadiusService = new BlastRadiusService();
    this.ticketService = new TicketService();
  }

  /**
   * Initialize the app with Probot
   * @param app Probot instance
   */
  initialize(app: Probot) {
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
    
    // Add PR handler
    app.on(["pull_request.opened", "pull_request.reopened"], async (context) => {
      const { pull_request: pr } = context.payload;
      this.logger.info("Processing pull request event", {
        repo: context.repo(),
        pr: pr.number,
        labels: {
          repository: pr.base.repo.full_name,
          sender: pr.user.login,
        },
      });

      // Get the PR diff with more context using the non-deprecated endpoint
      const compare = await context.octokit.repos.compareCommitsWithBasehead({
        ...context.repo(),
        basehead: `${pr.base.sha}...${pr.head.sha}`,
        mediaType: {
          format: 'diff'
        }
      });

      // Create rich diff information without downloading files
      const detailedFiles = compare.data.files?.map(file => ({
        filename: file.filename,
        patch: file.patch || "",
        status: file.status,
        additions: file.additions,
        deletions: file.deletions,
        basePermalink: `https://github.com/${pr.base.repo.full_name}/blob/${pr.base.sha}/${file.filename}`,
        headPermalink: `https://github.com/${pr.base.repo.full_name}/blob/${pr.head.sha}/${file.filename}`,
        rawUrl: file.raw_url,
        blobUrl: file.blob_url,
      }));

      // Create a rich diff string
      const diffs = detailedFiles?.map(file => `
      File: ${file.filename}
      Status: ${file.status}
      Changes: +${file.additions} -${file.deletions}
      Base: ${file.basePermalink}
      Head: ${file.headPermalink}
      Raw: ${file.rawUrl}
      Blob: ${file.blobUrl}

      Diff:
      ${file.patch}
      `).join("\n\n") || "";

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
        .replace("{{fileCount}}", String(compare.data.files?.length || 0))
        .replace("{{commitCount}}", String(compare.data.commits?.length || 0))
        .replace("{{repository}}", pr.base.repo.full_name)
        .replace("{{diffs}}", diffs);
        
      const prDescription = await this.aiService.generateContent(prompt);
      // Clean up the response
      const cleanDescription = prDescription
        // Remove any markdown or code block indicators at the start
        .replace(/^```\w*\n/, '')
        // Remove any closing code block indicators at the end
        .replace(/\n```$/, '')
        // Trim any extra whitespace
        .trim();

      // Update the PR description
      await context.octokit.pulls.update({
        ...context.repo(),
        pull_number: pr.number,
        body: cleanDescription,
      });

      // Add a notification comment
      await context.octokit.issues.createComment({
        ...context.repo(),
        issue_number: pr.number,
        body: "🤖 I've analyzed the changes and updated the PR description based on the diff. Please review and adjust if needed!"
      });

      this.logger.info("Updated PR description and added comment", { pr: pr.number });
    });

    // Disabling this feature for now. We will flesh out later.
    if (this.ticketFeatureFlag) {  
      app.on(["push"], async (context) => {
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

        // TODO: update the content generation to use syntropy app.
        // Build prompt and generate summary
        // const prompt = `Analyze these code changes and provide a concise summary:\n\n${diffs}`;
        // const summaryText = await this.aiService.generateContent(prompt);

        // TODO: we need a way to pull the requirements, then to pass to the summarizing sequence.
        //  Since we're working with async, how do we parallelize the summarizers?
        const requirements: string = "Sample requirements";
        const requirementsSummary: Record<string, any> = await this.aiService.summarizeRequirements(requirements) ?? {};
        this.logger.info(
            "Generated requirement summary",
            { summaryLength: JSON.stringify(requirementsSummary).length }
        );

        const codeSummary: Record<string, any> = await this.aiService.summarizeCode(diffs) ?? {};
        this.logger.info("Generated code summary", { summaryLength: JSON.stringify(codeSummary).length });

        const alignment: Record<string, any> = await this.aiService.compareSummaries(codeSummary, requirementsSummary) ?? {};

        // Get blast radius calculation, we will flesh out this part of the app later
        // TODO: determine if we should use alignment or code summary for blast radius.
        const blastRadiusResponse = await this.blastRadiusService.calculateBlastRadius(
            JSON.stringify(alignment)
        );
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
          { text: JSON.stringify(codeSummary) },
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