import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  title: string;
  message?: string;
}

interface ToastContextValue {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
}

// ─── Contexto interno ─────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

// ─── Config visual por variante ───────────────────────────────────────────────

const VARIANTS: Record<
  ToastVariant,
  { bg: string; border: string; icon: string; iconBg: string; title: string }
> = {
  success: {
    bg: 'bg-white',
    border: 'border-green-200',
    iconBg: 'bg-green-100',
    icon: '✓',
    title: 'text-green-700',
  },
  error: {
    bg: 'bg-white',
    border: 'border-red-200',
    iconBg: 'bg-red-100',
    icon: '✕',
    title: 'text-red-700',
  },
  warning: {
    bg: 'bg-white',
    border: 'border-amber-200',
    iconBg: 'bg-amber-100',
    icon: '!',
    title: 'text-amber-700',
  },
  info: {
    bg: 'bg-white',
    border: 'border-blue-200',
    iconBg: 'bg-blue-100',
    icon: 'i',
    title: 'text-blue-700',
  },
};

// ─── Toast individual ─────────────────────────────────────────────────────────

function ToastCard({ toast, onRemove }: { toast: ToastItem; onRemove: () => void }) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    setLeaving(true);
    setTimeout(() => onRemove(), 300);
  }, [onRemove]);

  useEffect(() => {
    // Entrada con pequeño delay para la animación
    const enterTimer = setTimeout(() => setVisible(true), 10);
    // Auto-dismiss en 5 s
    timerRef.current = setTimeout(dismiss, 5000);
    return () => {
      clearTimeout(enterTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [dismiss]);

  const v = VARIANTS[toast.variant];

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`
        flex items-start gap-3 w-full max-w-sm
        ${v.bg} border-2 ${v.border}
        rounded-2xl px-4 py-3.5 shadow-xl shadow-slate-200
        transition-all duration-300 ease-out
        ${visible && !leaving ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
    >
      {/* Icono */}
      <div
        className={`
          ${v.iconBg} w-8 h-8 rounded-full flex items-center justify-center
          flex-shrink-0 font-bold text-sm ${v.title}
        `}
      >
        {v.icon}
      </div>

      {/* Texto */}
      <div className="flex-1 min-w-0 pt-0.5">
        <p className={`text-sm font-semibold ${v.title} leading-tight`}>
          {toast.title}
        </p>
        {toast.message && (
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            {toast.message}
          </p>
        )}
      </div>

      {/* Cerrar */}
      <button
        onClick={dismiss}
        aria-label="Cerrar notificación"
        className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors mt-0.5"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ─── Contenedor flotante ──────────────────────────────────────────────────────

export function ToastContainer() {
  const ctx = useContext(ToastContext);
  if (!ctx || ctx.toasts.length === 0) return null;

  return (
    <div
      aria-label="Notificaciones"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center w-full px-4 pointer-events-none"
    >
      {ctx.toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto w-full max-w-sm">
          <ToastCard toast={t} onRemove={() => ctx.removeToast(t.id)} />
        </div>
      ))}
    </div>
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

// ─── Hook público ─────────────────────────────────────────────────────────────

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>');

  const { addToast } = ctx;

  return {
    toast: {
      success: (title: string, message?: string) =>
        addToast({ variant: 'success', title, message }),
      error: (title: string, message?: string) =>
        addToast({ variant: 'error', title, message }),
      warning: (title: string, message?: string) =>
        addToast({ variant: 'warning', title, message }),
      info: (title: string, message?: string) =>
        addToast({ variant: 'info', title, message }),
    },
  };
}
