# push-to-prod

A GitHub App that analyzes code changes on push to main and updates Jira tickets with AI-generated summaries using Claude.

## Features

- Monitors pushes to the main branch
- Analyzes code changes using Claude AI
- Updates specified Jira ticket with change summaries
- Adds commit status checks

## Setup

1. Create a GitHub App and configure with:
   - Webhook URL (using smee.io for development)
   - Required permissions: contents (read), issues (write), metadata (read), statuses (write)
   - Subscribe to push events

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example` and fill in:
   - GitHub App credentials (APP_ID, PRIVATE_KEY)
   - Anthropic API key
   - Jira credentials
   - Webhook configuration

4. Run the app:
```bash
npm start
```

## Environment Variables

- `APP_ID`: GitHub App ID
- `PRIVATE_KEY`: GitHub App private key
- `WEBHOOK_SECRET`: Secret for webhook verification
- `ANTHROPIC_API_KEY`: Claude API key
- `JIRA_EMAIL`: Jira account email
- `JIRA_API_TOKEN`: Jira API token


## Docker

```sh
# 1. Build container
docker build -t push-to-prod .

# 2. Start container
docker run -e APP_ID=<app-id> -e PRIVATE_KEY=<pem-value> push-to-prod
```

## Contributing

If you have suggestions for how push-to-prod could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2025 Tyler Cross
