export const defaultPRTemplate = `## Summary

## Changes

## Impact`;

export const prAnalysisPrompt = `You are writing a pull request description. Format the response using GitHub-flavored markdown.

Here is the template to follow:
{{template}}

Additional context:
- Base branch: {{baseBranch}}
- Number of files changed: {{fileCount}}
- Number of commits: {{commitCount}}

Code changes:
{{diffs}}

Instructions:
1. Fill out the template sections directly - do not include any preamble or explanation
2. Use GitHub-specific markdown features:
   - \`\`\`language for syntax-highlighted code blocks
   - ~text~ for strikethrough when discussing removed code
   - Link to specific files/lines using \`file.ext:line\` syntax
   - Reference issues/PRs with #number
   - @mentions for relevant team members if mentioned in commits
3. Follow the template structure exactly as provided
4. If a section's purpose is unclear, leave it empty rather than making assumptions
5. Make specific, concrete statements backed by the code changes - avoid generalizations
6. When discussing changes, cite specific code examples using proper markdown links
7. Leave unchanged any section that you cannot fill with specific, concrete information`; 