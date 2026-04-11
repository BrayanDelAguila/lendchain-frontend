// ─── Shared domain types for lender dashboard ────────────────────────────────

export interface LoanPublic {
  id: string;
  borrower_id: string;
  lender_id: string | null;
  amount_usdc: string;
  annual_rate: string;
  term_months: number;
  monthly_payment: string;
  status: string;
  network: string;
  contract_address: string | null;
  deploy_tx_hash: string | null;
  fund_tx_hash: string | null;
  purpose: string | null;
  funded_at: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedLoans {
  success: boolean;
  data: LoanPublic[];
  next_cursor: string | null;
}

export interface FundLoanResponse {
  success: boolean;
  data: LoanPublic;
  tx_url: string;
}

export interface LoanHistoryItem extends LoanPublic {
  role: 'borrower' | 'lender';
}

export interface PaginatedHistory {
  success: boolean;
  data: LoanHistoryItem[];
  next_cursor: string | null;
}

export interface UserStats {
  borrower: {
    total_loans: number;
    active_loans: number;
    pending_loans: number;
    total_borrowed_usdc: string;
  };
  lender: {
    total_investments: number;
    active_investments: number;
    total_invested_usdc: string;
    total_interest_earned_usdc: string;
  };
}
