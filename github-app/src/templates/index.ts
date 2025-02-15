export const defaultPRTemplate = `## Summary

## Changes

## Impact`;

export const prAnalysisPrompt = `You are writing a pull request description for the repository: {{repository}}. Respond with raw markdown - do not wrap the response in code blocks.

Existing PR Information:
- Title: {{title}}
- Description: {{existingDescription}}

Template to follow:
{{template}}

Additional context:
- Base branch: {{baseBranch}}
- Number of files changed: {{fileCount}}
- Number of commits: {{commitCount}}
- Repository: {{repository}}

Code changes:
{{diffs}}

Instructions:
1. Output the response as raw markdown text, starting directly with the first heading
2. Preserve any existing PR title and description content
3. Use GitHub-specific markdown features:
   - Create permalinks to specific lines using [filename#L123](https://github.com/{{repository}}/blob/commit-sha/filename#L123)
   - Create permalinks to specific code using [\`code snippet\`](https://github.com/{{repository}}/blob/commit-sha/filename#L123)
   - Reference files using [\`folder/file.ext\`](full-permalink-url)
   - Use \`\`\`language for code snippets
   - Compare changes using before/after code blocks
4. Follow the template structure while preserving existing content
5. If a section's purpose is unclear, leave it empty rather than making assumptions
6. Make specific, concise explanations always citing code changes
7. Use the provided permalinks (Base: and Head: URLs) when referencing specific code changes
8. Use GitHub-flavored markdown tables to show before/after comparisons if relevant
9. Do not add any information that is not directly related to the code changes. Sections should be a single sentence or bullet point, followed by a link to the code change.
10. Do not wrap the entire response in a code block.`;
