# Push to Prod AI Frontend

A Next.js-based frontend application that provides the user interface for the Push to Prod AI platform.

## Prerequisites

- Node.js v22.13.1
- GitHub OAuth Application credentials
- Access to Firebase project

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

### 2. OAuth Configuration

1. [Create a new OAuth App](https://github.com/settings/applications/new) in GitHub
2. Configure the OAuth App with:
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
   - Note the Client ID and Client Secret

### 3. Environment Configuration

1. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

2. Configure the following environment variables:
```env
# NextAuth.js configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# GitHub OAuth credentials
GITHUB_ID=your-github-oauth-client-id
GITHUB_SECRET=your-github-oauth-client-secret

# Firebase configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
SESSION_SECRET=your-session-secret
```

## Running the App

### Local Development

```bash
npm run dev
```
The application will be available at [http://localhost:3000](http://localhost:3000)

### Docker Development

```bash
docker compose up frontend
```
The application will be available at [http://localhost:3000](http://localhost:3000)

## Project Structure

```
.
├── app/                # Next.js 13+ App Router
├── components/         # Reusable UI components
├── lib/               # Shared utilities and configurations
├── public/            # Static assets
└── types/             # TypeScript type definitions
```

## Firebase Collections

The application uses the following Firestore collections:

- `organizations`: Organization data and settings
- `settings`: User-specific settings including Jira integration details
- `users`: User profile and authentication data

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Firebase Documentation](https://firebase.google.com/docs)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

[ISC](LICENSE) © 2024 Push to Prod AI