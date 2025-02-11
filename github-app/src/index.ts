import { Probot } from "probot";
import { AIService } from "./services/ai.js";
import { BlastRadiusService } from "./services/blast-radius.js";
import { TicketService } from "./services/ticket.js";

export const createApp = (app: Probot) => {
  const aiService = new AIService();
  const blastRadiusService = new BlastRadiusService();
  const ticketService = new TicketService();

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

    // Get blast radius calculation
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
};

export default createApp;