import { useMutation, useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { toast } from 'sonner';
import { attachmentService } from '@/services/attachmentService';
import { queryKeys } from '@/lib/query-keys';
import { getErrorMessage } from '@/lib/api-client';
import { triggerBlobDownload } from '@/lib/download';
import type { Attachment } from '@/types';

export function useTicketAttachments(ticketId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.attachments.byTicket(ticketId ?? ''),
    queryFn: () => attachmentService.getByTicket(ticketId as string),
    enabled: Boolean(ticketId),
  });
}

export function useRepairAttachments(repairId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.attachments.byRepair(repairId ?? ''),
    queryFn: () => attachmentService.getByRepair(repairId as string),
    enabled: Boolean(repairId),
  });
}

export function useAssetAttachments(assetId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.attachments.byAsset(assetId ?? ''),
    queryFn: () => attachmentService.getByAsset(assetId as string),
    enabled: Boolean(assetId),
  });
}

function useUploadAttachment(
  uploadFn: (entityId: string, file: File) => Promise<Attachment>,
  invalidateKey: (entityId: string) => QueryKey,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ entityId, file }: { entityId: string; file: File }) => uploadFn(entityId, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: invalidateKey(variables.entityId) });
      toast.success('File uploaded successfully.');
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Could not upload the file.')),
  });
}

export function useUploadTicketAttachment() {
  return useUploadAttachment(attachmentService.uploadForTicket, queryKeys.attachments.byTicket);
}

export function useUploadRepairAttachment() {
  return useUploadAttachment(attachmentService.uploadForRepair, queryKeys.attachments.byRepair);
}

export function useUploadAssetAttachment() {
  return useUploadAttachment(attachmentService.uploadForAsset, queryKeys.attachments.byAsset);
}

export function useDownloadAttachment() {
  return useMutation({
    mutationFn: (attachment: Attachment) => attachmentService.download(attachment),
    onSuccess: ({ blob, fileName }) => {
      triggerBlobDownload(blob, fileName);
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Could not download the file.')),
  });
}

// Fetches the file bytes for in-app preview (e.g. an image lightbox) without triggering a
// browser download the way useDownloadAttachment does. The endpoint requires the same bearer
// auth as every other API call, so a plain <img src="..."> can't point at it directly — the
// blob has to be fetched through apiClient (which attaches the token) and turned into an object
// URL by the caller. `enabled` should track the dialog's open state so the fetch only happens
// once the user actually opens the preview.
export function useAttachmentPreview(attachment: Attachment | null, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.attachments.preview(attachment?.id ?? 'none'),
    queryFn: () => attachmentService.download(attachment as Attachment),
    enabled: enabled && Boolean(attachment),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useDeleteAttachment(invalidateKey: QueryKey) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => attachmentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invalidateKey });
      toast.success('Attachment deleted.');
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Could not delete the attachment.')),
  });
}
