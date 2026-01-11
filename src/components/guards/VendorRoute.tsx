import { Navigate } from 'react-router-dom';

interface VendorRouteProps {
  children: React.ReactNode;
}

export const VendorRoute = ({ children }: VendorRouteProps) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  
  if (!token) {
    return <Navigate to="/vendor/login" replace />;
  }

  // Check if user role is vendor (stored during login)
  if (userRole !== 'vendor') {
    return <Navigate to="/vendor/login" replace />;
  }

  return <>{children}</>;
};


