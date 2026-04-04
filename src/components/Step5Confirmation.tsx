import React, { useEffect, useRef } from 'react';
import { useLoan } from '../context/LoanContext';
import { useToast } from './ui/Toast';
import { useLoanSubmit } from '../hooks/useLoanSubmit';
import NetworkBadge from './ui/NetworkBadge';
import { SkeletonTxCard, SkeletonLine } from './ui/Skeleton';

export default function Step5Confirmation(): React.ReactElement {
  const { loanId, txHash, contractAddress, goToStart, applicant } = useLoan();
  const { toast } = useToast();
  const { mutate: submitLoan, isPending, isError, error } = useLoanSubmit();
  const called = useRef(false);

  // Fire mutation once on mount
  useEffect(() => {
    if (called.current) return;
    called.current = true;
    submitLoan();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show toast on error
  useEffect(() => {
    if (isError && error) {
      toast.error(
        'No se pudo registrar la solicitud',
        (error as { message?: string }).message ?? 'Intenta de nuevo o contacta soporte.',
      );
    }
  }, [isError, error, toast]);

  const shortHash = txHash ? `${txHash.slice(0, 6)}...${txHash.slice(-4)}` : '';
  const isRealHash = txHash.startsWith('0x') && txHash.length === 66 && !txHash.startsWith('0x_stub');
  const polygonscanUrl = isRealHash
    ? `https://amoy.polygonscan.com/tx/${txHash}`
    : null;

  return (
    <div className="px-4 pb-8 text-center">
      {/* Success icon */}
      <div className="flex flex-col items-center mb-8 animate-fade-in-up">
        <div className="relative mb-5">
          <div className="absolute inset-0 rounded-full bg-secondary opacity-20 animate-ping" />
          <div className="relative w-24 h-24 bg-secondary rounded-full flex items-center justify-center shadow-2xl">
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" className="check-path" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h2 className="text-3xl font-bold text-heading mb-2 animate-fade-in-up-delay-1">
          {isPending ? 'Procesando…' : '¡Solicitud enviada!'}
        </h2>
        <p className="text-body text-sm max-w-xs animate-fade-in-up-delay-2">
          {isPending
            ? 'Registrando tu contrato en la blockchain de Polygon…'
            : 'Tu solicitud ha sido registrada exitosamente en la blockchain de Polygon.'}
        </p>
      </div>

      {/* Status badge */}
      <div className="flex items-center justify-center gap-2 mb-6 animate-fade-in-up-delay-2">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border
          ${isPending
            ? 'bg-primary/5 border-primary/20 text-primary'
            : 'bg-warn/10 border-warn/30 text-warn'
          }`}>
          <div className={`w-2 h-2 rounded-full animate-pulse ${isPending ? 'bg-primary' : 'bg-warn'}`} />
          {isPending ? 'Enviando a blockchain…' : 'Estado: En revisión'}
        </div>
        {!isPending && <NetworkBadge network="polygon" />}
      </div>

      {/* Info cards */}
      <div className="space-y-3 mb-6 animate-fade-in-up-delay-3">

        {/* Loan ID */}
        <div className="bg-surface border border-border-brand rounded-2xl p-4 text-left shadow-sm">
          <p className="text-xs text-muted font-medium mb-1 uppercase tracking-wide">Número de solicitud</p>
          {isPending
            ? <SkeletonLine width="w-40" height="h-6" className="mt-1" />
            : <p className="text-xl font-bold text-heading tracking-wide font-mono">{loanId || '—'}</p>
          }
        </div>

        {/* TX Hash — skeleton while loading */}
        {isPending ? (
          <SkeletonTxCard />
        ) : (
          <div className="bg-surface border border-border-brand rounded-2xl p-4 text-left shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted font-medium mb-1 uppercase tracking-wide flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Hash de transacción · Polygon Mumbai
                </p>
                <p className="text-base font-mono font-bold text-primary break-all">{shortHash || '—'}</p>
                {txHash && <p className="text-xs text-muted font-mono mt-1 truncate">{txHash}</p>}
              </div>
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#F0EBFF', color: '#7B3FE4' }}>
                  <svg className="w-4 h-4" viewBox="0 0 32 32" fill="currentColor">
                    <path d="M21.092 12.693c-.369-.215-.848-.215-1.254 0l-2.879 1.654-1.955 1.078-2.879 1.653c-.369.216-.848.216-1.254 0l-2.288-1.294c-.369-.215-.627-.61-.627-1.042V12.19c0-.431.221-.826.627-1.042l2.251-1.258c.369-.215.848-.215 1.254 0l2.251 1.258c.369.215.627.61.627 1.042v1.653l1.955-1.115v-1.653c0-.431-.221-.826-.627-1.042l-4.169-2.372c-.369-.215-.848-.215-1.254 0L6.642 10.034c-.406.216-.627.61-.627 1.042v4.781c0 .431.221.826.627 1.042l4.206 2.372c.369.215.848.215 1.254 0l2.879-1.618 1.955-1.114 2.879-1.618c.369-.215.848-.215 1.254 0l2.251 1.258c.369.215.627.61.627 1.042v2.552c0 .431-.221.826-.627 1.042l-2.251 1.294c-.369.215-.848.215-1.254 0l-2.251-1.294c-.369-.215-.627-.61-.627-1.042v-1.653l-1.955 1.114v1.653c0 .431.221.826.627 1.042l4.206 2.372c.369.215.848.215 1.254 0l4.206-2.372c.369-.215.627-.61.627-1.042v-4.781c0-.431-.221-.826-.627-1.042l-4.243-2.408z"/>
                  </svg>
                </div>
              </div>
            </div>
            {txHash && (
              isRealHash ? (
                <a id="polygonscan-link" href={polygonscanUrl ?? '#'} target="_blank" rel="noopener noreferrer"
                  className="mt-3 flex items-center gap-2 text-xs text-primary font-semibold hover:text-primary-hover transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Ver en Polygonscan (Mumbai Testnet)
                </a>
              ) : (
                <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted font-medium px-2 py-1 rounded-full bg-border-brand">
                  <span>⚠</span> Hash de simulación — bytecode pendiente de compilar
                </p>
              )
            )}
          </div>
        )}

        {/* Contract address */}
        {!isPending && contractAddress && (
          <div className="bg-surface border border-border-brand rounded-2xl p-4 text-left shadow-sm">
            <p className="text-xs text-muted font-medium mb-1 uppercase tracking-wide">Contrato desplegado</p>
            <p className="text-xs font-mono font-semibold break-all" style={{ color: '#7B3FE4' }}>{contractAddress}</p>
          </div>
        )}

        {/* What's next */}
        {!isPending && (
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-left">
            <p className="text-xs text-primary font-semibold uppercase tracking-wide mb-2">¿Qué sigue?</p>
            <div className="space-y-2">
              {[
                'Un prestamista revisará tu solicitud en las próximas 24–48h',
                `Recibirás un correo en ${applicant.email || 'tu correo'} con la actualización`,
                'Si es aprobado, los fondos serán transferidos en USDC',
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">{i + 1}</span>
                  </div>
                  <p className="text-xs text-primary leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <button id="btn-go-home" onClick={goToStart} disabled={isPending}
        className={`w-full py-4 rounded-xl font-semibold shadow-lg transition-all duration-200 active:scale-95 animate-fade-in-up-delay-4
          ${isPending
            ? 'bg-border-brand text-muted cursor-not-allowed'
            : 'bg-primary text-white hover:bg-primary-hover hover:shadow-xl'
          }`}>
        {isPending ? 'Procesando…' : 'Ir al inicio'}
      </button>
    </div>
  );
}
