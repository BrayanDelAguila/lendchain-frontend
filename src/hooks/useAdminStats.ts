import { useQuery } from '@tanstack/react-query';
import api, { ApiError } from '../services/api';

export interface AdminStats {
  total_users: number;
  total_loans: number;
  loans_by_status: {
    PENDING: number;
    FUNDED: number;
    REPAID: number;
    DEFAULTED: number;
  };
  total_volume_usdc: string;
  total_active_usdc: string;
}

export function useAdminStats() {
  return useQuery<AdminStats, ApiError>({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: AdminStats }>(
        '/api/v1/admin/stats',
      );
      return data.data;
    },
  });
}
