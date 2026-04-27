import React, { useState } from 'react';
import AdminLoans from './AdminLoans';
import AdminUsers from './AdminUsers';
import AdminStatsPanel from './AdminStatsPanel';

type AdminTab = 'loans' | 'users' | 'stats';

export default function AdminPanel(): React.ReactElement {
  const [tab, setTab] = useState<AdminTab>('loans');

  return (
    <div className="px-4 py-5 space-y-4">
      <h2 className="text-xl font-bold text-heading">Panel Admin</h2>

      {/* Internal tabs */}
      <div className="flex border border-border-brand rounded-xl overflow-hidden">
        {([
          { key: 'loans', label: 'Préstamos' },
          { key: 'users', label: 'Usuarios' },
          { key: 'stats', label: 'Estadísticas' },
        ] as { key: AdminTab; label: string }[]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors
              ${tab === key ? 'bg-primary text-white' : 'text-muted hover:text-body'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'loans' && <AdminLoans />}
      {tab === 'users' && <AdminUsers />}
      {tab === 'stats' && <AdminStatsPanel />}
    </div>
  );
}
