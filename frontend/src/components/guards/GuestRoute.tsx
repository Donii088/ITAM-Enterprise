import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/useAuth';
import { routes } from '@/routes/routes';
import { SplashLoader } from '@/components/ui/PageLoader';

export function GuestRoute() {
  const { isAuthenticated, isHydrated } = useAuth();

  if (!isHydrated) {
    return <SplashLoader />;
  }

  if (isAuthenticated) {
    return <Navigate to={routes.dashboard} replace />;
  }

  return <Outlet />;
}
