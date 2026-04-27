import React, { useState } from 'react';
import { useAdminUsers, usePatchKyc, type AdminUser } from '../../hooks/useAdminUsers';

const KYC_OPTIONS = ['', 'PENDING', 'APPROVED', 'REJECTED'];

function kycColor(s: string): string {
  const m: Record<string, string> = {
    APPROVED: 'text-secondary bg-secondary/10',
    PENDING: 'text-amber-600 bg-amber-50',
    REJECTED: 'text-danger bg-danger/10',
  };
  return m[s] ?? 'text-muted bg-bg-base';
}

function roleColor(r: string): string {
  return r === 'ADMIN'
    ? 'text-primary bg-primary/10'
    : 'text-muted bg-muted/10';
}

function UserRow({
  user,
  onPatch,
}: {
  user: AdminUser;
  onPatch: (id: string, status: string) => void;
}) {
  return (
    <div className="bg-surface border border-border-brand rounded-xl p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-heading text-sm truncate max-w-[60%]">{user.email}</span>
        <div className="flex gap-1.5">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${roleColor(user.role)}`}>
            {user.role}
          </span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${kycColor(user.kyc_status)}`}>
            {user.kyc_status}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        <span className="text-muted">Nombre</span>
        <span className="text-heading text-right truncate">{user.full_name}</span>
        <span className="text-muted">Wallet</span>
        <span className="font-mono text-heading text-right">
          {user.wallet_address ? `${user.wallet_address.slice(0, 6)}…${user.wallet_address.slice(-4)}` : '—'}
        </span>
        <span className="text-muted">Registro</span>
        <span className="text-heading text-right">
          {new Date(user.created_at).toLocaleDateString('es-PE')}
        </span>
      </div>
      {user.kyc_status === 'PENDING' && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => onPatch(user.id, 'APPROVED')}
            className="flex-1 text-xs font-semibold py-2 rounded-lg bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors"
          >
            Aprobar KYC
          </button>
          <button
            onClick={() => onPatch(user.id, 'REJECTED')}
            className="flex-1 text-xs font-semibold py-2 rounded-lg bg-danger/10 text-danger hover:bg-danger/20 transition-colors"
          >
            Rechazar KYC
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminUsers(): React.ReactElement {
  const [kycFilter, setKycFilter] = useState('');
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useAdminUsers(
    kycFilter || undefined,
  );
  const { mutate: patchKyc } = usePatchKyc();

  const users = data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <div className="space-y-4">
      <select
        value={kycFilter}
        onChange={(e) => setKycFilter(e.target.value)}
        className="w-full bg-surface border border-border-brand rounded-xl px-4 py-2.5 text-sm text-body"
      >
        {KYC_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {s || 'Todos los KYC'}
          </option>
        ))}
      </select>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-surface border border-border-brand rounded-xl p-4 h-24 animate-pulse" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <p className="text-center text-muted py-12 text-sm">No hay usuarios.</p>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              onPatch={(id, kyc_status) => patchKyc({ id, kyc_status })}
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
