import React, { useState } from 'react';
import { useAdminLoans, usePatchLoanStatus } from '../../hooks/useAdminLoans';
import type { LoanPublic } from '../../types/loan';

const STATUS_OPTIONS = ['', 'PENDING', 'FUNDED', 'REPAID', 'DEFAULTED', 'CANCELLED'];

function statusColor(s: string): string {
  const m: Record<string, string> = {
    FUNDED: 'text-secondary bg-secondary/10',
    REPAID: 'text-emerald-600 bg-emerald-50',
    PENDING: 'text-amber-600 bg-amber-50',
    DEFAULTED: 'text-danger bg-danger/10',
    CANCELLED: 'text-muted bg-muted/10',
  };
  return m[s] ?? 'text-muted bg-bg-base';
}

function trunc(s: string | null | undefined, n = 8): string {
  if (!s) return '—';
  return `${s.slice(0, n)}…`;
}

function LoanRow({ loan, onPatch }: { loan: LoanPublic; onPatch: (id: string, status: string) => void }) {
  const amount = parseFloat(loan.amount_usdc).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="bg-surface border border-border-brand rounded-xl p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-bold text-heading">${amount} USDC</span>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor(loan.status)}`}>
          {loan.status}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        <span className="text-muted">Borrower</span>
        <span className="font-mono text-heading text-right">{trunc(loan.borrower_id)}</span>
        <span className="text-muted">Lender</span>
        <span className="font-mono text-heading text-right">{trunc(loan.lender_id)}</span>
        <span className="text-muted">Plazo</span>
        <span className="text-heading text-right">{loan.term_months} meses</span>
        <span className="text-muted">Fecha</span>
        <span className="text-heading text-right">
          {new Date(loan.created_at).toLocaleDateString('es-PE')}
        </span>
      </div>
      <div className="flex gap-2 pt-1">
        {loan.status === 'FUNDED' && (
          <button
            onClick={() => onPatch(loan.id, 'DEFAULTED')}
            className="flex-1 text-xs font-semibold py-2 rounded-lg bg-danger/10 text-danger hover:bg-danger/20 transition-colors"
          >
            Marcar DEFAULTED
          </button>
        )}
        {loan.status === 'PENDING' && (
          <button
            onClick={() => onPatch(loan.id, 'CANCELLED')}
            className="flex-1 text-xs font-semibold py-2 rounded-lg bg-muted/10 text-muted hover:bg-muted/20 transition-colors"
          >
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}

export default function AdminLoans(): React.ReactElement {
  const [statusFilter, setStatusFilter] = useState('');
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useAdminLoans(
    statusFilter || undefined,
  );
  const { mutate: patchStatus } = usePatchLoanStatus();

  const loans = data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <div className="space-y-4">
      {/* Filter */}
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="w-full bg-surface border border-border-brand rounded-xl px-4 py-2.5 text-sm text-body"
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {s || 'Todos los estados'}
          </option>
        ))}
      </select>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-surface border border-border-brand rounded-xl p-4 h-28 animate-pulse" />
          ))}
        </div>
      ) : loans.length === 0 ? (
        <p className="text-center text-muted py-12 text-sm">No hay préstamos.</p>
      ) : (
        <div className="space-y-3">
          {loans.map((loan) => (
            <LoanRow
              key={loan.id}
              loan={loan}
              onPatch={(id, status) => patchStatus({ id, status })}
            />
          ))}
        </div>
      )}

      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="w-full py-3 rounded-xl border-2 border-border-brand text-body font-semibold hover:border-primary transition-all disabled:opacity-50"
        >
          {isFetchingNextPage ? 'Cargando…' : 'Cargar más'}
        </button>
      )}
    </div>
  );
}
