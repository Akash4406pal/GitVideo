import type { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    // GitHub OAuth Provider
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "placeholder-github-client-id",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "placeholder-github-secret",
    }),

    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "placeholder-google-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "placeholder-google-secret",
    }),

    // Email & Developer Fast Sign-In Provider
    CredentialsProvider({
      id: "credentials",
      name: "Developer Sign-In",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "developer@example.com" },
        name: { label: "Full Name", type: "text", placeholder: "Akash Pal" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          return null;
        }

        const email = credentials.email.trim().toLowerCase();
        const name = credentials.name?.trim() || email.split("@")[0] || "Developer";

        // Deterministic sanitized ID based on email
        const cleanId = `usr_${email.replace(/[^a-zA-Z0-9_]/g, "_")}`;

        return {
          id: cleanId,
          name: name,
          email: email,
          image: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanId)}`,
          provider: "credentials",
        };
      },
    }),
  ],
  pages: {
    signIn: "/#login",
    error: "/#login-error",
  },
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
        token.provider = account?.provider || "credentials";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || (token.sub as string);
        session.user.provider = (token.provider as string) || "credentials";
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "gitvideo-super-secret-development-jwt-key-2026",
};
