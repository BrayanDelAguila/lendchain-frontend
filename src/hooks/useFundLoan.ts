import { useMutation, useQueryClient } from '@tanstack/react-query';
import api, { ApiError } from '../services/api';
import type { FundLoanResponse } from '../types/loan';

export function useFundLoan() {
  const queryClient = useQueryClient();

  return useMutation<FundLoanResponse, ApiError, string>({
    mutationFn: async (loanId: string) => {
      const { data } = await api.post<FundLoanResponse>(`/api/v1/loans/${loanId}/fund`);
      return data;
    },
    onSuccess: () => {
      // Invalidate both lists so they reflect the updated state
      queryClient.invalidateQueries({ queryKey: ['loans', 'available'] });
      queryClient.invalidateQueries({ queryKey: ['loans', 'portfolio'] });
    },
  });
}
