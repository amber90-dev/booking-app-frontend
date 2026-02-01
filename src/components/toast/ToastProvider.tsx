import React, { createContext, useContext, useMemo, useState } from 'react';

type Toast = { id: string; type: 'success' | 'error' | 'info'; message: string };
type Ctx = {
  show: (m: string, type?: Toast['type']) => void;
  success: (m: string) => void;
  error: (m: string) => void;
  info: (m: string) => void;
};

const ToastCtx = createContext<Ctx | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const api: Ctx = useMemo(() => {
    const show = (message: string, type: Toast['type'] = 'info') => {
      const id = crypto.randomUUID?.() || Math.random().toString(36).slice(2);
      setToasts((t) => [...t, { id, type, message }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
    };
    return {
      show,
      success: (m) => show(m, 'success'),
      error:   (m) => show(m, 'error'),
      info:    (m) => show(m, 'info'),
    };
  }, []);

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div className="fixed top-3 right-3 z-[1000] space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={[
              'rounded-lg px-4 py-3 shadow-lg border text-sm max-w-sm',
              t.type === 'success' && 'bg-green-50 text-green-800 border-green-200',
              t.type === 'error'   && 'bg-rose-50 text-rose-800 border-rose-200',
              t.type === 'info'    && 'bg-slate-50 text-slate-800 border-slate-200',
            ].filter(Boolean).join(' ')}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}
