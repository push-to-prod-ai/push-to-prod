A GitHub App that provides intelligent PR descriptions by analyzing your code changes.

### 🤖 AI-Powered PR Descriptions
- Automatically generates detailed pull request descriptions when PRs are opened or reopened
- Analyzes code changes and provides context-aware summaries
- Creates GitHub-formatted markdown with proper code references and permalinks
- Respects and incorporates existing PR descriptions and titles
- Uses your repository's PR template (from `.github/PULL_REQUEST_TEMPLATE.md`) or falls back to a default template

### 🚧 Coming Soon
- Smart ticket finder to link related issues
- Integration with project management tools (Jira, ClickUp)
- Change impact analysis
- Per-file documentation tracking

### Usage

You can either:
1. Use our hosted version (please provide feedback!)
   - [Install the GitHub App](https://github.com/apps/push-to-prod-app)
   - Open a pull request
   - Watch as the bot analyzes your changes and generates a description
   - Let us know what works and what could be better

2. Self-host your own instance
   - Fork this repository
   - Set up required environment variables
   - Deploy to your preferred Cloud provider
   - Configure your [GitHub App Manually](https://docs.github.com/en/apps/creating-github-apps/about-creating-github-apps/about-creating-github-apps)

### Feedback

We're actively developing this tool and would love to hear from you! If you're using our hosted version, please:
- Open issues for bugs or feature requests
- Share examples of good/bad PR descriptions
- Suggest improvements to the AI prompts
- Let us know about edge cases

## License

[ISC](LICENSE) © 2025 Tyler Cross, Rodrigo Cochran
