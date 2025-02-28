'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

// Extract the content into a separate component that uses useSearchParams
function ErrorContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason') || 'unknown_error';
  
  const errorMessages: Record<string, string> = {
    'invalid_setup': 'Invalid GitHub App setup. Missing required parameters.',
    'setup_failed': 'Failed to setup the GitHub App session.',
    'unauthorized': 'You are not authorized to access this page.',
    'unknown_error': 'An unknown error occurred.',
  };
  
  const message = errorMessages[reason] || errorMessages['unknown_error'];
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600">Error</h1>
          <p className="mt-2 text-gray-600">
            {message}
          </p>
        </div>
        
        <div className="mt-8 text-center">
          <Link href="/" className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
            Return to Home
          </Link>
          <p className="mt-4 text-sm text-gray-500">
            If you continue to experience issues, please contact support.
          </p>
        </div>
      </div>
    </div>
  );
}

// Main component wrapped with Suspense
export default function ErrorPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Error</h1>
            <p className="mt-2 text-gray-600">Loading error details...</p>
          </div>
          <div className="flex justify-center mt-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        </div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
} 