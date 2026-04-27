import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { ApiError } from '../services/api';

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  wallet_address: string;
  kyc_status: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface PaginatedAdminUsers {
  success: boolean;
  data: AdminUser[];
  next_cursor: string | null;
}

export function useAdminUsers(kyc_status?: string) {
  return useInfiniteQuery<PaginatedAdminUsers, ApiError>({
    queryKey: ['admin', 'users', kyc_status],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({ limit: '20' });
      if (kyc_status) params.set('kyc_status', kyc_status);
      if (pageParam) params.set('cursor', pageParam as string);
      const { data } = await api.get<PaginatedAdminUsers>(`/api/v1/admin/users?${params}`);
      return data;
    },
    getNextPageParam: (last) => last.next_cursor ?? undefined,
    initialPageParam: undefined,
  });
}

export function usePatchKyc() {
  const qc = useQueryClient();
  return useMutation<AdminUser, ApiError, { id: string; kyc_status: string }>({
    mutationFn: async ({ id, kyc_status }) => {
      const { data } = await api.patch<{ success: boolean; data: AdminUser }>(
        `/api/v1/admin/users/${id}/kyc`,
        { kyc_status },
      );
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
}
