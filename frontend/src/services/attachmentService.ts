import { apiClient, unwrapResponse } from '@/lib/api-client';
import { parseFileNameFromContentDisposition } from '@/lib/download';
import type { Attachment } from '@/types';

function uploadFormData(file: File): FormData {
  const formData = new FormData();
  formData.append('file', file);
  return formData;
}

export const attachmentService = {
  uploadForTicket: (ticketId: string, file: File) =>
    unwrapResponse<Attachment>(
      apiClient.post(`/tickets/${ticketId}/attachments`, uploadFormData(file), {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    ),

  uploadForRepair: (repairId: string, file: File) =>
    unwrapResponse<Attachment>(
      apiClient.post(`/repairs/${repairId}/attachments`, uploadFormData(file), {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    ),

  uploadForAsset: (assetId: string, file: File) =>
    unwrapResponse<Attachment>(
      apiClient.post(`/assets/${assetId}/attachments`, uploadFormData(file), {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    ),

  getByTicket: (ticketId: string) =>
    unwrapResponse<Attachment[]>(apiClient.get(`/attachments/ticket/${ticketId}`)),

  getByRepair: (repairId: string) =>
    unwrapResponse<Attachment[]>(apiClient.get(`/attachments/repair/${repairId}`)),

  getByAsset: (assetId: string) =>
    unwrapResponse<Attachment[]>(apiClient.get(`/attachments/asset/${assetId}`)),

  download: async (attachment: Attachment) => {
    const response = await apiClient.get(`/attachments/${attachment.id}/download`, {
      responseType: 'blob',
    });
    const fileName = parseFileNameFromContentDisposition(
      response.headers['content-disposition'],
      `${attachment.fileName}${attachment.fileExtension}`,
    );
    return { blob: response.data as Blob, fileName };
  },

  delete: (id: string) => unwrapResponse<void>(apiClient.delete(`/attachments/${id}`)),
};
