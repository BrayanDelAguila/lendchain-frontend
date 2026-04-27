import { useQuery } from '@tanstack/react-query';
import api, { ApiError } from '../services/api';

export interface UserMe {
  id: string;
  email: string;
  full_name: string;
  wallet_address: string;
  kyc_status: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export function useMe() {
  return useQuery<UserMe, ApiError>({
    queryKey: ['users', 'me'],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: UserMe }>('/api/v1/users/me');
      return data.data;
    },
  });
}
