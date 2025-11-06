import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/auth.context';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface ProtectedRouteProps {
  redirectPath?: string;
  children?: React.ReactNode;
}

/**
 * ProtectedRoute: Handles authentication-based routing
 * Features:
 * - Redirects unauthenticated users
 * - Shows loading state
 * - Supports nested routes
 * - Customizable redirect path
 */
export const ProtectedRoute = ({
  redirectPath = '/auth',
  children,
}: ProtectedRouteProps) => {
  const { state: { isAuthenticated, isLoading } } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  return children ?? <Outlet />;
};