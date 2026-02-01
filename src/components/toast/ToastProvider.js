import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useContext, useMemo, useState } from 'react';
const ToastCtx = createContext(null);
export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const api = useMemo(() => {
        const show = (message, type = 'info') => {
            const id = crypto.randomUUID?.() || Math.random().toString(36).slice(2);
            setToasts((t) => [...t, { id, type, message }]);
            setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
        };
        return {
            show,
            success: (m) => show(m, 'success'),
            error: (m) => show(m, 'error'),
            info: (m) => show(m, 'info'),
        };
    }, []);
    return (_jsxs(ToastCtx.Provider, { value: api, children: [children, _jsx("div", { className: "fixed top-3 right-3 z-[1000] space-y-2", children: toasts.map((t) => (_jsx("div", { className: [
                        'rounded-lg px-4 py-3 shadow-lg border text-sm max-w-sm',
                        t.type === 'success' && 'bg-green-50 text-green-800 border-green-200',
                        t.type === 'error' && 'bg-rose-50 text-rose-800 border-rose-200',
                        t.type === 'info' && 'bg-slate-50 text-slate-800 border-slate-200',
                    ].filter(Boolean).join(' '), children: t.message }, t.id))) })] }));
}
export function useToast() {
    const ctx = useContext(ToastCtx);
    if (!ctx)
        throw new Error('useToast must be used within <ToastProvider>');
    return ctx;
}
