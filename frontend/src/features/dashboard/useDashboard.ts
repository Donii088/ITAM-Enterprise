import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboardService';
import { queryKeys } from '@/lib/query-keys';

export function useDashboardOverview() {
  return useQuery({
    queryKey: queryKeys.dashboard.overview,
    queryFn: dashboardService.getOverview,
  });
}

export function useMyDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard.my,
    queryFn: dashboardService.getMyDashboard,
  });
}
