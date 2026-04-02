import { useMutation } from '@tanstack/react-query';
import api, { ApiError } from '../services/api';
import { useLoan } from '../context/LoanContext';

// ─── Payload / Response types ──────────────────────────────────────────────────

interface CreateLoanPayload {
  amount_usdc: number;
  term_months: number;
  annual_rate: number;
  purpose?: string;
}

interface LoanData {
  id: string;
  deploy_tx_hash: string;
  contract_address: string;
}

interface LoanResponse {
  data: LoanData;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useLoanSubmit — wraps `POST /api/v1/loans` with React Query useMutation.
 * On success, stores loanId / txHash / contractAddress in LoanContext.
 * isPending from the mutation drives the loading UI in Step5.
 */
export function useLoanSubmit() {
  const {
    amount, term, applicant, RATE,
    setLoanId, setTxHash, setContractAddress,
  } = useLoan();

  return useMutation<LoanResponse, ApiError, void>({
    mutationKey: ['submitLoan'],

    mutationFn: async () => {
      const payload: CreateLoanPayload = {
        amount_usdc: parseFloat(amount),
        term_months: parseInt(String(term), 10),
        annual_rate: RATE,
        purpose: applicant.purpose || undefined,
      };

      const { data } = await api.post<LoanResponse>('/api/v1/loans', payload);
      return data;
    },

    onSuccess: (data) => {
      setLoanId(data.data.id);
      setTxHash(data.data.deploy_tx_hash);
      setContractAddress(data.data.contract_address);
    },
  });
}
