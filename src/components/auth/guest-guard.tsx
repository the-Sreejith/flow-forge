'use client';

import { useSession } from '@/lib/mock-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface GuestGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function GuestGuard({ children, fallback }: GuestGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading

    if (session) {
      router.push('/dashboard');
      return;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )
    );
  }

  if (session) {
    return null;
  }

  return <>{children}</>;
}