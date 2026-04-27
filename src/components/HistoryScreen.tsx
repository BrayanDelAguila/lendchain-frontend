import React, { useState } from 'react';
import { useLoanHistory } from '../hooks/useLoanHistory';
import type { LoanHistoryItem } from '../types/loan';
import PayInstallmentModal from './PayInstallmentModal';

const AMOY_BASE = 'https://amoy.polygonscan.com/tx/';

function statusColor(status: string): string {
  switch (status) {
    case 'FUNDED':
      return 'text-secondary bg-secondary/10';
    case 'REPAID':
      return 'text-emerald-600 bg-emerald-50';
    case 'PENDING':
      return 'text-amber-600 bg-amber-50';
    case 'DEFAULTED':
      return 'text-danger bg-danger/10';
    case 'CANCELLED':
      return 'text-muted bg-muted/10';
    default:
      return 'text-muted bg-bg-base';
  }
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    PENDING: 'Pendiente',
    FUNDED: 'Activo',
    REPAID: 'Pagado',
    DEFAULTED: 'Incumplido',
    CANCELLED: 'Cancelado',
  };
  return map[status] ?? status;
}

function fmt(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function isRealHash(h: string | null): h is string {
  return !!h && h.startsWith('0x') && h.length === 66 && !h.startsWith('0x_stub');
}

function TxLink({ hash, label }: { hash: string | null; label: string }) {
  if (!isRealHash(hash)) return null;
  return (
    <a
      href={`${AMOY_BASE}${hash}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1 text-xs text-primary font-semibold hover:text-primary-hover"
    >
      <svg
        className="w-3 h-3"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
        />
      </svg>
      {label}
    </a>
  );
}

function HistoryCard({
  item,
  onPay,
}: {
  item: LoanHistoryItem;
  onPay: (id: string, monthly: string) => void;
}) {
  const amount = parseFloat(item.amount_usdc);
  const isLender = item.role === 'lender';
  const canPay = !isLender && item.status === 'FUNDED';

  return (
    <div className="bg-surface border border-border-brand rounded-xl p-4 space-y-3">
      {/* Top row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              isLender
                ? 'text-primary bg-primary/10'
                : 'text-amber-700 bg-amber-50'
            }`}
          >
            {isLender ? 'Prestamista' : 'Prestatario'}
          </span>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor(item.status)}`}
          >
            {statusLabel(item.status)}
          </span>
        </div>
        <span className="text-lg font-bold text-heading">${fmt(amount)}</span>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        <span className="text-muted">Plazo</span>
        <span className="font-medium text-heading text-right">{item.term_months} meses</span>
        <span className="text-muted">Cuota</span>
        <span className="font-medium text-heading text-right">
          ${fmt(parseFloat(item.monthly_payment))} USDC
        </span>
        {item.funded_at && (
          <>
            <span className="text-muted">Fondeado</span>
            <span className="font-medium text-heading text-right">
              {new Date(item.funded_at).toLocaleDateString('es-PE')}
            </span>
          </>
        )}
      </div>

      {/* Tx links */}
      {(isRealHash(item.deploy_tx_hash) || isRealHash(item.fund_tx_hash)) && (
        <div className="flex gap-4 pt-1 border-t border-border-brand">
          <TxLink hash={item.deploy_tx_hash} label="Deploy" />
          <TxLink hash={item.fund_tx_hash} label="Fondeo" />
        </div>
      )}

      {/* Pay button */}
      {canPay && (
        <button
          onClick={() => onPay(item.id, item.monthly_payment)}
          className="w-full mt-1 bg-primary text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-primary-hover transition-all active:scale-95"
        >
          Pagar cuota
        </button>
      )}
    </div>
  );
}

export default function HistoryScreen(): React.ReactElement {
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useLoanHistory();
  const [payModal, setPayModal] = useState<{ loanId: string; monthly: string } | null>(null);

  const items = data?.pages.flatMap((p) => p.data) ?? [];

  if (isLoading) {
    return (
      <div className="px-4 py-5 space-y-3">
        <h2 className="text-xl font-bold text-heading mb-4">Historial</h2>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="bg-surface border border-border-brand rounded-xl p-4 h-28 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="px-4 py-16 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-bg-base rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <p className="font-semibold text-heading mb-1">Sin transacciones</p>
        <p className="text-sm text-muted">
          Tus préstamos e inversiones aparecerán aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 py-5 space-y-3">
      <h2 className="text-xl font-bold text-heading">Historial</h2>

      {items.map((item) => (
        <HistoryCard
          key={item.id}
          item={item}
          onPay={(id, monthly) => setPayModal({ loanId: id, monthly })}
        />
      ))}

      {payModal && (
        <PayInstallmentModal
          loanId={payModal.loanId}
          monthlyPayment={payModal.monthly}
          onClose={() => setPayModal(null)}
        />
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
