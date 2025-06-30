// src/app/workflow/[id]/page.tsx

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { WorkflowBuilder } from '@/components/workflow/workflow-builder';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface EditWorkflowPageProps {
  params: { id: string };
}

export default function EditWorkflowPage({ params }: EditWorkflowPageProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isValidating, setIsValidating] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/auth/signin?callbackUrl=/workflow/${params.id}`);
      return;
    }

    if (status === 'authenticated') {
      validateWorkflowAccess();
    }
  }, [status, params.id, router]);

  const validateWorkflowAccess = async () => {
    try {
      setIsValidating(true);
      setError(null);

      // Check if the workflow exists and user has access
      const response = await fetch(`/api/workflows/${params.id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Workflow not found. It may have been deleted or you may not have access to it.');
          return;
        }
        if (response.status === 401) {
          setError('You are not authorized to access this workflow.');
          return;
        }
        throw new Error('Failed to load workflow');
      }

      const result = await response.json();
      
      if (!result.success) {
        setError(result.error || 'Failed to load workflow');
        return;
      }

      // Workflow exists and user has access
      setIsValidating(false);
    } catch (err) {
      console.error('Error validating workflow access:', err);
      setError('An error occurred while loading the workflow. Please try again.');
    }
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  const handleRetry = () => {
    setError(null);
    validateWorkflowAccess();
  };

  if (status === 'loading' || isValidating) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">
            {status === 'loading' ? 'Authenticating...' : 'Loading workflow...'}
          </p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null; // Will redirect
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          
          <div className="flex space-x-3">
            <Button onClick={handleRetry} variant="outline">
              Try Again
            </Button>
            <Button onClick={handleBackToDashboard}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <WorkflowBuilder workflowId={params.id} />;
}
