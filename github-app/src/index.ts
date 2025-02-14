import { Probot } from "probot";
import { AIService } from "./services/ai.js";
import { BlastRadiusService } from "./services/blast-radius.js";
import { TicketService } from "./services/ticket.js";

export const createApp = (app: Probot) => {
  const aiService = new AIService();
  const blastRadiusService = new BlastRadiusService();
  const ticketService = new TicketService();

  const ticketFeatureFlag = false;

  // Add PR handler
  app.on(["pull_request.opened", "pull_request.reopened"], async (context) => {
    const { pull_request: pr } = context.payload;
    app.log.info("Processing pull request event", {
      repo: context.repo(),
      pr: pr.number,
      labels: {
        repository: pr.base.repo.full_name,
        sender: pr.user.login,
      },
    });

    // Get the PR diff
    const compare = await context.octokit.repos.compareCommits({
      ...context.repo(),
      base: pr.base.sha,
      head: pr.head.sha,
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
      app.log.info("No PR template found, using default format");
      template = "## Summary\n\n## Changes\n\n## Impact\n\n";
    }

    // Create a diff string for the prompt
    const diffs = compare.data.files
      ?.map(file => `File: ${file.filename}\n${file.patch || ""}`)
      .join("\n\n");

    // Build prompt and generate PR description
    const prompt = `Here is a pull request template:\n\n${template}\n\nBased on these code changes, please fill out the template appropriately:\n\n${diffs}`;
    const prDescription = await aiService.generateContent(prompt);

    // Update the PR description
    await context.octokit.pulls.update({
      ...context.repo(),
      pull_number: pr.number,
      body: prDescription,
    });

    app.log.info("Updated PR description", { pr: pr.number });
  });

  // Disabling this feature for now. We will flesh out later.
  if (ticketFeatureFlag) {  
    app.on(["push"], async (context) => {
      const { ref, repository, sender } = context.payload;
      app.log.info("Processing push event", {
        repo: context.repo(),
        ref,
        labels: {
          repository: repository?.full_name,
          sender: sender?.login,
        },
      });

      // Skip if not targeting the main branch.
      if (ref !== "refs/heads/main") {
        app.log.info("Skipping non-main branch", { ref });
        return;
      }

      // Get the diff for analysis
      const compare = await context.octokit.repos.compareCommits({
        ...context.repo(),
        base: context.payload.before,
        head: context.payload.after,
      });
      app.log.info("Retrieved commit comparison", {
        files: compare.data.files?.length,
        commits: compare.data.commits?.length,
      });

      // Create a diff string for the prompt.
      const diffs = compare.data.files
        ?.map(file => `File: ${file.filename}\n${file.patch || ""}`)
        .join("\n\n");

      // Build prompt and generate summary
      const prompt = `Analyze these code changes and provide a concise summary:\n\n${diffs}`;
      const summaryText = await aiService.generateContent(prompt);
      app.log.info("Generated AI summary", { summaryLength: summaryText.length });

      // Get blast radius calculation, we will flesh out this part of the app later
      const blastRadiusResponse = await blastRadiusService.calculateBlastRadius(summaryText);
      app.log.info("Calculated blast radius", {
        issuesFound: blastRadiusResponse.relevant_issues.length,
      });

      if (!blastRadiusResponse.relevant_issues.length) {
        app.log.info("No relevant tickets found for this change");
        return;
      }
      const relevantIssue = blastRadiusResponse.relevant_issues[0];
      app.log.info("Selected relevant ticket", { ticketKey: relevantIssue.key });

      // Add comment to ticket
      await ticketService.addComment(relevantIssue.key, { text: summaryText });
      app.log.info("Added comment to ticket", { ticketKey: relevantIssue.key });

      // Add status check with ticket link
      await context.octokit.repos.createCommitStatus({
        ...context.repo(),
        sha: context.payload.after,
        state: "success",
        description: `Analysis linked to ${relevantIssue.key}`,
        target_url: relevantIssue.URL,
        context: "PushToProd/analysis",
      });
      app.log.info("Created commit status", {
        sha: context.payload.after,
        ticketKey: relevantIssue.key,
      });
    });
  }
};

export default createApp;