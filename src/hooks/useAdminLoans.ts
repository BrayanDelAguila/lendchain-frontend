import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { ApiError } from '../services/api';
import type { LoanPublic } from '../types/loan';

interface PaginatedAdminLoans {
  success: boolean;
  data: LoanPublic[];
  next_cursor: string | null;
}

export function useAdminLoans(status?: string) {
  return useInfiniteQuery<PaginatedAdminLoans, ApiError>({
    queryKey: ['admin', 'loans', status],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({ limit: '20' });
      if (status) params.set('status', status);
      if (pageParam) params.set('cursor', pageParam as string);
      const { data } = await api.get<PaginatedAdminLoans>(`/api/v1/admin/loans?${params}`);
      return data;
    },
    getNextPageParam: (last) => last.next_cursor ?? undefined,
    initialPageParam: undefined,
  });
}

export function usePatchLoanStatus() {
  const qc = useQueryClient();
  return useMutation<LoanPublic, ApiError, { id: string; status: string }>({
    mutationFn: async ({ id, status }) => {
      const { data } = await api.patch<{ success: boolean; data: LoanPublic }>(
        `/api/v1/admin/loans/${id}`,
        { status },
      );
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'loans'] }),
  });
}
