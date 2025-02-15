export const defaultPRTemplate = `## Summary

## Changes

## Impact`;

export const prAnalysisPrompt = `You are writing a pull request description. Format the response using GitHub-flavored markdown.

Existing PR Information:
- Title: {{title}}
- Description: {{existingDescription}}

Template to follow:
{{template}}

Additional context:
- Base branch: {{baseBranch}}
- Number of files changed: {{fileCount}}
- Number of commits: {{commitCount}}

Code changes:
{{diffs}}

Instructions:
1. Output the response as raw markdown text, starting directly with the first heading
2. IMPORTANT: Preserve any existing PR title and description content - this represents the developer's initial context
3. Integrate existing information with the template structure - do not discard developer-provided details
4. Use GitHub-specific markdown features:
   - \`\`\`language for syntax-highlighted code blocks
   - ~text~ for strikethrough when discussing removed code
   - Link to specific files/lines using \`file.ext:line\` syntax
   - Reference issues/PRs with #number
   - @mentions for relevant team members if mentioned in commits
5. Follow the template structure while preserving existing content
6. If a section's purpose is unclear, leave it empty rather than making assumptions
7. Make specific, concrete statements backed by the code changes - avoid generalizations
8. When discussing changes, cite specific code examples using proper markdown links
9. Leave unchanged any section that you cannot fill with specific, concrete information
10. Do not include any preamble or explanation
11. Do not wrap the entire response in a code block
12. Be as concise as possible. The response should be easily skimmable. Use abbreviations, links, technical language, etc.
13. Minimize the amount of text in the response. Prioritize brevity and clarity.`;