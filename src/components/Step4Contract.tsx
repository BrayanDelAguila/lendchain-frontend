import React, { useState } from 'react';
import { useLoan } from '../context/LoanContext';
import NetworkBadge from './ui/NetworkBadge';

function fmt(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const CLAUSES = [
  { icon: '📋', text: 'El préstamo se desembolsa en USDC a tasa fija del 5% anual, sin variaciones durante el plazo.' },
  { icon: '📅', text: 'Pagos mensuales puntuales según el cronograma. Mora: 1.5% mensual sobre saldo vencido.' },
  { icon: '⛓️', text: 'Contrato registrado de forma inmutable en Polygon. El hash es prueba legal de existencia.' },
  { icon: '🔐', text: 'Tus datos son privados. Solo el hash criptográfico se publica en blockchain.' },
];

export default function Step4Contract(): React.ReactElement {
  const {
    amount, term, monthlyPayment, applicant,
    termsAccepted, setTermsAccepted,
    signature, setSignature,
    goNext, goBack, RATE,
  } = useLoan();

  const [sigTouched, setSigTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 7);
  const startDateStr = startDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });

  const sigError =
    (sigTouched || submitted) &&
    signature.trim().toLowerCase() !== applicant.fullName.toLowerCase().trim();

  const handleNext = () => {
    setSubmitted(true);
    setSigTouched(true);
    if (termsAccepted && signature.trim().toLowerCase() === applicant.fullName.toLowerCase().trim()) {
      goNext();
    }
  };

  return (
    <div className="animate-fade-in-up px-4 pb-8">
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-heading mb-1">Vista previa del contrato</h2>
        <p className="text-body text-sm">Revisa los términos antes de firmar</p>
      </div>

      {/* Summary card */}
      <div className="bg-surface border border-border-brand rounded-2xl overflow-hidden mb-4 shadow-sm">
        <div className="bg-primary px-4 py-2.5 flex items-center justify-between">
          <p className="text-white text-xs font-semibold uppercase tracking-wider">Contrato P2P · LendChain</p>
          <NetworkBadge network="polygon" size="sm" />
        </div>
        <div className="p-3">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-border-brand">
            <div>
              <p className="text-xs text-muted mb-0.5">Solicitante</p>
              <p className="text-sm font-semibold text-heading leading-tight">{applicant.fullName}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted mb-0.5">Monto</p>
              <p className="text-sm font-bold text-primary">${parseFloat(amount).toLocaleString()} USDC</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { label: 'Tasa anual', value: `${(RATE * 100).toFixed(0)}% fija` },
              { label: 'Plazo', value: `${term} meses` },
              { label: 'Cuota/mes', value: `$${fmt(monthlyPayment)}` },
            ].map((item) => (
              <div key={item.label} className="bg-bg-base rounded-lg p-2 text-center">
                <p className="text-xs text-muted font-medium mb-0.5">{item.label}</p>
                <p className="text-xs font-bold text-heading">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="bg-primary/5 border border-primary/15 rounded-lg px-3 py-2 flex items-center justify-between">
            <p className="text-xs text-primary font-medium">Fecha estimada de inicio</p>
            <p className="text-xs font-semibold text-primary">{startDateStr}</p>
          </div>
        </div>
      </div>

      {/* Clauses */}
      <div className="mb-4 bg-surface border border-border-brand rounded-2xl overflow-hidden shadow-sm">
        <p className="text-xs font-semibold text-muted uppercase tracking-wide px-4 pt-3 pb-2">Cláusulas principales</p>
        {CLAUSES.map((c, i) => (
          <div key={i} className={`flex items-start gap-2.5 px-4 py-2.5 ${i < CLAUSES.length - 1 ? 'border-b border-border-brand/40' : 'pb-3'}`}>
            <span className="text-base leading-none mt-0.5 flex-shrink-0">{c.icon}</span>
            <p className="text-xs text-body leading-relaxed">{c.text}</p>
          </div>
        ))}
      </div>

      {/* Terms checkbox */}
      <div className="mb-4">
        <label
          htmlFor="terms-checkbox"
          className={`flex items-start gap-3 px-3 py-3 rounded-xl border-2 cursor-pointer transition-all duration-200
            ${termsAccepted ? 'border-primary bg-primary/5'
              : submitted && !termsAccepted ? 'border-danger bg-red-50/50'
              : 'border-border-brand bg-surface hover:border-primary/40'
            }`}
        >
          <div className="relative mt-0.5 flex-shrink-0">
            <input id="terms-checkbox" type="checkbox" checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)} className="sr-only" />
            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200
              ${termsAccepted ? 'bg-primary border-primary' : 'border-border-brand bg-surface'}`}>
              {termsAccepted && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
          <p className="text-sm text-body leading-snug">
            He leído y acepto los <span className="font-semibold text-primary">Términos y Condiciones</span> y la{' '}
            <span className="font-semibold text-primary">Política de Privacidad</span> de LendChain.
          </p>
        </label>
        {submitted && !termsAccepted && (
          <p className="mt-1.5 text-xs text-danger flex items-center gap-1 px-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            Debes aceptar los términos para continuar
          </p>
        )}
      </div>

      {/* Signature */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-heading mb-1.5">Firma electrónica</label>
        <p className="text-xs text-muted mb-2">
          Escribe tu nombre: <span className="font-semibold text-body">"{applicant.fullName}"</span>
        </p>
        <div className={`border-2 rounded-xl overflow-hidden transition-all duration-200 bg-surface
          ${sigError ? 'border-danger' : signature && !sigError ? 'border-secondary' : 'border-border-brand focus-within:border-primary'}`}>
          <input
            id="signature" type="text" value={signature}
            onChange={(e) => { setSignature(e.target.value); setSigTouched(true); }}
            onBlur={() => setSigTouched(true)}
            placeholder="Escribe tu nombre completo aquí"
            className="w-full px-4 py-3.5 text-heading font-medium italic bg-transparent outline-none placeholder:text-muted placeholder:not-italic"
            style={{ fontFamily: "'Georgia', serif" }}
          />
        </div>
        {sigError && (
          <p className="mt-1.5 text-xs text-danger flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            La firma debe coincidir con tu nombre completo
          </p>
        )}
        {!sigError && signature && (
          <p className="mt-1.5 text-xs text-secondary flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Firma válida
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <button id="btn-back-step4" onClick={goBack}
          className="flex-1 py-4 rounded-xl border-2 border-border-brand text-body font-semibold hover:border-body hover:bg-bg-base transition-all duration-150 active:scale-95">
          ← Atrás
        </button>
        <button id="btn-next-step4" onClick={handleNext}
          className="flex-grow-[2] py-4 rounded-xl bg-primary text-white font-semibold shadow-lg hover:bg-primary-hover hover:shadow-xl transition-all duration-200 active:scale-95">
          Firmar y enviar →
        </button>
      </div>
    </div>
  );
}
