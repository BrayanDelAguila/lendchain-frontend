import React, { useState } from 'react';
import { useLoan } from '../context/LoanContext';

const MIN = 100;
const MAX = 10_000;
const TERMS: number[] = [3, 6, 12, 24];

export default function Step1Amount(): React.ReactElement {
  const { amount, setAmount, term, setTerm, goNext, RATE } = useLoan();
  const [touched, setTouched] = useState(false);

  const numAmount = parseFloat(amount);
  const amountError: string | null = touched
    ? !amount || isNaN(numAmount) ? 'Ingresa un monto válido'
      : numAmount < MIN ? `El mínimo es $${MIN} USDC`
      : numAmount > MAX ? `El máximo es $${MAX} USDC`
      : null
    : null;

  const isValid =
    !!amount && !isNaN(numAmount) && numAmount >= MIN && numAmount <= MAX && term !== null;

  const handleNext = () => {
    setTouched(true);
    if (isValid) goNext();
  };

  const percentage =
    amount && !isNaN(numAmount)
      ? Math.min(Math.max(((numAmount - MIN) / (MAX - MIN)) * 100, 0), 100)
      : 0;

  const approxPayment =
    isValid && term
      ? (parseFloat(amount) * (RATE / 12)) / (1 - Math.pow(1 + RATE / 12, -term))
      : 0;

  const inputBorder = amountError
    ? 'border-danger'
    : touched && amount && !amountError
    ? 'border-secondary'
    : 'border-border-brand focus-within:border-primary focus-within:shadow-sm';

  return (
    <div className="animate-fade-in-up px-4 pb-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-heading mb-1">¿Cuánto necesitas?</h2>
        <p className="text-body text-sm">Define el monto y el plazo de tu préstamo</p>
      </div>

      {/* Rate badge */}
      <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-3 py-1.5 rounded-full text-xs font-semibold mb-6">
        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
        Tasa fija anual: {(RATE * 100).toFixed(0)}% — Amortización francesa
      </div>

      {/* Amount input */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-heading mb-2">
          Monto del préstamo
        </label>
        <div className={`relative flex items-center border-2 rounded-xl overflow-hidden transition-all duration-200 bg-surface ${inputBorder}`}>
          <span className="pl-4 text-muted font-semibold text-lg select-none">$</span>
          <input
            id="loan-amount"
            type="number"
            min={MIN}
            max={MAX}
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setTouched(true); }}
            onBlur={() => setTouched(true)}
            placeholder="1,000"
            className="flex-1 px-3 py-4 text-lg font-semibold text-heading bg-transparent outline-none placeholder:text-muted"
          />
          <span className="pr-4 text-muted font-medium text-sm select-none">USDC</span>
        </div>
        {amountError && (
          <p className="mt-1.5 text-xs text-danger flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            {amountError}
          </p>
        )}

        {/* Visual range */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-muted mb-1">
            <span>${MIN}</span><span>${MAX.toLocaleString()}</span>
          </div>
          <div className="relative h-1.5 bg-border-brand rounded-full overflow-visible">
            <div className="absolute left-0 top-0 h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${percentage}%` }} />
            <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-primary border-2 border-white rounded-full shadow-md transition-all duration-300" style={{ left: `calc(${percentage}% - 8px)` }} />
          </div>
        </div>

        {/* Quick pick */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {[500, 1000, 3000, 5000].map((v) => (
            <button
              key={v}
              onClick={() => { setAmount(String(v)); setTouched(true); }}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-150
                ${parseFloat(amount) === v
                  ? 'bg-primary text-white border-primary'
                  : 'bg-surface text-body border-border-brand hover:border-primary hover:text-primary'
                }`}
            >
              ${v.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

      {/* Term selector */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-heading mb-3">Plazo del préstamo</label>
        <div className="grid grid-cols-4 gap-2">
          {TERMS.map((t) => (
            <button
              key={t}
              id={`term-${t}`}
              onClick={() => setTerm(t)}
              className={`py-4 rounded-xl border-2 flex flex-col items-center gap-0.5 transition-all duration-200 font-semibold
                ${term === t
                  ? 'border-primary bg-primary text-white shadow-lg'
                  : 'border-border-brand bg-surface text-body hover:border-primary hover:text-primary'
                }`}
            >
              <span className="text-lg leading-none">{t}</span>
              <span className={`text-xs font-normal ${term === t ? 'text-blue-100' : 'text-muted'}`}>meses</span>
            </button>
          ))}
        </div>
        {!term && touched && (
          <p className="mt-1.5 text-xs text-danger flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            Selecciona un plazo
          </p>
        )}
      </div>

      {/* Preview */}
      {isValid && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6 animate-fade-in-up">
          <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Resumen rápido</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-heading">${parseFloat(amount).toLocaleString()} USDC</p>
              <p className="text-sm text-body">{term} meses · {(RATE * 100).toFixed(0)}% anual</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted">Cuota aprox.</p>
              <p className="text-lg font-bold text-primary">${approxPayment.toFixed(2)}</p>
              <p className="text-xs text-muted">USDC/mes</p>
            </div>
          </div>
        </div>
      )}

      <button
        id="btn-next-step1"
        onClick={handleNext}
        disabled={!isValid}
        className={`w-full py-4 rounded-xl font-semibold text-base transition-all duration-200
          ${isValid
            ? 'bg-primary text-white shadow-lg hover:bg-primary-hover hover:shadow-xl active:scale-95'
            : 'bg-border-brand text-muted cursor-not-allowed'
          }`}
      >
        Ver simulación de cuotas →
      </button>
    </div>
  );
}
