import React from 'react';
import { LoanProvider, useLoan } from './context/LoanContext';
import Stepper from './components/Stepper';
import Step1Amount from './components/Step1Amount';
import Step2Schedule from './components/Step2Schedule';
import Step3Applicant from './components/Step3Applicant';
import Step4Contract from './components/Step4Contract';
import Step5Confirmation from './components/Step5Confirmation';

// ─── Step router ──────────────────────────────────────────────────────────────

function LoanFlow(): React.ReactElement {
  const { currentStep } = useLoan();

  const steps: Record<number, React.ReactElement> = {
    1: <Step1Amount />,
    2: <Step2Schedule />,
    3: <Step3Applicant />,
    4: <Step4Contract />,
    5: <Step5Confirmation />,
  };

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
          <div className="text-xs text-muted font-medium">Paso {currentStep} de 5</div>
        </div>
        <Stepper />
      </header>

      {/* Main */}
      <main className="w-full max-w-md flex-1 pt-4">
        <div key={currentStep}>{steps[currentStep]}</div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-md px-4 py-4 text-center">
        <div className="flex items-center justify-center gap-2 text-xs text-muted">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Datos cifrados · Polygon Mumbai Testnet
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
