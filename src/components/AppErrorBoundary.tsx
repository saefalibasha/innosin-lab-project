import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Button } from '@/components/ui/button';

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  console.error('App Error:', error);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <div className="text-center space-y-6 max-w-md">
        <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
        <p className="text-muted-foreground">
          {error.message || 'An unexpected error occurred'}
        </p>
        <Button onClick={resetErrorBoundary} variant="default">
          Try again
        </Button>
      </div>
    </div>
  );
}

export function AppErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('Error Boundary caught an error:', error, errorInfo);
      }}
      onReset={() => {
        window.location.reload();
      }}
    >
      {children}
    </ErrorBoundary>
  );
}