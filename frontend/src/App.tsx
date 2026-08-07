import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { AUTH_LOGOUT_EVENT } from '@/lib/api-client';
import { routes } from '@/routes/routes';
import { ROLES } from '@/lib/permissions';

import { AuthLayout } from '@/components/layout/AuthLayout';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { GuestRoute } from '@/components/guards/GuestRoute';
import { ProtectedRoute } from '@/components/guards/ProtectedRoute';
import { RoleRoute } from '@/components/guards/RoleRoute';
import { PageLoader } from '@/components/ui/PageLoader';

import Login from '@/pages/public/Login';
import NotFound from '@/pages/public/NotFound';
import Unauthorized from '@/pages/public/Unauthorized';

const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));
const ProfilePage = lazy(() => import('@/pages/profile/ProfilePage'));
const SearchPage = lazy(() => import('@/pages/search/SearchPage'));
const AssetsListPage = lazy(() => import('@/pages/assets/AssetsListPage'));
const AssetDetailPage = lazy(() => import('@/pages/assets/AssetDetailPage'));
const AssignmentsListPage = lazy(() => import('@/pages/assignments/AssignmentsListPage'));
const MyAssetsPage = lazy(() => import('@/pages/assignments/MyAssetsPage'));
const TicketsListPage = lazy(() => import('@/pages/tickets/TicketsListPage'));
const MyTicketsPage = lazy(() => import('@/pages/tickets/MyTicketsPage'));
const TicketDetailPage = lazy(() => import('@/pages/tickets/TicketDetailPage'));
const RepairsListPage = lazy(() => import('@/pages/repairs/RepairsListPage'));
const UsersListPage = lazy(() => import('@/pages/users/UsersListPage'));

function withSuspense(element: React.ReactNode) {
  return <Suspense fallback={<PageLoader />}>{element}</Suspense>;
}

function GlobalAuthListener() {
  const navigate = useNavigate();

  useEffect(() => {
    function handleLogout() {
      navigate(routes.login, { replace: true });
    }
    window.addEventListener(AUTH_LOGOUT_EVENT, handleLogout);
    return () => window.removeEventListener(AUTH_LOGOUT_EVENT, handleLogout);
  }, [navigate]);

  return null;
}

export default function App() {
  return (
    <>
      <GlobalAuthListener />
      <Routes>
        <Route element={<GuestRoute />}>
          <Route element={<AuthLayout />}>
            <Route path={routes.login} element={<Login />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path={routes.dashboard} element={withSuspense(<DashboardPage />)} />
            <Route path={routes.profile} element={withSuspense(<ProfilePage />)} />
            <Route path={routes.search} element={withSuspense(<SearchPage />)} />
            <Route path={routes.myAssets} element={withSuspense(<MyAssetsPage />)} />
            <Route path={routes.tickets.mine} element={withSuspense(<MyTicketsPage />)} />
            <Route path={routes.tickets.detail(':id')} element={withSuspense(<TicketDetailPage />)} />

            <Route element={<RoleRoute allow={[ROLES.ITADMIN]} />}>
              <Route path={routes.assets.list} element={withSuspense(<AssetsListPage />)} />
              <Route path={routes.assets.detail(':id')} element={withSuspense(<AssetDetailPage />)} />
              <Route path={routes.assignments.list} element={withSuspense(<AssignmentsListPage />)} />
              <Route path={routes.tickets.list} element={withSuspense(<TicketsListPage />)} />
              <Route path={routes.repairs.list} element={withSuspense(<RepairsListPage />)} />
              <Route path={routes.users.list} element={withSuspense(<UsersListPage />)} />
            </Route>

            <Route index element={<Navigate to={routes.dashboard} replace />} />
          </Route>
        </Route>

        <Route path={routes.unauthorized} element={<Unauthorized />} />
        <Route path={routes.notFound} element={<NotFound />} />
        <Route path="/" element={<Navigate to={routes.dashboard} replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
