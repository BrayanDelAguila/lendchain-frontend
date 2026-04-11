import React, { useState } from 'react';
import { useAvailableLoans } from '../../hooks/useAvailableLoans';
import NetworkBadge from '../ui/NetworkBadge';
import { SkeletonCard, SkeletonLine } from '../ui/Skeleton';
import LenderFundModal from './LenderFundModal';
import type { LoanPublic } from '../../types/loan';

function fmt(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function LoanCard({ loan, onInvest }: { loan: LoanPublic; onInvest: (loan: LoanPublic) => void }) {
  const amount = parseFloat(loan.amount_usdc);
  const monthly = parseFloat(loan.monthly_payment);
  const totalInterest = monthly * loan.term_months - amount;
  const shortHash = loan.deploy_tx_hash
    ? `${loan.deploy_tx_hash.slice(0, 8)}…${loan.deploy_tx_hash.slice(-6)}`
    : null;
  const polygonscanUrl = loan.deploy_tx_hash && loan.deploy_tx_hash.startsWith('0x') && loan.deploy_tx_hash.length === 66
    ? `https://amoy.polygonscan.com/tx/${loan.deploy_tx_hash}`
    : null;

  return (
    <div className="bg-surface border border-border-brand rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-2xl font-bold text-heading">${fmt(amount)}</p>
          <p className="text-xs text-muted">USDC · {loan.term_months} meses</p>
        </div>
        <NetworkBadge network="polygon" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { label: 'Tasa anual', value: `${(parseFloat(loan.annual_rate) * 100).toFixed(0)}%` },
          { label: 'Cuota/mes', value: `$${fmt(monthly)}` },
          { label: 'Tu ganancia', value: `$${fmt(totalInterest)}` },
        ].map((item) => (
          <div key={item.label} className="bg-bg-base rounded-xl p-2 text-center">
            <p className="text-xs text-muted mb-0.5">{item.label}</p>
            <p className="text-xs font-bold text-heading">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Purpose */}
      {loan.purpose && (
        <p className="text-xs text-body mb-3 line-clamp-1">
          <span className="font-medium text-muted">Propósito:</span> {loan.purpose}
        </p>
      )}

      {/* Contract hash */}
      {shortHash && (
        <div className="flex items-center gap-1.5 mb-3">
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
        </div>
      )}

      <button
        onClick={() => onInvest(loan)}
        className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-all active:scale-95 shadow-sm">
        Invertir →
      </button>
    </div>
  );
}

function SkeletonLoanCard() {
  return (
    <div className="bg-surface border border-border-brand rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex justify-between">
        <div className="space-y-1">
          <SkeletonLine width="w-28" height="h-7" />
          <SkeletonLine width="w-20" height="h-3" />
        </div>
        <SkeletonCard height="h-6" className="w-20" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[0, 1, 2].map((i) => <SkeletonCard key={i} height="h-12" />)}
      </div>
      <SkeletonCard height="h-9" />
    </div>
  );
}

export default function LenderExplore(): React.ReactElement {
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useAvailableLoans();
  const [selectedLoan, setSelectedLoan] = useState<LoanPublic | null>(null);

  const loans = data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <div className="px-4 pb-8">
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-heading mb-1">Explorar oportunidades</h2>
        <p className="text-sm text-body">Préstamos disponibles para financiar en Polygon</p>
      </div>

      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center mb-4">
          <p className="text-sm text-danger font-medium">No se pudo cargar la lista. Recarga la página.</p>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => <SkeletonLoanCard key={i} />)}
        </div>
      ) : loans.length === 0 ? (
        <div className="bg-surface border border-border-brand rounded-2xl p-8 text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-heading mb-1">Sin oportunidades disponibles</p>
          <p className="text-xs text-muted">No hay préstamos pendientes de fondeo en este momento.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {loans.map((loan) => (
            <LoanCard key={loan.id} loan={loan} onInvest={setSelectedLoan} />
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

      {selectedLoan && (
        <LenderFundModal
          loan={selectedLoan}
          onClose={() => setSelectedLoan(null)}
        />
      )}
    </div>
  );
}
