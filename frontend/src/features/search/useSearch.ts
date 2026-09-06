import { useQuery } from '@tanstack/react-query';
import { searchService } from '@/services/searchService';
import { queryKeys } from '@/lib/query-keys';

export function useSearch(term: string, limit = 10) {
  return useQuery({
    queryKey: queryKeys.search.query(term, limit),
    queryFn: () => searchService.search({ term, limit }),
    enabled: term.trim().length >= 2,
  });
}
