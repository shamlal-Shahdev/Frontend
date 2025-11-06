import { Suspense, lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { Layout } from '@/components/layout/Layout';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

// Lazy-loaded route components
const Auth = lazy(() => import('@/pages/Auth'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Profile = lazy(() => import('@/pages/Profile'));
const NotFound = lazy(() => import('@/pages/NotFound'));

/**
 * Router Configuration
 * Features:
 * - Code splitting with lazy loading
 * - Protected routes
 * - Nested layouts
 * - Error boundaries
 * - 404 handling
 */
// Wrap component with Suspense
const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense
    fallback={
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    }
  >
    {children}
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: (
      <SuspenseWrapper>
        <NotFound />
      </SuspenseWrapper>
    ),
    children: [
      {
        index: true,
        element: (
          <SuspenseWrapper>
            <Auth />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'auth',
        element: (
          <SuspenseWrapper>
            <Auth />
          </SuspenseWrapper>
        ),
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: 'dashboard',
            element: (
              <SuspenseWrapper>
                <Dashboard />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'profile',
            element: (
              <SuspenseWrapper>
                <Profile />
              </SuspenseWrapper>
            ),
          },
        ],
      },
    ],
  },
]);