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
1. IMPORTANT: Preserve any existing PR title and description content - this represents the developer's initial context
2. Integrate existing information with the template structure - do not discard developer-provided details
3. Use GitHub-specific markdown features:
   - \`\`\`language for syntax-highlighted code blocks
   - ~text~ for strikethrough when discussing removed code
   - Link to specific files/lines using \`file.ext:line\` syntax
   - Reference issues/PRs with #number
   - @mentions for relevant team members if mentioned in commits
4. Follow the template structure while preserving existing content
5. If a section's purpose is unclear, leave it empty rather than making assumptions
6. Make specific, concrete statements backed by the code changes - avoid generalizations
7. When discussing changes, cite specific code examples using proper markdown links
8. Leave unchanged any section that you cannot fill with specific, concrete information
9. Do not include any preamble or explanation`; 