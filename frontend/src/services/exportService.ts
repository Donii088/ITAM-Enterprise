import { apiClient } from '@/lib/api-client';
import { parseFileNameFromContentDisposition } from '@/lib/download';
import { pruneEmpty } from '@/lib/utils';
import type { GetAssetsQuery, GetAssignmentsQuery } from '@/types';

export const exportService = {
  exportAssets: async (query: GetAssetsQuery) => {
    const response = await apiClient.get('/export/assets', {
      params: pruneEmpty(query),
      responseType: 'blob',
    });
    return {
      blob: response.data as Blob,
      fileName: parseFileNameFromContentDisposition(response.headers['content-disposition'], 'assets.csv'),
    };
  },

  exportAssignments: async (query: GetAssignmentsQuery) => {
    const response = await apiClient.get('/export/assignments', {
      params: pruneEmpty(query),
      responseType: 'blob',
    });
    return {
      blob: response.data as Blob,
      fileName: parseFileNameFromContentDisposition(response.headers['content-disposition'], 'assignments.csv'),
    };
  },
};
