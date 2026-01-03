import { Navigate } from 'react-router-dom';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  // Check if user role is admin (stored during login)
  if (userRole !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};





