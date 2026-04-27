import { useInfiniteQuery } from '@tanstack/react-query';
import api, { ApiError } from '../services/api';
import type { PaginatedHistory } from '../types/loan';

export function useLoanHistory() {
  return useInfiniteQuery<PaginatedHistory, ApiError>({
    queryKey: ['loans', 'history'],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({ limit: '10' });
      if (pageParam) params.set('cursor', pageParam as string);
      const { data } = await api.get<PaginatedHistory>(`/api/v1/loans/history?${params}`);
      return data;
    },
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    initialPageParam: undefined,
  });
}
