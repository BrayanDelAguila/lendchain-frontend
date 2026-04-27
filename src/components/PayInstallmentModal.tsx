import React from 'react';
import { usePayInstallment } from '../hooks/usePayInstallment';

interface Props {
  loanId: string;
  monthlyPayment: string;
  onClose: () => void;
}

const AMOY_BASE = 'https://amoy.polygonscan.com/tx/';

export default function PayInstallmentModal({
  loanId,
  monthlyPayment,
  onClose,
}: Props): React.ReactElement {
  const { mutate, isPending, isSuccess, isError, data, error } = usePayInstallment(loanId);

  const amount = parseFloat(monthlyPayment).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-4 pb-6">
      <div className="w-full max-w-md bg-surface rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-brand">
          <h3 className="font-bold text-heading">Pagar cuota</h3>
          {!isPending && (
            <button onClick={onClose} className="text-muted hover:text-body text-xl leading-none">
              ×
            </button>
          )}
        </div>

        <div className="px-5 py-5">
          {!isSuccess && !isError && (
            <>
              <div className="bg-bg-base rounded-xl p-4 mb-5 flex items-center justify-between">
                <span className="text-sm text-muted">Monto de cuota</span>
                <span className="text-xl font-bold text-heading">${amount} USDC</span>
              </div>

              {isPending ? (
                <div className="flex flex-col items-center gap-3 py-6">
                  <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-muted text-center">
                    Registrando pago en blockchain…
                    <br />
                    <span className="text-xs">(puede tardar hasta 30 segundos)</span>
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => mutate()}
                  className="w-full bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary-hover transition-all active:scale-95"
                >
                  Confirmar pago
                </button>
              )}
            </>
          )}

          {isSuccess && data && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-14 h-14 bg-secondary/10 rounded-full flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-secondary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="text-center">
                <p className="font-bold text-heading text-lg">¡Cuota {data.payment_number} pagada!</p>
                <p className="text-sm text-muted mt-1">${parseFloat(data.amount_usdc).toLocaleString('en-US', { minimumFractionDigits: 2 })} USDC confirmados</p>
              </div>
              {data.tx_hash && !data.tx_hash.startsWith('0x_stub') && (
                <a
                  href={`${AMOY_BASE}${data.tx_hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-primary font-semibold hover:text-primary-hover"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Ver en Polygonscan
                </a>
              )}
              <button
                onClick={onClose}
                className="w-full mt-2 border-2 border-border-brand text-body font-semibold py-3 rounded-xl hover:border-primary transition-all"
              >
                Cerrar
              </button>
            </div>
          )}

          {isError && (
            <div className="flex flex-col gap-4">
              <div className="bg-danger/10 rounded-xl p-4 text-sm text-danger">
                {(error as { message?: string })?.message ?? 'Error al procesar el pago. Intenta de nuevo.'}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => mutate()}
                  className="flex-1 bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary-hover transition-all"
                >
                  Reintentar
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 border-2 border-border-brand text-body font-semibold py-3 rounded-xl"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
