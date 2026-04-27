import React from 'react';
import { useAdminStats, type AdminStats } from '../../hooks/useAdminStats';

function fmt(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-surface border border-border-brand rounded-xl p-4">
      <p className="text-xs text-muted mb-1">{label}</p>
      <p className="text-xl font-bold text-heading">{value}</p>
    </div>
  );
}

function StatusBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted">{label}</span>
        <span className="font-semibold text-heading">
          {count} ({pct}%)
        </span>
      </div>
      <div className="h-2 bg-bg-base rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function StatsContent({ stats }: { stats: AdminStats }) {
  const total = stats.total_loans;
  const s = stats.loans_by_status;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Usuarios" value={stats.total_users} />
        <StatCard label="Préstamos" value={stats.total_loans} />
        <StatCard
          label="Volumen total"
          value={`$${fmt(parseFloat(stats.total_volume_usdc))}`}
        />
        <StatCard
          label="USDC activo"
          value={`$${fmt(parseFloat(stats.total_active_usdc))}`}
        />
      </div>

      <div className="bg-surface border border-border-brand rounded-xl p-4 space-y-3">
        <p className="text-xs font-semibold text-muted uppercase tracking-wide">
          Distribución por estado
        </p>
        <StatusBar label="Pendiente" count={s.PENDING} total={total} color="bg-amber-400" />
        <StatusBar label="Activo (FUNDED)" count={s.FUNDED} total={total} color="bg-primary" />
        <StatusBar label="Pagado (REPAID)" count={s.REPAID} total={total} color="bg-emerald-500" />
        <StatusBar label="Incumplido" count={s.DEFAULTED} total={total} color="bg-danger" />
      </div>
    </div>
  );
}

export default function AdminStatsPanel(): React.ReactElement {
  const { data, isLoading } = useAdminStats();

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="bg-surface border border-border-brand rounded-xl p-4 h-20 animate-pulse" />
          ))}
        </div>
        <div className="bg-surface border border-border-brand rounded-xl p-4 h-40 animate-pulse" />
      </div>
    );
  }

  if (!data) return <p className="text-muted text-sm text-center py-8">Sin datos.</p>;

  return <StatsContent stats={data} />;
}
