import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { DefaultUser } from "next-auth";

// Use the DefaultUser as a base but make id optional to match our session structure
type SessionUser = Partial<DefaultUser>;

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function getCurrentUser(): Promise<SessionUser | undefined> {
  const session = await getSession();
  return session?.user;
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return Boolean(session);
} 