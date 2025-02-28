// src/lib/session.ts
import * as jose from 'jose';
import { JWTPayload } from 'jose';

/**
 * Interface for GitHub App installation session data
 */
interface GitHubInstallationSession extends JWTPayload {
  installationId: string;
  setupAction?: string;
  // Add any other properties that might be in the session
}

/**
 * Create a session token for a GitHub App installation
 * 
 * @param payload Data to include in the token (installation info)
 * @returns Signed JWT token
 */
export async function createSessionToken(payload: GitHubInstallationSession): Promise<string> {
  if (!process.env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET environment variable is not set');
  }
  
  // Create a new JWT using jose
  const secret = new TextEncoder().encode(process.env.SESSION_SECRET);
  
  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);
}

/**
 * Verify and decode a session token
 * 
 * @param token JWT token to verify
 * @returns Decoded token payload or null if invalid
 */
export async function verifySessionToken(token: string): Promise<GitHubInstallationSession | null> {
  if (!process.env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET environment variable is not set');
  }
  
  try {
    const secret = new TextEncoder().encode(process.env.SESSION_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    return payload as GitHubInstallationSession;
  } catch (error) {
    console.error('Error verifying session token:', error);
    return null;
  }
}

/**
 * Check if a session is still valid
 * 
 * @param session Session data
 * @returns Boolean indicating if session is valid
 */
export function isValidSession(session: GitHubInstallationSession | null | undefined): boolean {
  if (!session) return false;
  
  // Check if installation ID exists
  if (!session.installationId) return false;
  
  // You can add more validation as needed
  return true;
}