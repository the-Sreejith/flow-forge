'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { mockNextAuth, type Session } from '@/lib/mock-auth';

interface SessionContextType {
  data: Session | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  update: (data: any) => Promise<Session | null>;
}

const SessionContext = createContext<SessionContextType>({
  data: null,
  status: 'loading',
  update: async () => null,
});

export function useSession() {
  return useContext(SessionContext);
}

interface SessionProviderWrapperProps {
  children: React.ReactNode;
}

export function SessionProviderWrapper({ children }: SessionProviderWrapperProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

  useEffect(() => {
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

  const update = async (data: any) => {
    const updatedSession = await mockNextAuth.update(data);
    setSession(updatedSession);
    return updatedSession;
  };

  const value: SessionContextType = {
    data: session,
    status,
    update,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

// For backward compatibility, also export as SessionProvider
export const SessionProvider = SessionProviderWrapper;