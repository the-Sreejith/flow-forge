'use client';

import { mockDb } from './mock-db';
import bcrypt from 'bcryptjs';

// Mock session storage (in real app this would be handled by NextAuth)
let currentSession: any = null;

// Types matching NextAuth
export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: string;
  subscription: string;
}

export interface Session {
  user: User;
  expires: string;
}

export interface SignInResponse {
  error?: string;
  status: number;
  ok: boolean;
  url?: string;
}

// Mock NextAuth functions
export const mockNextAuth = {
  // Sign in with credentials
  async signIn(
    provider: string,
    options?: {
      email?: string;
      password?: string;
      redirect?: boolean;
      callbackUrl?: string;
    }
  ): Promise<SignInResponse> {
    if (provider === 'credentials') {
      if (!options?.email || !options?.password) {
        return {
          error: 'Missing credentials',
          status: 400,
          ok: false,
        };
      }

      try {
        // Find user in mock database
        const user = mockDb.user.findUnique({
          where: { email: options.email }
        });

        if (!user || !user.password) {
          return {
            error: 'Invalid credentials',
            status: 401,
            ok: false,
          };
        }

        // Verify password
        const isValid = await bcrypt.compare(options.password, user.password);
        if (!isValid) {
          return {
            error: 'Invalid credentials',
            status: 401,
            ok: false,
          };
        }

        // Create session
        const sessionExpires = new Date();
        sessionExpires.setDate(sessionExpires.getDate() + 30); // 30 days

        currentSession = {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
            subscription: user.subscription,
          },
          expires: sessionExpires.toISOString(),
        };

        // Store in localStorage for persistence
        if (typeof window !== 'undefined') {
          localStorage.setItem('mock-session', JSON.stringify(currentSession));
        }

        return {
          status: 200,
          ok: true,
          url: options.callbackUrl || '/dashboard',
        };
      } catch (error) {
        return {
          error: 'Authentication failed',
          status: 500,
          ok: false,
        };
      }
    }

    // For OAuth providers (Google, GitHub), simulate successful login
    if (provider === 'google' || provider === 'github') {
      // Create a demo user for OAuth
      const demoUser = {
        id: 'oauth-demo-user',
        name: `Demo ${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
        email: `demo@${provider}.com`,
        image: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
        role: 'user',
        subscription: 'free',
      };

      const sessionExpires = new Date();
      sessionExpires.setDate(sessionExpires.getDate() + 30);

      currentSession = {
        user: demoUser,
        expires: sessionExpires.toISOString(),
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('mock-session', JSON.stringify(currentSession));
      }

      return {
        status: 200,
        ok: true,
        url: options?.callbackUrl || '/dashboard',
      };
    }

    return {
      error: 'Provider not supported',
      status: 400,
      ok: false,
    };
  },

  // Sign out
  async signOut(options?: { callbackUrl?: string; redirect?: boolean }) {
    currentSession = null;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mock-session');
    }

    return {
      url: options?.callbackUrl || '/auth/login',
    };
  },

  // Get session
  async getSession(): Promise<Session | null> {
    // Try to restore from localStorage
    if (typeof window !== 'undefined' && !currentSession) {
      const stored = localStorage.getItem('mock-session');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Check if session is still valid
          if (new Date(parsed.expires) > new Date()) {
            currentSession = parsed;
          } else {
            localStorage.removeItem('mock-session');
          }
        } catch (error) {
          localStorage.removeItem('mock-session');
        }
      }
    }

    return currentSession;
  },

  // Update session
  async update(data: Partial<User>): Promise<Session | null> {
    if (!currentSession) return null;

    currentSession.user = {
      ...currentSession.user,
      ...data,
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('mock-session', JSON.stringify(currentSession));
    }

    return currentSession;
  },
};

// Mock useSession hook
export function useMockSession() {
  const [session, setSession] = React.useState<Session | null>(null);
  const [status, setStatus] = React.useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

  React.useEffect(() => {
    const loadSession = async () => {
      try {
        const currentSession = await mockNextAuth.getSession();
        setSession(currentSession);
        setStatus(currentSession ? 'authenticated' : 'unauthenticated');
      } catch (error) {
        setSession(null);
        setStatus('unauthenticated');
      }
    };

    loadSession();

    // Listen for storage changes (for cross-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'mock-session') {
        loadSession();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, []);

  return {
    data: session,
    status,
    update: mockNextAuth.update,
  };
}

// Export for compatibility
export { useMockSession as useSession };
export const signIn = mockNextAuth.signIn;
export const signOut = mockNextAuth.signOut;
export const getSession = mockNextAuth.getSession;

// React import for the hook
import * as React from 'react';