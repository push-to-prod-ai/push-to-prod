import { Anthropic } from '@anthropic-ai/sdk';
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});
export default async (app) => {
    app.on(["push"], async (context) => {
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
            const diffs = compare.data.files?.map(file => `File: ${file.filename}\n${file.patch || ""}`).join('\n\n');
            const summary = await anthropic.messages.create({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 1000,
                messages: [{
                        role: 'user',
                        content: `Analyze these code changes and provide a concise summary:\n\n${diffs}`
                    }]
            });
            // Get the text content from the first message
            const summaryText = summary.content
                .filter(block => block.type === 'text')
                .map(block => (block.type === 'text' ? block.text : ''))
                .join('');
            // Update Jira ticket
            const jiraTicketId = 'SCRUM-1';
            await context.octokit.request('POST /rest/api/3/issue/{issueIdOrKey}/comment', {
                baseUrl: 'https://push-to-prod.atlassian.net',
                issueIdOrKey: jiraTicketId,
                body: {
                    body: {
                        type: 'doc',
                        version: 1,
                        content: [{
                                type: 'paragraph',
                                content: [{
                                        type: 'text',
                                        text: summaryText
                                    }]
                            }]
                    }
                },
                headers: {
                    'Authorization': `Basic ${Buffer.from(`${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`).toString('base64')}`,
                    'Accept': 'application/json'
                }
            });
            // Add status check
            await context.octokit.repos.createCommitStatus({
                ...context.repo(),
                sha: push.after,
                state: 'success',
                description: 'Code analysis complete',
                context: 'PushToProd/analysis'
            });
        }
        catch (error) {
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
//# sourceMappingURL=example.js.map