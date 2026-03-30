import React from 'react';
import { useLoan } from '../context/LoanContext';

const STEPS: { num: number; label: string }[] = [
  { num: 1, label: 'Monto' },
  { num: 2, label: 'Cuotas' },
  { num: 3, label: 'Datos' },
  { num: 4, label: 'Contrato' },
  { num: 5, label: 'Confirmación' },
];

export default function Stepper(): React.ReactElement {
  const { currentStep } = useLoan();

  return (
    <div className="w-full px-4 py-6">
      <div className="flex items-center justify-between max-w-sm mx-auto relative">
        {/* Track */}
        <div className="absolute left-0 right-0 top-5 h-0.5 bg-border-brand z-0" />
        <div
          className="absolute left-0 top-5 h-0.5 bg-primary z-0 transition-all duration-500"
          style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
        />

        {STEPS.map((step) => {
          const isDone = step.num < currentStep;
          const isActive = step.num === currentStep;

          return (
            <div key={step.num} className="flex flex-col items-center z-10">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                  transition-all duration-300 border-2
                  ${isDone
                    ? 'bg-primary border-primary text-white shadow-lg'
                    : isActive
                    ? 'bg-surface border-primary text-primary shadow-lg'
                    : 'bg-surface border-border-brand text-muted'
                  }
                `}
              >
                {isDone ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : step.num}
              </div>
              <span className={`mt-1.5 text-xs font-medium transition-all duration-300 ${
                isActive ? 'text-primary' : isDone ? 'text-body' : 'text-muted'
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
