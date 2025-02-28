# Push to Prod Frontend

This is a Next.js application for configuring the Push to Prod GitHub app integration with Jira.

## Project Structure

The project follows a simplified Next.js App Router structure:

```
frontend-app/
├── public/             # Static assets
├── src/
│   ├── app/            # Next.js App Router pages and API routes
│   │   ├── api/        # API routes
│   │   │   ├── auth/   # NextAuth.js authentication API
│   │   │   ├── github/ # GitHub App integration API
│   │   │   └── settings/ # Settings API
│   │   ├── auth/       # Authentication pages
│   │   │   └── signin/ # Sign-in page
│   │   ├── error/      # Error handling page
│   │   ├── globals.css # Global CSS
│   │   ├── layout.tsx  # Root layout component
│   │   └── page.tsx    # Home page component
│   ├── components/     # React components
│   │   ├── AuthProvider.tsx # Auth context provider
│   │   ├── Header.tsx  # Header component
│   │   └── SettingsForm.tsx # Settings form component
│   ├── lib/            # Library code
│   │   ├── auth-options.ts # NextAuth configuration
│   │   ├── firebase.ts # Firebase configuration
│   │   └── session.ts  # Session management utilities
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   │   └── auth.ts     # Auth helper functions  
│   └── middleware.ts   # Next.js middleware for auth protection
└── ... (config files)
```

## Authentication

The app supports two authentication methods:
1. **GitHub App Installation** - Used during initial setup and when reconfiguring via GitHub
2. **GitHub OAuth** - Used for direct access to configuration after installation

## Key Features

- GitHub authentication using NextAuth.js
- Firestore integration for data storage
- Protected routes with middleware
- Jira integration configuration

## Environment Variables

Create a `.env.local` file with the following variables:

```
# Next Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# GitHub OAuth (for direct access)
GITHUB_ID=your_github_oauth_client_id
GITHUB_SECRET=your_github_oauth_client_secret

# GitHub App Installation Sessions
SESSION_SECRET=your_session_secret

# Firebase
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY=your_firebase_private_key
```

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Set up environment variables in `.env.local`

3. Run the development server:
   ```
   npm run dev
   ```

4. Build for production:
   ```
   npm run build
   ```

## GitHub App Configuration

To set up your GitHub App:

1. Create a GitHub App in your GitHub Developer Settings
2. Configure the following:
   - **Callback URL**: `https://your-domain.com/api/auth/callback/github` (for OAuth)
   - **Setup URL**: `https://your-domain.com/api/github/setup` (for App installation)
   - **Webhook URL**: Your webhook endpoint for GitHub events
   - **Permissions**: Configure necessary repository, organization, and user permissions
3. Install the app in your organization/account 