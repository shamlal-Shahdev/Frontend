import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ONBOARDING_PATH = '/vendor/company-onboarding';

export const VendorRoute = () => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  if (!token) {
    return <Navigate to="/vendor/login" replace />;
  }
  if (userRole !== 'vendor') {
    return <Navigate to="/vendor/login" replace />;
  }

  const isOnboarding = location.pathname === ONBOARDING_PATH;
  const complete = localStorage.getItem('vendorCompanyProfileComplete') === 'true';
  if (!isOnboarding && !complete) {
    return <Navigate to={ONBOARDING_PATH} replace />;
  }

  return <Outlet />;
};
