import { Navigate, Outlet } from 'react-router-dom';

/** Wrap nested routes; each child is rendered via `<Outlet />`. */
export const ProtectedRoute = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};
