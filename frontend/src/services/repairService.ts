import { apiClient, unwrapResponse } from '@/lib/api-client';
import { pruneEmpty } from '@/lib/utils';
import type { GetRepairsQuery, PagedResult, RepairHistory, ResolveTicketRequest, ResolveTicketResult } from '@/types';

export const repairService = {
  getPaged: (query: GetRepairsQuery) =>
    unwrapResponse<PagedResult<RepairHistory>>(apiClient.get('/repairs', { params: pruneEmpty(query) })),

  getByTicket: (ticketId: string) =>
    unwrapResponse<RepairHistory[]>(apiClient.get(`/repairs/ticket/${ticketId}`)),

  getByAsset: (assetId: string) =>
    unwrapResponse<RepairHistory[]>(apiClient.get(`/repairs/asset/${assetId}`)),

  resolveTicket: (ticketId: string, payload: ResolveTicketRequest) =>
    unwrapResponse<ResolveTicketResult>(apiClient.post(`/tickets/${ticketId}/resolve`, payload)),
};
