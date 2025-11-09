import { Suspense, lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { Layout } from '@/components/layout/Layout';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

// Lazy-loaded route components - Auth
const Login = lazy(() => import('@/pages/auth/Login'));
const Register = lazy(() => import('@/pages/auth/Register'));
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/auth/ResetPassword'));
const VerifyEmail = lazy(() => import('@/pages/auth/VerifyEmail'));
const KYCSignup = lazy(() => import('@/pages/auth/KYCSignup'));

// Lazy-loaded route components - User
const Dashboard = lazy(() => import('@/pages/user/Dashboard'));
const Profile = lazy(() => import('@/pages/user/Profile'));
const KYCDashboard = lazy(() => import('@/pages/user/KYCDashboard'));

// Lazy-loaded route components - Admin
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage'));
const AdminUserDetailsPage = lazy(() => import('@/pages/admin/AdminUserDetailsPage'));

// Other pages
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
  // Auth Routes (without Layout/Navbar)
  {
    path: '/',
    element: (
      <SuspenseWrapper>
        <Login />
      </SuspenseWrapper>
    ),
    errorElement: (
      <SuspenseWrapper>
        <NotFound />
      </SuspenseWrapper>
    ),
  },
  {
    path: '/login',
    element: (
      <SuspenseWrapper>
        <Login />
      </SuspenseWrapper>
    ),
  },
  {
    path: '/register',
    element: (
      <SuspenseWrapper>
        <Register />
      </SuspenseWrapper>
    ),
  },
  {
    path: '/register-kyc',
    element: (
      <SuspenseWrapper>
        <KYCSignup />
      </SuspenseWrapper>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <SuspenseWrapper>
        <ForgotPassword />
      </SuspenseWrapper>
    ),
  },
  {
    path: '/reset-password',
    element: (
      <SuspenseWrapper>
        <ResetPassword />
      </SuspenseWrapper>
    ),
  },
  {
    path: '/verify-email',
    element: (
      <SuspenseWrapper>
        <VerifyEmail />
      </SuspenseWrapper>
    ),
  },
  
  // Protected Routes (with Layout/Navbar)
  {
    element: <Layout />,
    children: [
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: '/dashboard',
            element: (
              <SuspenseWrapper>
                <Dashboard />
              </SuspenseWrapper>
            ),
          },
          {
            path: '/profile',
            element: (
              <SuspenseWrapper>
                <Profile />
              </SuspenseWrapper>
            ),
          },
          {
            path: '/kyc',
            element: (
              <SuspenseWrapper>
                <KYCDashboard />
              </SuspenseWrapper>
            ),
          },
          
          // Admin Routes
          {
            path: '/admin',
            element: (
              <SuspenseWrapper>
                <AdminDashboardPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: '/admin/dashboard',
            element: (
              <SuspenseWrapper>
                <AdminDashboardPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: '/admin/users',
            element: (
              <SuspenseWrapper>
                <AdminUsersPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: '/admin/users/:userId',
            element: (
              <SuspenseWrapper>
                <AdminUserDetailsPage />
              </SuspenseWrapper>
            ),
          },
        ],
      },
    ],
  },
  
  // 404 Route
  {
    path: '*',
    element: (
      <SuspenseWrapper>
        <NotFound />
      </SuspenseWrapper>
    ),
  },
]);