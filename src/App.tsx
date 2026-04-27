import React, { useState } from 'react';
import { LoanProvider, useLoan } from './context/LoanContext';
import Stepper from './components/Stepper';
import Step1Amount from './components/Step1Amount';
import Step2Schedule from './components/Step2Schedule';
import Step3Applicant from './components/Step3Applicant';
import Step4Contract from './components/Step4Contract';
import Step5Confirmation from './components/Step5Confirmation';
import AuthGate from './components/ui/AuthGate';
import LenderExplore from './components/lender/LenderExplore';
import LenderPortfolio from './components/lender/LenderPortfolio';
import HomeScreen from './components/HomeScreen';
import HistoryScreen from './components/HistoryScreen';
import AdminPanel from './components/admin/AdminPanel';
import { useMe } from './hooks/useMe';

// ─── Types ────────────────────────────────────────────────────────────────────

type AppMode = 'home' | 'borrow' | 'lend' | 'portfolio' | 'history' | 'admin';

// ─── Step router ──────────────────────────────────────────────────────────────

function LoanFlow(): React.ReactElement {
  const { currentStep, isAuthenticated } = useLoan();
  const [mode, setMode] = useState<AppMode>('home');
  const { data: me } = useMe();
  const isAdmin = me?.role === 'ADMIN';

  if (!isAuthenticated) {
    return <AuthGate onAuth={() => {}} />;
  }

  const steps: Record<number, React.ReactElement> = {
    1: <Step1Amount />,
    2: <Step2Schedule />,
    3: <Step3Applicant />,
    4: <Step4Contract />,
    5: <Step5Confirmation />,
  };

  const navItems: { key: AppMode; label: string }[] = [
    { key: 'home', label: 'Inicio' },
    { key: 'borrow', label: 'Solicitar' },
    { key: 'lend', label: 'Explorar' },
    { key: 'portfolio', label: 'Portfolio' },
    { key: 'history', label: 'Historial' },
    ...(isAdmin ? [{ key: 'admin' as AppMode, label: 'Admin' }] : []),
  ];

  return (
    <div className="min-h-screen flex flex-col items-center" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <header className="w-full max-w-md bg-surface border-b border-border-brand sticky top-0 z-20 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-heading leading-none">LendChain</p>
              <p className="text-xs text-muted leading-none">P2P · Blockchain</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {mode === 'borrow' && (
              <span className="text-xs text-muted font-medium">Paso {currentStep} de 5</span>
            )}
            <button
              onClick={() => {
                localStorage.removeItem('lendchain_jwt');
                localStorage.removeItem('lendchain_refresh_token');
                window.location.reload();
              }}
              className="text-xs text-muted hover:text-body transition-colors"
            >
              Salir
            </button>
          </div>
        </div>

        {/* Mode navigation */}
        <nav className="flex border-t border-border-brand overflow-x-auto">
          {navItems.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setMode(key)}
              className={`flex-1 py-2 text-xs font-semibold transition-colors whitespace-nowrap
                ${mode === key
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted hover:text-body'
                }`}
            >
              {label}
            </button>
          ))}
        </nav>

        {mode === 'borrow' && <Stepper />}
      </header>

      {/* Main */}
      <main className="w-full max-w-md flex-1 pt-4">
        {mode === 'home' && <HomeScreen onNavigate={setMode} />}
        {mode === 'borrow' && <div key={currentStep}>{steps[currentStep]}</div>}
        {mode === 'lend' && <LenderExplore />}
        {mode === 'portfolio' && <LenderPortfolio />}
        {mode === 'history' && <HistoryScreen />}
        {mode === 'admin' && isAdmin && <AdminPanel />}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-md px-4 py-4 text-center">
        <div className="flex items-center justify-center gap-2 text-xs text-muted">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Datos cifrados · Polygon Amoy Testnet
        </div>
      </footer>
    </div>
  );
}

// ─── App root ─────────────────────────────────────────────────────────────────

export default function App(): React.ReactElement {
  return (
    <LoanProvider>
      <LoanFlow />
    </LoanProvider>
  );
}
