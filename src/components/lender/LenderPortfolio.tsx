import React from 'react';
import { usePortfolio } from '../../hooks/usePortfolio';
import NetworkBadge from '../ui/NetworkBadge';
import { SkeletonCard, SkeletonLine } from '../ui/Skeleton';
import type { LoanPublic } from '../../types/loan';

function fmt(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function statusBadge(status: string) {
  const map: Record<string, { label: string; classes: string }> = {
    FUNDED:    { label: 'Activo',     classes: 'bg-secondary/10 text-secondary border-secondary/30' },
    ACTIVE:    { label: 'Activo',     classes: 'bg-secondary/10 text-secondary border-secondary/30' },
    REPAID:    { label: 'Repagado',   classes: 'bg-primary/10 text-primary border-primary/30' },
    DEFAULTED: { label: 'En mora',    classes: 'bg-red-50 text-danger border-red-200' },
    PENDING:   { label: 'Pendiente',  classes: 'bg-warn/10 text-warn border-warn/30' },
  };
  const s = map[status] ?? { label: status, classes: 'bg-bg-base text-muted border-border-brand' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${s.classes}`}>
      {s.label}
    </span>
  );
}

function PortfolioCard({ loan }: { loan: LoanPublic }) {
  const amount = parseFloat(loan.amount_usdc);
  const monthly = parseFloat(loan.monthly_payment);
  const totalToReceive = monthly * loan.term_months;
  const totalInterest = totalToReceive - amount;

  const fundTxHash = loan.fund_tx_hash ?? '';
  const isRealHash = fundTxHash.startsWith('0x') && fundTxHash.length === 66 && !fundTxHash.startsWith('0x_stub');
  const polygonscanUrl = isRealHash ? `https://amoy.polygonscan.com/tx/${fundTxHash}` : null;
  const shortHash = fundTxHash ? `${fundTxHash.slice(0, 8)}…${fundTxHash.slice(-6)}` : null;

  return (
    <div className="bg-surface border border-border-brand rounded-2xl p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="text-xl font-bold text-heading">${fmt(amount)}</p>
            {statusBadge(loan.status)}
          </div>
          <p className="text-xs text-muted">{loan.term_months} meses · {new Date(loan.created_at).toLocaleDateString('es-ES')}</p>
        </div>
        <NetworkBadge network="polygon" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { label: 'Cuota/mes', value: `$${fmt(monthly)}` },
          { label: 'Total a recibir', value: `$${fmt(totalToReceive)}` },
          { label: 'Rendimiento', value: `$${fmt(totalInterest)}` },
        ].map((item) => (
          <div key={item.label} className="bg-bg-base rounded-xl p-2 text-center">
            <p className="text-xs text-muted mb-0.5">{item.label}</p>
            <p className="text-xs font-bold text-heading">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Fund TX */}
      {shortHash && (
        <div className="flex items-center gap-1.5">
          <svg className="w-3 h-3 text-muted flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          {polygonscanUrl ? (
            <a href={polygonscanUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs font-mono text-primary hover:text-primary-hover transition-colors">
              {shortHash}
            </a>
          ) : (
            <span className="text-xs font-mono text-muted">{shortHash}</span>
          )}
          <span className="text-xs text-muted">· TX fondeo</span>
        </div>
      )}
    </div>
  );
}

function SkeletonPortfolioCard() {
  return (
    <div className="bg-surface border border-border-brand rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex justify-between">
        <div className="space-y-1">
          <SkeletonLine width="w-24" height="h-6" />
          <SkeletonLine width="w-32" height="h-3" />
        </div>
        <SkeletonCard height="h-6" className="w-20" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[0, 1, 2].map((i) => <SkeletonCard key={i} height="h-12" />)}
      </div>
      <SkeletonLine width="w-48" height="h-3" />
    </div>
  );
}

export default function LenderPortfolio(): React.ReactElement {
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = usePortfolio();

  const loans = data?.pages.flatMap((p) => p.data) ?? [];
  const totalInvested = loans.reduce((acc, l) => acc + parseFloat(l.amount_usdc), 0);
  const totalExpectedReturn = loans.reduce((acc, l) =>
    acc + parseFloat(l.monthly_payment) * l.term_months - parseFloat(l.amount_usdc), 0);

  return (
    <div className="px-4 pb-8">
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-heading mb-1">Mi portfolio</h2>
        <p className="text-sm text-body">Préstamos que has financiado</p>
      </div>

      {/* Summary banner */}
      {!isLoading && loans.length > 0 && (
        <div className="bg-primary rounded-2xl p-4 mb-5 flex justify-between items-center">
          <div>
            <p className="text-xs text-white/70 mb-0.5">Total invertido</p>
            <p className="text-xl font-bold text-white">${fmt(totalInvested)} USDC</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/70 mb-0.5">Rendimiento esperado</p>
            <p className="text-xl font-bold text-white">${fmt(totalExpectedReturn)} USDC</p>
          </div>
        </div>
      )}

      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center mb-4">
          <p className="text-sm text-danger font-medium">No se pudo cargar el portfolio. Recarga la página.</p>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => <SkeletonPortfolioCard key={i} />)}
        </div>
      ) : loans.length === 0 ? (
        <div className="bg-surface border border-border-brand rounded-2xl p-8 text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-heading mb-1">Sin inversiones aún</p>
          <p className="text-xs text-muted">Ve a "Explorar" para financiar tu primer préstamo.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {loans.map((loan) => (
            <PortfolioCard key={loan.id} loan={loan} />
          ))}
        </div>
      )}

      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="w-full mt-4 py-3 rounded-xl border-2 border-border-brand text-body font-semibold hover:border-primary hover:text-primary transition-all disabled:opacity-50">
          {isFetchingNextPage ? 'Cargando…' : 'Cargar más'}
        </button>
      )}
    </div>
  );
}
