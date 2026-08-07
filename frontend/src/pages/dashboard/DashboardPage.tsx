import { useEffect } from 'react';
import { useAuth } from '@/features/auth/useAuth';
import { isItAdmin } from '@/lib/permissions';
import { AdminDashboard } from './AdminDashboard';
import { EmployeeDashboard } from './EmployeeDashboard';

export default function DashboardPage() {
  const { user } = useAuth();

  useEffect(() => {
    document.title = 'Dashboard — ITAM Enterprise';
  }, []);

  return isItAdmin(user?.role) ? <AdminDashboard /> : <EmployeeDashboard />;
}
