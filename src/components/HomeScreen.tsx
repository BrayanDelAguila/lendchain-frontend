import React, { useState } from 'react';
import { useMe } from '../hooks/useMe';
import { useStats } from '../hooks/useStats';

interface HomeScreenProps {
  onNavigate: (mode: 'borrow' | 'lend' | 'portfolio' | 'history') => void;
}

function fmt(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-surface border border-border-brand rounded-xl p-4">
      <p className="text-xs text-muted mb-1">{label}</p>
      <p className={`text-xl font-bold ${accent ? 'text-secondary' : 'text-heading'}`}>{value}</p>
      {sub && <p className="text-xs text-muted mt-0.5">{sub}</p>}
    </div>
  );
}

export default function HomeScreen({ onNavigate }: HomeScreenProps): React.ReactElement {
  const { data: user, isLoading: userLoading } = useMe();
  const { data: stats, isLoading: statsLoading } = useStats();
  const [copied, setCopied] = useState(false);

  const firstName = user?.full_name?.split(' ')[0] ?? 'Usuario';
  const wallet = user?.wallet_address ?? '';
  const shortWallet = wallet ? `${wallet.slice(0, 6)}…${wallet.slice(-4)}` : '—';

  const copyWallet = () => {
    if (!wallet) return;
    navigator.clipboard.writeText(wallet).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const loading = userLoading || statsLoading;

  return (
    <div className="px-4 py-5 space-y-5">
      {/* Greeting */}
      <div>
        <h2 className="text-2xl font-bold text-heading">
          Hola, {userLoading ? '…' : firstName} 👋
        </h2>
        <p className="text-sm text-muted mt-0.5">Bienvenido a tu panel de control</p>
      </div>

      {/* Wallet badge */}
      <button
        onClick={copyWallet}
        className="w-full flex items-center gap-3 bg-surface border border-border-brand rounded-xl px-4 py-3 hover:border-primary transition-colors"
      >
        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
          <svg
            className="w-4 h-4 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 10h11M9 21V3m0 0L5 7m4-4l4 4M21 14a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2h12a2 2 0 012 2v8z"
            />
          </svg>
        </div>
        <div className="flex-1 text-left">
          <p className="text-xs text-muted">Tu wallet</p>
          <p className="text-sm font-mono font-semibold text-heading">
            {userLoading ? '…' : shortWallet}
          </p>
        </div>
        <span className="text-xs text-primary font-semibold">
          {copied ? '¡Copiado!' : 'Copiar'}
        </span>
      </button>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="bg-surface border border-border-brand rounded-xl p-4 h-20 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div>
            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
              Como prestatario
            </p>
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                label="Total préstamos"
                value={stats?.borrower.total_loans ?? 0}
              />
              <StatCard
                label="Activos"
                value={stats?.borrower.funded_loans ?? 0}
                sub={`${stats?.borrower.pending_loans ?? 0} pendientes`}
              />
              <StatCard
                label="Total pedido"
                value={`$${fmt(parseFloat(stats?.borrower.total_borrowed_usdc ?? '0'))}`}
                sub="USDC"
                accent
              />
              <StatCard
                label="Pendientes"
                value={stats?.borrower.pending_loans ?? 0}
                sub="sin fondear"
              />
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
              Como prestamista
            </p>
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                label="Inversiones"
                value={stats?.lender.total_investments ?? 0}
              />
              <StatCard
                label="Activas"
                value={stats?.lender.active_investments ?? 0}
              />
              <StatCard
                label="Total invertido"
                value={`$${fmt(parseFloat(stats?.lender.total_invested_usdc ?? '0'))}`}
                sub="USDC"
                accent
              />
              <StatCard
                label="Interés ganado"
                value={`$${fmt(parseFloat(stats?.lender.total_interest_earned_usdc ?? '0'))}`}
                sub="USDC"
                accent
              />
            </div>
          </div>
        </>
      )}

      {/* Quick actions */}
      <div>
        <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
          Acciones rápidas
        </p>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onNavigate('borrow')}
            className="w-full flex items-center gap-3 bg-primary text-white rounded-xl px-4 py-3 font-semibold hover:bg-primary-hover transition-all active:scale-95"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Solicitar préstamo
          </button>
          <button
            onClick={() => onNavigate('lend')}
            className="w-full flex items-center gap-3 bg-surface border border-border-brand text-heading rounded-xl px-4 py-3 font-semibold hover:border-primary transition-all active:scale-95"
          >
            <svg
              className="w-5 h-5 text-secondary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            Explorar oportunidades
          </button>
        </div>
      </div>
    </div>
  );
}
