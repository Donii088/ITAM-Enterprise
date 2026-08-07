import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { repairService } from '@/services/repairService';
import { queryKeys } from '@/lib/query-keys';
import type { GetRepairsQuery } from '@/types';

export function useRepairsList(query: GetRepairsQuery) {
  return useQuery({
    queryKey: queryKeys.repairs.list(query),
    queryFn: () => repairService.getPaged(query),
    placeholderData: keepPreviousData,
  });
}

export function useTicketRepairs(ticketId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.repairs.byTicket(ticketId ?? ''),
    queryFn: () => repairService.getByTicket(ticketId as string),
    enabled: Boolean(ticketId),
  });
}

export function useAssetRepairs(assetId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.repairs.byAsset(assetId ?? ''),
    queryFn: () => repairService.getByAsset(assetId as string),
    enabled: Boolean(assetId),
  });
}
