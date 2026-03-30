import { useMutation } from '@tanstack/react-query';
import api, { ApiError } from '../services/api';
import { useLoan } from '../context/LoanContext';

// ─── Payload / Response types ──────────────────────────────────────────────────

interface LoanApplicantPayload {
  fullName: string;
  documentId: string;
  email: string;
  phone: string;
  purpose: string;
}

interface LoanPayload {
  amount: number;
  term: number;
  rate: number;
  applicant: LoanApplicantPayload;
  signature: string;
  termsAccepted: boolean;
}

interface LoanResponse {
  loanId?: string;
  loan_id?: string;
  txHash?: string;
  tx_hash?: string;
  contractAddress?: string;
  contract_address?: string;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useLoanSubmit — wraps `POST /api/v1/loans` with React Query useMutation.
 * On success, stores loanId / txHash / contractAddress in LoanContext.
 * isPending from the mutation drives the loading UI in Step5.
 */
export function useLoanSubmit() {
  const {
    amount, term, applicant,
    signature, termsAccepted, RATE,
    setLoanId, setTxHash, setContractAddress,
  } = useLoan();

  return useMutation<LoanResponse, ApiError, void>({
    mutationKey: ['submitLoan'],

    mutationFn: async () => {
      const payload: LoanPayload = {
        amount: parseFloat(amount),
        term: parseInt(String(term), 10),
        rate: RATE,
        applicant: {
          fullName: applicant.fullName,
          documentId: applicant.documentId,
          email: applicant.email,
          phone: applicant.phone,
          purpose: applicant.purpose,
        },
        signature,
        termsAccepted,
      };

      const { data } = await api.post<LoanResponse>('/api/v1/loans', payload);
      return data;
    },

    onSuccess: (data) => {
      setLoanId(data.loanId ?? data.loan_id ?? '');
      setTxHash(data.txHash ?? data.tx_hash ?? '');
      setContractAddress(data.contractAddress ?? data.contract_address ?? '');
    },
  });
}
