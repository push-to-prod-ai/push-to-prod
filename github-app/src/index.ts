import { Probot } from "probot";
import { AIService } from "./services/ai.js";
import { BlastRadiusService } from "./services/blast-radius.js";
import { TicketService } from "./services/ticket.js";

export const createApp = (app: Probot) => {
  const aiService = new AIService();
  const blastRadiusService = new BlastRadiusService();
  const ticketService = new TicketService();

  app.on(["push"], async (context) => {
    app.log.info("Processing push event", {
      repo: context.repo(),
      ref: context.payload.ref,
      labels: {
        repository: context.payload.repository?.full_name,
        sender: context.payload.sender?.login,
      },
    });

    // Skip if not targeting the main branch.
    const push = context.payload;
    if (push.ref !== "refs/heads/main") return;

    // Get the diff for analysis
    const compare = await context.octokit.repos.compareCommits({
      ...context.repo(),
      base: push.before,
      head: push.after,
    });

    // Create a diff string for the prompt.
    const diffs = compare.data.files
      ?.map(file => `File: ${file.filename}\n${file.patch || ""}`)
      .join("\n\n");

    // Build prompt and generate summary
    const prompt = `Analyze these code changes and provide a concise summary:\n\n${diffs}`;
    const summaryText = await aiService.generateContent(prompt);

    // Get blast radius calculation
    const blastRadiusResponse = await blastRadiusService.calculateBlastRadius(summaryText);

    if (!blastRadiusResponse.relevant_issues.length) {
      app.log.info("No relevant Jira tickets found for this change");
      return;
    }

    const relevantIssue = blastRadiusResponse.relevant_issues[0];

    // Add comment to ticket
    await ticketService.addComment(relevantIssue.key, { text: summaryText });

    // Add status check with ticket link
    await context.octokit.repos.createCommitStatus({
      ...context.repo(),
      sha: push.after,
      state: "success",
      description: `Analysis linked to ${relevantIssue.key}`,
      target_url: relevantIssue.URL,
      context: "Ticket-Update",
    });
  });
};

export default createApp;