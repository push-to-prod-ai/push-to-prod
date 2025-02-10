# push-to-prod

A GitHub App that analyzes code changes on push to main and updates Jira tickets with AI-generated summaries using Claude.

## Features

- Monitors pushes to the main branch
- Analyzes code changes using Claude AI
- Updates specified Jira ticket with change summaries
- Adds commit status checks

## Setup

1. Create a GitHub App:
   - Required permissions: contents (read), issues (write), metadata (read), statuses (write)
   - Subscribe to push events
   - Get App ID and private key

2. Configure environment:
```bash
# Copy example config
cp .env.example .env

# Fill in required values
- APP_ID
- PRIVATE_KEY
- ANTHROPIC_API_KEY
- JIRA_EMAIL
- JIRA_API_TOKEN
```

3. Run with Docker:
```bash
docker build -t push-to-prod .
docker run -e APP_ID=<app-id> -e PRIVATE_KEY=<pem-value> push-to-prod
```

Or run locally:
```bash
npm install
npm start
```

## Example Output

When running properly, you'll see logs like this:

```
➜  push-to-prod git:(main) npm run build && npm start

> push-to-prod@1.0.0 build
> tsc

> push-to-prod@1.0.0 start
> probot run ./lib/index.js

INFO (server): Running Probot v13.4.2 (Node.js: v18.20.5)
INFO (server): Forwarding https://smee.io/[...] to http://localhost:3000/api/github/webhooks
INFO (server): Listening on http://localhost:3000
INFO (server): Connected
```

After a push to main, the app will:
1. Analyze the changes using Claude
2. Update the Jira ticket with a summary
3. Add a success status to the commit

![Example Jira output showing AI-generated summaries of code changes](https://raw.githubusercontent.com/push-to-prod-ai/push-to-prod/483dbbbc5b9cbd8de7e98abd6f1b05eb43284b6a/jira-example.png)

## License

[ISC](LICENSE) © 2025 Tyler Cross
