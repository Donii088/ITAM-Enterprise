import { apiClient, unwrapResponse } from '@/lib/api-client';
import { pruneEmpty } from '@/lib/utils';
import type { Assignment, CreateAssignmentRequest, GetAssignmentsQuery, PagedResult } from '@/types';

export const assignmentService = {
  getPaged: (query: GetAssignmentsQuery) =>
    unwrapResponse<PagedResult<Assignment>>(apiClient.get('/assignments', { params: pruneEmpty(query) })),

  assign: (payload: CreateAssignmentRequest) =>
    unwrapResponse<Assignment>(apiClient.post('/assignments', payload)),

  unassign: (id: string) => unwrapResponse<Assignment>(apiClient.post(`/assignments/${id}/unassign`)),

  getMyAssets: () => unwrapResponse<Assignment[]>(apiClient.get('/assignments/my-assets')),

  getAssetHistory: (assetId: string) =>
    unwrapResponse<Assignment[]>(apiClient.get(`/assignments/asset/${assetId}/history`)),
};
