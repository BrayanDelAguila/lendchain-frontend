import { useInfiniteQuery } from '@tanstack/react-query';
import api, { ApiError } from '../services/api';
import type { PaginatedLoans } from '../types/loan';

export function usePortfolio() {
  return useInfiniteQuery<PaginatedLoans, ApiError>({
    queryKey: ['loans', 'portfolio'],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({ limit: '10' });
      if (pageParam) params.set('cursor', pageParam as string);
      const { data } = await api.get<PaginatedLoans>(`/api/v1/loans/portfolio?${params}`);
      return data;
    },
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
    initialPageParam: undefined,
  });
}
