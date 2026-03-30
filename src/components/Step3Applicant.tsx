import React, { useState } from 'react';
import { useLoan, Applicant, PurposeType } from '../context/LoanContext';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FieldErrors {
  fullName?: string;
  documentId?: string;
  email?: string;
  phone?: string;
  purpose?: string;
}

interface Purpose {
  value: PurposeType;
  label: string;
}

const PURPOSES: Purpose[] = [
  { value: 'personal',  label: 'Personal' },
  { value: 'negocio',   label: 'Negocio' },
  { value: 'educacion', label: 'Educación' },
  { value: 'salud',     label: 'Salud' },
  { value: 'otro',      label: 'Otro' },
];

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(applicant: Applicant): FieldErrors {
  const errors: FieldErrors = {};
  if (!applicant.fullName.trim() || applicant.fullName.trim().length < 3)
    errors.fullName = 'Ingresa tu nombre completo (mín. 3 caracteres)';
  if (!applicant.documentId.trim() || !/^\d{5,20}$/.test(applicant.documentId.replace(/\s/g, '')))
    errors.documentId = 'Ingresa un número de documento válido (5-20 dígitos)';
  if (!applicant.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(applicant.email))
    errors.email = 'Ingresa un correo electrónico válido';
  if (!applicant.phone.trim() || !/^\+?[\d\s\-()]{7,20}$/.test(applicant.phone))
    errors.phone = 'Ingresa un número de teléfono válido';
  if (!applicant.purpose)
    errors.purpose = 'Selecciona el propósito del préstamo';
  return errors;
}

// ─── Error icon ───────────────────────────────────────────────────────────────

function ErrIcon() {
  return (
    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
    </svg>
  );
}

// ─── Field wrapper ────────────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  id: string;
  error?: string;
  children: React.ReactNode;
}

function Field({ label, id, error, children }: FieldProps) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-semibold text-heading mb-1.5">{label}</label>
      {children}
      {error && (
        <p className="mt-1 text-xs text-danger flex items-center gap-1">
          <ErrIcon />{error}
        </p>
      )}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Step3Applicant(): React.ReactElement {
  const { applicant, setApplicant, goNext, goBack } = useLoan();
  const [touched, setTouched] = useState<Partial<Record<keyof Applicant, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);

  const errors = validate(applicant);
  const isValid = Object.keys(errors).length === 0;

  const isShow = (field: keyof Applicant) => touched[field] || submitted;

  const inputClass = (field: keyof Applicant): string => {
    const hasError = isShow(field) && errors[field as keyof FieldErrors];
    const isOk = isShow(field) && !errors[field as keyof FieldErrors] && applicant[field];
    return [
      'w-full px-4 py-3.5 rounded-xl border-2 text-heading placeholder:text-muted',
      'text-sm font-medium outline-none transition-all duration-200 bg-surface',
      hasError ? 'border-danger bg-red-50/50'
        : isOk ? 'border-secondary'
        : 'border-border-brand focus:border-primary focus:shadow-sm',
    ].join(' ');
  };

  const handleChange = (field: keyof Applicant, val: string) => {
    setApplicant({ ...applicant, [field]: val });
    setTouched((p) => ({ ...p, [field]: true }));
  };

  const handleNext = () => {
    setSubmitted(true);
    setTouched({ fullName: true, documentId: true, email: true, phone: true, purpose: true });
    if (isValid) goNext();
  };

  return (
    <div className="animate-fade-in-up px-4 pb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-heading mb-1">Datos del solicitante</h2>
        <p className="text-body text-sm">Esta información será registrada en el contrato</p>
      </div>

      <Field label="Nombre completo" id="fullName" error={isShow('fullName') ? errors.fullName : undefined}>
        <input id="fullName" type="text" value={applicant.fullName} autoComplete="name"
          onChange={(e) => handleChange('fullName', e.target.value)}
          onBlur={() => setTouched((p) => ({ ...p, fullName: true }))}
          placeholder="Ej. María González López" className={inputClass('fullName')} />
      </Field>

      <Field label="Número de documento" id="documentId" error={isShow('documentId') ? errors.documentId : undefined}>
        <input id="documentId" type="text" value={applicant.documentId}
          onChange={(e) => handleChange('documentId', e.target.value)}
          onBlur={() => setTouched((p) => ({ ...p, documentId: true }))}
          placeholder="Ej. 12345678" className={inputClass('documentId')} />
      </Field>

      <Field label="Correo electrónico" id="email" error={isShow('email') ? errors.email : undefined}>
        <input id="email" type="email" value={applicant.email} autoComplete="email"
          onChange={(e) => handleChange('email', e.target.value)}
          onBlur={() => setTouched((p) => ({ ...p, email: true }))}
          placeholder="nombre@correo.com" className={inputClass('email')} />
      </Field>

      <Field label="Teléfono" id="phone" error={isShow('phone') ? errors.phone : undefined}>
        <input id="phone" type="tel" value={applicant.phone} autoComplete="tel"
          onChange={(e) => handleChange('phone', e.target.value)}
          onBlur={() => setTouched((p) => ({ ...p, phone: true }))}
          placeholder="+57 300 123 4567" className={inputClass('phone')} />
      </Field>

      {/* Purpose select */}
      <Field label="Propósito del préstamo" id="purpose" error={isShow('purpose') ? errors.purpose : undefined}>
        <div className="relative">
          <select
            id="purpose"
            value={applicant.purpose}
            onChange={(e) => handleChange('purpose', e.target.value)}
            onBlur={() => setTouched((p) => ({ ...p, purpose: true }))}
            className={[
              inputClass('purpose'),
              'appearance-none cursor-pointer pr-10',
              !applicant.purpose ? 'text-muted' : '',
            ].join(' ')}
          >
            <option value="" disabled>Selecciona una opción…</option>
            {PURPOSES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          {/* Chevron */}
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </Field>

      <div className="flex gap-3 mt-6">
        <button id="btn-back-step3" onClick={goBack}
          className="flex-1 py-4 rounded-xl border-2 border-border-brand text-body font-semibold hover:border-body hover:bg-bg-base transition-all duration-150 active:scale-95">
          ← Atrás
        </button>
        <button id="btn-next-step3" onClick={handleNext}
          className="flex-grow-[2] py-4 rounded-xl bg-primary text-white font-semibold shadow-lg hover:bg-primary-hover hover:shadow-xl transition-all duration-200 active:scale-95">
          Ver contrato →
        </button>
      </div>
    </div>
  );
}
