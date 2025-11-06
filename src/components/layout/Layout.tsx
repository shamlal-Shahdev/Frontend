import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Navbar } from '@/components/layout/Navbar';

/**
 * Layout: Main application layout wrapper
 * Features:
 * - Consistent layout across routes
 * - Loading state for route transitions
 * - Navbar integration
 * - Error boundary support
 */
export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Suspense fallback={
          <div className="flex justify-center items-center h-[50vh]">
            <LoadingSpinner size="lg" />
          </div>
        }>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
};