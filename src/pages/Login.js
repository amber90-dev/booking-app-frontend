import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import api from '../api/axios';
import { useDispatch } from 'react-redux';
import { setAccessToken, setUser } from '../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/toast/ToastProvider';
export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const nav = useNavigate();
    const dispatch = useDispatch();
    const { error: toastError, success: toastSuccess } = useToast();
    const onSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const { data } = await api.post('/auth/login', { username, password });
            dispatch(setAccessToken(data.accessToken));
            dispatch(setUser(data.user));
            toastSuccess('Welcome back!');
            nav('/');
        }
        catch (err) {
            const res = err?.response;
            const payload = res?.data;
            let msg = payload?.message ??
                payload?.error ??
                (Array.isArray(payload?.errors) ? payload.errors.join(', ') : null) ??
                err?.message ??
                'Login failed';
            if (typeof msg !== 'string')
                msg = JSON.stringify(msg);
            setError(msg);
            toastError(msg); // show toast
        }
    };
    return (_jsx("div", { className: "min-h-screen grid md:grid-cols-2 dark:bg-slate-950 dark:text-slate-100", children: _jsx("div", { className: "flex items-center justify-center p-6", children: _jsxs("form", { onSubmit: onSubmit, className: "card w-full max-w-sm p-6", children: [_jsx("h2", { className: "text-xl font-semibold mb-1", children: "Sign in" }), _jsx("p", { className: "text-sm text-slate-500 dark:text-slate-400 mb-4", children: "Use your account to continue." }), error && (_jsx("div", { role: "alert", className: "mb-3 rounded-md border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2 text-sm", children: error })), _jsx("label", { className: "block text-sm font-medium mb-1", children: "Username" }), _jsx("input", { className: "input", value: username, onChange: (e) => setUsername(e.target.value), placeholder: "jdoe" }), _jsx("label", { className: "block text-sm font-medium mt-3 mb-1", children: "Password" }), _jsx("input", { className: "input", type: "password", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" }), _jsx("button", { type: "submit", className: "btn btn-primary w-full mt-4", children: "Sign in" })] }) }) }));
}
