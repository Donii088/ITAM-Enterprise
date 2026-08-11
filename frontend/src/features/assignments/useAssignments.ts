import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { toast } from 'sonner';
import { assignmentService } from '@/services/assignmentService';
import { exportService } from '@/services/exportService';
import { queryKeys } from '@/lib/query-keys';
import { getErrorMessage } from '@/lib/api-client';
import { triggerBlobDownload } from '@/lib/download';
import type { CreateAssignmentRequest, GetAssignmentsQuery } from '@/types';

export function useAssignmentsList(query: GetAssignmentsQuery) {
  return useQuery({
    queryKey: queryKeys.assignments.list(query),
    queryFn: () => assignmentService.getPaged(query),
    placeholderData: keepPreviousData,
  });
}

export function useMyAssets() {
  return useQuery({
    queryKey: queryKeys.assignments.myAssets,
    queryFn: assignmentService.getMyAssets,
  });
}

export function useAssetAssignmentHistory(assetId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.assignments.assetHistory(assetId ?? ''),
    queryFn: () => assignmentService.getAssetHistory(assetId as string),
    enabled: Boolean(assetId),
  });
}

function invalidateAssignmentRelated(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: queryKeys.assignments.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.assets.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.overview });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.my });
}

export function useAssignAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAssignmentRequest) => assignmentService.assign(payload),
    onSuccess: () => {
      invalidateAssignmentRelated(queryClient);
      toast.success('Asset assigned successfully.');
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Could not assign the asset.')),
  });
}

export function useUnassignAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => assignmentService.unassign(id),
    onSuccess: () => {
      invalidateAssignmentRelated(queryClient);
      toast.success('Asset unassigned successfully.');
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Could not unassign the asset.')),
  });
}

export function useUnassignAssetByAssetId() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assetId: string) => assignmentService.unassignByAsset(assetId),
    onSuccess: () => {
      invalidateAssignmentRelated(queryClient);
      toast.success('Asset unassigned successfully.');
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Could not unassign the asset.')),
  });
}

export function useExportAssignments() {
  return useMutation({
    mutationFn: (query: GetAssignmentsQuery) => exportService.exportAssignments(query),
    onSuccess: ({ blob, fileName }) => {
      triggerBlobDownload(blob, fileName);
      toast.success('Export ready — download started.');
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Could not export assignments.')),
  });
}
