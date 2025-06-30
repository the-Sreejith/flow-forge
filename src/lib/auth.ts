// COMMENTED OUT - USING MOCK AUTH INSTEAD
// This file is preserved for future use when switching back to NextAuth

/*
import NextAuth, { type NextAuthOptions } from "next-auth";
// import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  // Remove PrismaAdapter since we're using mock data
  // adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },

  providers: [
    // Username / password
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        if (!creds?.email || !creds?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: creds.email },
        });
        if (!user?.password) return null;

        const valid = await bcrypt.compare(creds.password, user.password);
        return valid ? user : null;
      },
    }),

    // OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.subscription = (user as any).subscription;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.subscription = token.subscription as string;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // For OAuth providers, we'll create a user in our mock database
      if (account?.provider !== 'credentials' && user.email) {
        try {
          // Check if user already exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email }
          });

          if (!existingUser) {
            // Create new user
            await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || '',
                image: user.image || '',
                role: 'user',
                subscription: 'free',
              }
            });
          }
        } catch (error) {
          console.error('Error creating user:', error);
          return false;
        }
      }
      return true;
    },
  },

  pages: {
    signIn: "/auth/login",
    signUp: "/auth/register",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
*/

import { prisma } from './prisma';

// Export mock auth functions for compatibility
export { mockNextAuth as NextAuth } from './mock-auth';
export { signIn, signOut } from './mock-auth';

// Server-side getSession function that works with the mock database
export async function getSession() {
  try {
    // For server-side, we'll return the first user from mock database as a fallback
    // In a real implementation, this would validate a JWT token or session cookie
    const users = await prisma.user.findMany();
    const currentUser = users.find(user => user.email === 'john@example.com') || users[0];
    
    if (!currentUser) {
      return null;
    }

    return {
      user: {
        id: currentUser.id,
        email: currentUser.email,
        name: currentUser.name,
        image: currentUser.image,
        role: currentUser.role,
        subscription: currentUser.subscription,
      }
    };
  } catch (error) {
    console.error('Error getting server session:', error);
    return null;
  }
}