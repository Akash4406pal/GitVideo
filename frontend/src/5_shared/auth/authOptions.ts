import type { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    // GitHub OAuth Provider (Primary for developers)
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "placeholder-github-client-id",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "placeholder-github-secret",
    }),

    // Google OAuth Provider (Fast verified workspace login)
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "placeholder-google-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "placeholder-google-secret",
    }),
  ],
  pages: {
    signIn: "/#login",
    error: "/#login-error",
  },
  session: {
    strategy: "jwt",
    maxAge: 2 * 24 * 60 * 60, // 48 hours
    updateAge: 12 * 60 * 60,  // Freshness check every 12 hours
  },
  jwt: {
    maxAge: 2 * 24 * 60 * 60, // 48 hours
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id || token.sub;
        token.provider = account?.provider || "oauth";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || (token.sub as string);
        session.user.provider = (token.provider as string) || "oauth";
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "gitvideo-super-secret-development-jwt-key-2026",
};
