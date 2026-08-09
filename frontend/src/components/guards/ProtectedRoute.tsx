import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/useAuth';
import { routes } from '@/routes/routes';
import { SplashLoader } from '@/components/ui/PageLoader';

export function ProtectedRoute() {
  const { isAuthenticated, isHydrated } = useAuth();
  const location = useLocation();

  if (!isHydrated) {
    return <SplashLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to={routes.login} replace state={{ from: location.pathname + location.search }} />;
  }

  return <Outlet />;
}
