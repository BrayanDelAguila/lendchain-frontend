import React, { useState } from 'react';
import { useFundLoan } from '../../hooks/useFundLoan';
import NetworkBadge from '../ui/NetworkBadge';
import type { LoanPublic } from '../../types/loan';

interface LenderFundModalProps {
  loan: LoanPublic;
  onClose: () => void;
}

function fmt(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function LenderFundModal({ loan, onClose }: LenderFundModalProps): React.ReactElement {
  const { mutate: fundLoan, isPending, isSuccess, isError, error, data } = useFundLoan();
  const [confirmed, setConfirmed] = useState(false);

  const amount = parseFloat(loan.amount_usdc);
  const monthly = parseFloat(loan.monthly_payment);
  const totalReceived = monthly * loan.term_months;
  const totalInterest = totalReceived - amount;

  const txHash = data?.data?.fund_tx_hash ?? '';
  const isRealHash = txHash.startsWith('0x') && txHash.length === 66 && !txHash.startsWith('0x_stub');
  const polygonscanUrl = isRealHash ? `https://amoy.polygonscan.com/tx/${txHash}` : null;

  // ── Success ──────────────────────────────────────────────────────────────────
  if (isSuccess && data) {
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0" style={{ background: 'rgba(0,0,0,0.5)' }}>
        <div className="w-full max-w-md bg-surface rounded-2xl p-6 shadow-2xl animate-fade-in-up">
          <div className="flex flex-col items-center text-center mb-5">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-3 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-heading mb-1">¡Inversión confirmada!</h3>
            <p className="text-sm text-body">Tu fondeo fue registrado en la blockchain de Polygon.</p>
          </div>

          <div className="bg-bg-base border border-border-brand rounded-xl p-4 mb-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Monto invertido</span>
              <span className="font-semibold text-heading">${fmt(amount)} USDC</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Interés total a recibir</span>
              <span className="font-semibold text-secondary">${fmt(totalInterest)} USDC</span>
            </div>
          </div>

          {txHash && (
            <div className="bg-surface border border-border-brand rounded-xl p-3 mb-4">
              <p className="text-xs text-muted uppercase tracking-wide mb-1">Hash de fondeo</p>
              <p className="text-xs font-mono font-semibold text-primary break-all">{txHash}</p>
              {polygonscanUrl && (
                <a href={polygonscanUrl} target="_blank" rel="noopener noreferrer"
                  className="mt-2 flex items-center gap-1.5 text-xs text-primary font-semibold hover:text-primary-hover">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Ver en Polygonscan (Amoy)
                </a>
              )}
            </div>
          )}

          <button onClick={onClose}
            className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-hover transition-all active:scale-95">
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0" style={{ background: 'rgba(0,0,0,0.5)' }}>
        <div className="w-full max-w-md bg-surface rounded-2xl p-6 shadow-2xl animate-fade-in-up">
          <div className="flex flex-col items-center text-center mb-5">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-heading mb-1">Error al fondear</h3>
            <p className="text-sm text-body">
              {(error as { message?: string })?.message ?? 'No se pudo completar la inversión. Intenta de nuevo.'}
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 py-3 rounded-xl border-2 border-border-brand text-body font-semibold hover:border-body transition-all">
              Cancelar
            </button>
            <button onClick={() => { setConfirmed(false); fundLoan(loan.id); }}
              className="flex-1 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-hover transition-all active:scale-95">
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Confirmation / Pending ───────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="w-full max-w-md bg-surface rounded-2xl p-6 shadow-2xl animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-heading">Confirmar inversión</h3>
          {!isPending && (
            <button onClick={onClose} className="text-muted hover:text-body transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Loan summary */}
        <div className="bg-bg-base border border-border-brand rounded-xl p-4 mb-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted">Monto a invertir</span>
            <span className="text-lg font-bold text-primary">${fmt(amount)} USDC</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Plazo</span>
            <span className="font-medium text-heading">{loan.term_months} meses</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Cuota mensual</span>
            <span className="font-medium text-heading">${fmt(monthly)} USDC</span>
          </div>
          <div className="border-t border-border-brand pt-3 flex justify-between text-sm">
            <span className="text-muted font-medium">Recibirás en intereses</span>
            <span className="font-bold text-secondary">${fmt(totalInterest)} USDC</span>
          </div>
          <p className="text-xs text-muted">
            Recibirás ${fmt(totalReceived)} USDC en {loan.term_months} meses (${fmt(totalInterest)} en intereses).
          </p>
        </div>

        <div className="flex items-center gap-2 mb-5">
          <NetworkBadge network="polygon" />
          <span className="text-xs text-muted">Contrato registrado en Polygon Amoy</span>
        </div>

        {isPending ? (
          <div className="flex items-center justify-center gap-3 py-4">
            <svg className="w-5 h-5 text-primary animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm font-medium text-body">Procesando en blockchain (~8s)…</span>
          </div>
        ) : (
          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 py-3 rounded-xl border-2 border-border-brand text-body font-semibold hover:border-body transition-all">
              Cancelar
            </button>
            <button
              onClick={() => { setConfirmed(true); fundLoan(loan.id); }}
              disabled={confirmed}
              className="flex-grow-[2] py-3 rounded-xl bg-primary text-white font-semibold shadow-lg hover:bg-primary-hover transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed">
              Confirmar inversión
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
