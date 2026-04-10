import { useInfiniteQuery } from '@tanstack/react-query';
import api, { ApiError } from '../services/api';
import type { PaginatedLoans } from '../types/loan';

export function useAvailableLoans() {
  return useInfiniteQuery<PaginatedLoans, ApiError>({
    queryKey: ['loans', 'available'],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({ limit: '10' });
      if (pageParam) params.set('cursor', pageParam as string);
      const { data } = await api.get<PaginatedLoans>(`/api/v1/loans/available?${params}`);
      return data;
    },
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    initialPageParam: undefined,
  });
}
