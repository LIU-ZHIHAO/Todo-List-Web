import React from 'react';
import { Providers } from './features/core/context/Providers';
import { ErrorBoundary } from './features/core/components/ErrorBoundary';
import { AuthGuard } from './features/core/components/AuthGuard';
import { AppLayout } from './features/layout/components/AppLayout';

export default function App() {
  return (
    <ErrorBoundary>
      <Providers>
        <AuthGuard>
          <AppLayout />
        </AuthGuard>
      </Providers>
    </ErrorBoundary>
  );
}
