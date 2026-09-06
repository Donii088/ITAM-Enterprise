import { apiClient, unwrapResponse } from '@/lib/api-client';
import type { GetSearchQuery, SearchResults } from '@/types';

export const searchService = {
  search: (query: GetSearchQuery) =>
    unwrapResponse<SearchResults>(apiClient.get('/search', { params: query })),
};
