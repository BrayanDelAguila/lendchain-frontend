import React, { createContext, useContext, useState } from 'react';
import api, { ApiError } from '../services/api';

// ─── Domain types ──────────────────────────────────────────────────────────────

export type PurposeType = 'personal' | 'negocio' | 'educacion' | 'salud' | 'otro' | '';

export interface Applicant {
  fullName: string;
  documentId: string;
  email: string;
  phone: string;
  purpose: PurposeType;
}

export interface ScheduleItem {
  num: number;
  payment: number;
  capital: number;
  interest: number;
  balance: number;
}

// ─── Context type ──────────────────────────────────────────────────────────────

export interface LoanContextType {
  // Auth
  accessToken: string;
  isAuthenticated: boolean;
  loginOrRegister: (email: string, password: string) => Promise<void>;

  // Navigation
  currentStep: number;
  goNext: () => void;
  goBack: () => void;
  goToStart: () => void;

  // Step 1
  amount: string;
  setAmount: (v: string) => void;
  term: number | null;
  setTerm: (v: number | null) => void;

  // Step 3
  applicant: Applicant;
  setApplicant: (v: Applicant) => void;

  // Step 4
  termsAccepted: boolean;
  setTermsAccepted: (v: boolean) => void;
  signature: string;
  setSignature: (v: string) => void;

  // Step 5 — real data from backend
  loanId: string;
  txHash: string;
  contractAddress: string;
  setLoanId: (v: string) => void;
  setTxHash: (v: string) => void;
  setContractAddress: (v: string) => void;

  // Amortization
  schedule: ScheduleItem[];
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  RATE: number;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const LoanContext = createContext<LoanContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function LoanProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string>(() => localStorage.getItem('lendchain_jwt') ?? '');
  const isAuthenticated = accessToken.length > 0;

  const loginOrRegister = async (email: string, password: string): Promise<void> => {
    try {
      const { data } = await api.post<{ data: { access_token: string } }>(
        '/api/v1/users/login', { email, password }
      );
      const token = data.data.access_token;
      localStorage.setItem('lendchain_jwt', token);
      setAccessToken(token);
    } catch (loginErr: unknown) {
      const loginError = loginErr as ApiError;
      if (loginError.code === 'UNAUTHORIZED' || loginError.code?.startsWith('HTTP_401')) {
        try {
          const { data } = await api.post<{ data: { access_token: string } }>(
            '/api/v1/users/register', {
              email,
              password,
              full_name: email.split('@')[0],
            }
          );
          const token = data.data.access_token;
          localStorage.setItem('lendchain_jwt', token);
          setAccessToken(token);
        } catch (registerErr: unknown) {
          const regError = registerErr as ApiError;
          if (regError.code === 'VALIDATION_ERROR' || regError.code?.startsWith('HTTP_422')) {
            throw { code: 'WRONG_PASSWORD', message: 'Contraseña incorrecta. Intenta de nuevo.' } as ApiError;
          }
          throw regError;
        }
      } else {
        throw loginErr;
      }
    }
  };

  const [currentStep, setCurrentStep] = useState<number>(1);

  const [amount, setAmount] = useState<string>('');
  const [term, setTerm] = useState<number | null>(null);

  const [applicant, setApplicant] = useState<Applicant>({
    fullName: '',
    documentId: '',
    email: '',
    phone: '',
    purpose: '',
  });

  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [signature, setSignature] = useState<string>('');

  const [loanId, setLoanId] = useState<string>('');
  const [txHash, setTxHash] = useState<string>('');
  const [contractAddress, setContractAddress] = useState<string>('');

  const goNext = () => setCurrentStep((s) => Math.min(s + 1, 5));
  const goBack = () => setCurrentStep((s) => Math.max(s - 1, 1));
  const goToStart = () => {
    setCurrentStep(1);
    setAmount('');
    setTerm(null);
    setApplicant({ fullName: '', documentId: '', email: '', phone: '', purpose: '' });
    setTermsAccepted(false);
    setSignature('');
    setLoanId('');
    setTxHash('');
    setContractAddress('');
  };

  const RATE = 0.05;

  const calculateSchedule = (): ScheduleItem[] => {
    const principal = parseFloat(amount);
    const months = term ?? 0;
    if (!principal || !months) return [];

    const monthlyRate = RATE / 12;
    const payment = (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));

    let balance = principal;
    const schedule: ScheduleItem[] = [];

    for (let i = 1; i <= months; i++) {
      const interest = balance * monthlyRate;
      const capital = payment - interest;
      balance -= capital;
      schedule.push({
        num: i,
        payment,
        capital,
        interest,
        balance: Math.max(balance, 0),
      });
    }
    return schedule;
  };

  const schedule = calculateSchedule();
  const monthlyPayment = schedule.length > 0 ? schedule[0].payment : 0;
  const totalPayment = schedule.reduce((a, r) => a + r.payment, 0);
  const totalInterest = totalPayment - parseFloat(amount || '0');

  const value: LoanContextType = {
    accessToken, isAuthenticated, loginOrRegister,
    currentStep, goNext, goBack, goToStart,
    amount, setAmount,
    term, setTerm,
    applicant, setApplicant,
    termsAccepted, setTermsAccepted,
    signature, setSignature,
    loanId, txHash, contractAddress,
    setLoanId, setTxHash, setContractAddress,
    schedule, monthlyPayment, totalPayment, totalInterest,
    RATE,
  };

  return (
    <LoanContext.Provider value={value}>
      {children}
    </LoanContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useLoan(): LoanContextType {
  const ctx = useContext(LoanContext);
  if (!ctx) throw new Error('useLoan debe usarse dentro de <LoanProvider>');
  return ctx;
}
