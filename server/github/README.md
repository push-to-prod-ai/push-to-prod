# Push to Prod AI GitHub App

A GitHub App built with [Probot](https://github.com/probot/probot) that helps automate and enhance your development workflow.

## Prerequisites

- Node.js v22.13.1
- [GitHub App](https://github.com/settings/apps/new) development instance
- Firebase project
- Gemini API key

## Development Setup

### 1. Node.js Setup

This project uses Node.js v22.13.1. To ensure you're using the correct version:

```bash
# Install nvm (Node Version Manager) if you haven't already
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# In the project directory, run:
nvm install    # Installs the version specified in .nvmrc
nvm use        # Switches to the project's Node.js version

# Install dependencies
npm install
```

### 2. GitHub App Configuration

1. [Create a new GitHub App](https://github.com/settings/apps/new) for development
2. Set up a [Smee.io](https://smee.io) channel for webhook forwarding
3. Configure your GitHub App with the following:
   - Webhook URL: Your Smee.io channel URL
   - Generate and download a private key
   - Note the App ID and Webhook Secret

### 3. Environment Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Configure the following environment variables:
```env
APP_ID=            # Your GitHub App ID
WEBHOOK_SECRET=    # Your GitHub App Webhook Secret
WEBHOOK_PROXY_URL= # Your Smee.io channel URL
LOG_LEVEL=        # Desired log level (trace, debug, info, etc.)
GEMINI_API_KEY=   # Your Gemini API key
FIREBASE_PROJECT_ID= # Your Firebase project ID
PORT=8080         # Local development port
```

3. Place your GitHub App's private key (`.pem` file) in the project root

## Running the App

1. Start the Smee.io webhook proxy:
```bash
npm install -g smee-client
smee --url <YOUR_SMEE_URL> --path /api/github/webhooks --port 3000
```

2. Start the development server:
```bash
npm start
```

## Additional Resources

- [Probot Documentation](https://probot.github.io/docs/)
- [Developing GitHub Apps](https://probot.github.io/docs/development/)
- [GitHub Apps Configuration](https://docs.github.com/en/developers/apps)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

[ISC](LICENSE) © 2024 Push to Prod AI