import type { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? [
          GithubProvider({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
          }),
        ]
      : []),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    // Developer Demo Provider: allows testing login locally even before setting up OAuth keys
    CredentialsProvider({
      id: "developer-login",
      name: "Developer Quick Sign-In",
      credentials: {
        name: { label: "Developer Name", type: "text", placeholder: "Akash Pal" },
        email: { label: "Email", type: "email", placeholder: "developer@gitvideo.ai" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        return {
          id: `dev_${credentials.email.replace(/[^a-zA-Z0-9]/g, "_")}`,
          name: credentials.name || "GitVideo Developer",
          email: credentials.email,
          image: "https://avatars.githubusercontent.com/u/9919?s=200&v=4",
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 2 * 24 * 60 * 60, // Exactly 2 straight days (48 hours)
    updateAge: 12 * 60 * 60,  // Check session freshness every 12 hours
  },
  jwt: {
    maxAge: 2 * 24 * 60 * 60, // 2 straight days (48 hours)
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.provider = account?.provider || "developer";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id || token.sub;
        (session.user as any).provider = token.provider;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "gitvideo-super-secret-development-jwt-key-2026",
};

