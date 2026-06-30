export function resolveBackPath(pathname: string): string | null {
  if (
    pathname === '/dashboard' ||
    pathname === '/vendor/dashboard' ||
    pathname === '/admin/dashboard'
  ) {
    return null;
  }

  if (
    pathname === '/marketplace/my-coupons' ||
    pathname === '/marketplace/purchase-success'
  ) {
    return '/marketplace';
  }

  if (pathname === '/installation-status') {
    return '/install-to-earn';
  }

  if (pathname === '/energy/status') {
    return '/dashboard';
  }

  if (pathname === '/profile') {
    return '/dashboard';
  }

  if (pathname === '/kyc/documents') {
    return '/kyc/info';
  }

  if (pathname === '/kyc-status' || pathname === '/kyc/info') {
    return '/dashboard';
  }

  if (pathname === '/vendor/marketplace/coupons/create') {
    return '/vendor/marketplace/coupons';
  }

  if (pathname === '/vendor/marketplace/coupons') {
    return '/vendor/marketplace';
  }

  if (/^\/admin\/kyc\/\d+/.test(pathname)) {
    return '/admin/kyc';
  }

  if (pathname.startsWith('/vendor/')) {
    return '/vendor/dashboard';
  }

  if (pathname.startsWith('/admin/')) {
    return '/admin/dashboard';
  }

  return '/dashboard';
}
