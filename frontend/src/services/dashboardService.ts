import { apiClient, unwrapResponse } from '@/lib/api-client';
import type { DashboardOverview, MyDashboard } from '@/types';

export const dashboardService = {
  getOverview: () => unwrapResponse<DashboardOverview>(apiClient.get('/dashboard/overview')),
  getMyDashboard: () => unwrapResponse<MyDashboard>(apiClient.get('/dashboard/my')),
};
