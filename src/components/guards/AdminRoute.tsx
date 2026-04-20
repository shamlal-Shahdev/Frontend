import { Navigate, Outlet } from 'react-router-dom';

export const AdminRoute = () => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  if (userRole !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }
  return <Outlet />;
};
