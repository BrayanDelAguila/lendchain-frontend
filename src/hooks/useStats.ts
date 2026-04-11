import { useQuery } from '@tanstack/react-query';
import api, { ApiError } from '../services/api';
import type { UserStats } from '../types/loan';

export function useStats() {
  return useQuery<UserStats, ApiError>({
    queryKey: ['users', 'me', 'stats'],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: UserStats }>(
        '/api/v1/users/me/stats',
      );
      return data.data;
    },
  });
}
