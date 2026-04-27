import { useMutation, useQueryClient } from '@tanstack/react-query';
import api, { ApiError } from '../services/api';

interface PayResult {
  payment_number: number;
  amount_usdc: string;
  tx_hash: string;
  polygonscan_url: string;
}

interface PayResponse {
  success: boolean;
  data: PayResult;
}

export function usePayInstallment(loanId: string) {
  const queryClient = useQueryClient();

  return useMutation<PayResult, ApiError>({
    mutationFn: async () => {
      const { data } = await api.post<PayResponse>(`/api/v1/loans/${loanId}/pay`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans', 'history'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'me', 'stats'] });
    },
  });
}
