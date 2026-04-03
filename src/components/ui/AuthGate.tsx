import React, { useState } from 'react';
import { useLoan } from '../../context/LoanContext';
import { useToast } from './Toast';
import { ApiError } from '../../services/api';

interface AuthGateProps {
  onAuth: () => void;
}

export default function AuthGate({ onAuth }: AuthGateProps): React.ReactElement {
  const { loginOrRegister } = useLoan();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await loginOrRegister(email, password);
      onAuth();
    } catch (err) {
      const apiErr = err as ApiError;
      toast.error(
        'Error de autenticación',
        apiErr?.message ?? 'No se pudo iniciar sesión. Intenta de nuevo.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: 'var(--color-bg)' }}>
      <div className="w-full max-w-sm bg-surface border border-border-brand rounded-2xl p-6 shadow-sm">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-6">
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

        <h2 className="text-xl font-bold text-heading mb-1">Accede a tu cuenta</h2>
        <p className="text-xs text-muted mb-5">Si no tienes cuenta, se creará automáticamente.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted mb-1 uppercase tracking-wide">
              Correo electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="w-full px-3 py-2.5 rounded-xl border border-border-brand bg-surface text-sm text-heading placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1 uppercase tracking-wide">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              className="w-full px-3 py-2.5 rounded-xl border border-border-brand bg-surface text-sm text-heading placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95
              ${isLoading
                ? 'bg-border-brand text-muted cursor-not-allowed'
                : 'bg-primary text-white hover:bg-primary-hover'
              }`}
          >
            {isLoading ? 'Conectando…' : 'Continuar'}
          </button>
        </form>
      </div>
    </div>
  );
}
