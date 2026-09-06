import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/useAuth';
import { hasRole } from '@/lib/permissions';
import { routes } from '@/routes/routes';
import type { Role } from '@/types';

export function RoleRoute({ allow }: { allow: Role[] }) {
  const { user } = useAuth();

  if (!hasRole(user?.role, allow)) {
    return <Navigate to={routes.unauthorized} replace />;
  }

  return <Outlet />;
}
