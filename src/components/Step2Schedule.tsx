import React from 'react';
import { useLoan, ScheduleItem } from '../context/LoanContext';
import { SkeletonTableRow } from './ui/Skeleton';

function fmt(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function Step2Schedule(): React.ReactElement {
  const { schedule, amount, term, totalPayment, totalInterest, goNext, goBack, monthlyPayment } = useLoan();

  return (
    <div className="animate-fade-in-up px-4 pb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-heading mb-1">Simulador de cuotas</h2>
        <p className="text-body text-sm">Amortización francesa — tasa 5% anual</p>
      </div>

      {/* Summary pills */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <div className="bg-surface border border-border-brand rounded-xl p-3 text-center">
          <p className="text-xs text-muted mb-0.5">Principal</p>
          <p className="text-base font-bold text-heading">${parseFloat(amount).toLocaleString()}</p>
        </div>
        <div className="bg-primary rounded-xl p-3 text-center">
          <p className="text-xs text-blue-200 mb-0.5">Cuota/mes</p>
          <p className="text-base font-bold text-white">${fmt(monthlyPayment)}</p>
        </div>
        <div className="bg-surface border border-border-brand rounded-xl p-3 text-center">
          <p className="text-xs text-muted mb-0.5">Plazo</p>
          <p className="text-base font-bold text-heading">{term}m</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface border border-border-brand rounded-2xl overflow-hidden mb-4 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-bg-base border-b border-border-brand">
                <th className="py-3 px-3 text-left text-xs font-semibold text-muted whitespace-nowrap">#</th>
                <th className="py-3 px-3 text-right text-xs font-semibold text-muted whitespace-nowrap">Cuota</th>
                <th className="py-3 px-3 text-right text-xs font-semibold text-muted whitespace-nowrap">Capital</th>
                <th className="py-3 px-3 text-right text-xs font-semibold text-muted whitespace-nowrap">Interés</th>
                <th className="py-3 px-3 text-right text-xs font-semibold text-muted whitespace-nowrap">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {schedule.length === 0 ? (
                /* Skeleton rows while no data */
                <>
                  <SkeletonTableRow />
                  <SkeletonTableRow />
                  <SkeletonTableRow />
                </>
              ) : (
                schedule.map((row: ScheduleItem, idx: number) => (
                  <tr
                    key={row.num}
                    className={`border-b border-border-brand/40 hover:bg-primary/5 transition-colors ${idx % 2 === 0 ? 'bg-surface' : 'bg-bg-base/30'}`}
                  >
                    <td className="py-2.5 px-3 text-muted font-medium">{row.num}</td>
                    <td className="py-2.5 px-3 text-right font-semibold text-heading">${fmt(row.payment)}</td>
                    <td className="py-2.5 px-3 text-right text-primary font-medium">${fmt(row.capital)}</td>
                    <td className="py-2.5 px-3 text-right text-warn font-medium">${fmt(row.interest)}</td>
                    <td className="py-2.5 px-3 text-right text-body">${fmt(row.balance)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals */}
      <div className="bg-heading rounded-2xl p-4 mb-6 text-white">
        <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Resumen total</p>
        <div className="flex justify-between items-center mb-2">
          <span className="text-slate-300 text-sm">Principal</span>
          <span className="font-semibold">${parseFloat(amount).toLocaleString()}.00 USDC</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-slate-300 text-sm">Total intereses</span>
          <span className="font-semibold text-warn">+${fmt(totalInterest)} USDC</span>
        </div>
        <div className="h-px bg-slate-700 my-2" />
        <div className="flex justify-between items-center">
          <span className="text-white font-semibold">Total a pagar</span>
          <span className="text-lg font-bold text-blue-400">${fmt(totalPayment)} USDC</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button id="btn-back-step2" onClick={goBack}
          className="flex-1 py-4 rounded-xl border-2 border-border-brand text-body font-semibold hover:border-body hover:bg-bg-base transition-all duration-150 active:scale-95">
          ← Atrás
        </button>
        <button id="btn-next-step2" onClick={goNext}
          className="flex-grow-[2] py-4 rounded-xl bg-primary text-white font-semibold shadow-lg hover:bg-primary-hover hover:shadow-xl transition-all duration-200 active:scale-95">
          Continuar →
        </button>
      </div>
    </div>
  );
}
