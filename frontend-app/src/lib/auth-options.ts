import GithubProvider from "next-auth/providers/github";
import { getFirestoreDb, collections } from "@/lib/firebase";
import { DefaultSession, NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";

// More concise type extension using DefaultSession
declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id?: string;
    }
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "github") {
        try {
          // Store user in Firestore
          const db = getFirestoreDb();
          await db.collection(collections.users).doc(user.id).set({
            name: user.name,
            email: user.email,
            image: user.image,
            githubId: account.providerAccountId,
            updatedAt: new Date(),
          }, { merge: true });
          return true;
        } catch (error) {
          console.error("Error saving user to Firestore:", error);
          return true; // Still allow sign in even if DB save fails
        }
      }
      return true;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: "jwt",
  },
}; 