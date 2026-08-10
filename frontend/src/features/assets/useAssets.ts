import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { toast } from 'sonner';
import { assetService, createAssetForType, updateAssetForType } from '@/services/assetService';
import { exportService } from '@/services/exportService';
import { queryKeys } from '@/lib/query-keys';
import { getErrorMessage } from '@/lib/api-client';
import { triggerBlobDownload } from '@/lib/download';
import type {
  AssetType,
  CreateStorageRequest,
  GetAssetsQuery,
  GetStorageQuery,
  UpdateAssetStatusRequest,
  UpdateStorageRequest,
} from '@/types';

export function useAssetsList(query: GetAssetsQuery) {
  return useQuery({
    queryKey: queryKeys.assets.list(query),
    queryFn: () => assetService.getPaged(query),
    placeholderData: keepPreviousData,
  });
}

export function useAsset(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.assets.detail(id ?? ''),
    queryFn: () => assetService.getById(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ assetType, payload }: { assetType: AssetType; payload: Record<string, unknown> }) =>
      createAssetForType(assetType, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assets.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.overview });
      toast.success('Asset created successfully.');
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Could not create the asset.')),
  });
}

export function useUpdateAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      assetType,
      id,
      payload,
    }: {
      assetType: AssetType;
      id: string;
      payload: Record<string, unknown>;
    }) => updateAssetForType(assetType, id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assets.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.assets.detail(variables.id) });
      toast.success('Asset updated successfully.');
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Could not update the asset.')),
  });
}

export function useUpdateAssetStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAssetStatusRequest }) =>
      assetService.updateStatus(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assets.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.assets.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.overview });
      toast.success('Asset status updated.');
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Could not update the status.')),
  });
}

export function useHardDeleteAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => assetService.hardDelete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assets.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.overview });
      toast.success('Asset deleted permanently.');
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Could not delete the asset.')),
  });
}

export function useStorageList(query: GetStorageQuery) {
  return useQuery({
    queryKey: queryKeys.assets.storageList(query),
    queryFn: () => assetService.getStoragePaged(query),
    placeholderData: keepPreviousData,
  });
}

export function useCreateStorage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateStorageRequest) => assetService.createStorage(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assets.all });
      toast.success('Storage device created successfully.');
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Could not create the storage device.')),
  });
}

export function useUpdateStorage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateStorageRequest }) =>
      assetService.updateStorage(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assets.all });
      toast.success('Storage device updated successfully.');
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Could not update the storage device.')),
  });
}

export function useDeleteStorage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => assetService.deleteStorage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assets.all });
      toast.success('Storage device deleted.');
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Could not delete the storage device.')),
  });
}

/**
 * Attaches an existing (unassigned) storage device to a just-created Laptop/DesktopPc.
 * UpdateStorageRequest requires every field, so this reads the current device first and
 * only overrides the parent ids.
 */
export function useAttachStorageToAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      storageId,
      laptopId,
      desktopPcId,
    }: {
      storageId: string;
      laptopId?: string | null;
      desktopPcId?: string | null;
    }) => {
      const current = await assetService.getStorageById(storageId);
      return assetService.updateStorage(storageId, {
        serialNumber: current.serialNumber,
        capacity: current.capacity,
        storageType: current.storageType,
        storageUnit: current.storageUnit,
        laptopId: laptopId ?? null,
        desktopPcId: desktopPcId ?? null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assets.all });
    },
  });
}

export function useExportAssets() {
  return useMutation({
    mutationFn: (query: GetAssetsQuery) => exportService.exportAssets(query),
    onSuccess: ({ blob, fileName }) => {
      triggerBlobDownload(blob, fileName);
      toast.success('Export ready — download started.');
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Could not export assets.')),
  });
}
