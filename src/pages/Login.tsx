import { useState, FormEvent } from 'react';
import api from '../api/axios';
import { useDispatch } from 'react-redux';
import { setAccessToken, setUser } from '../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/toast/ToastProvider';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const nav = useNavigate();
  const dispatch = useDispatch();
  const { error: toastError, success: toastSuccess } = useToast();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const { data } = await api.post('/auth/login', { username, password });
      dispatch(setAccessToken(data.accessToken));
      dispatch(setUser(data.user));
      toastSuccess('Welcome back!');
      nav('/');
    } catch (err: any) {
      const res = err?.response;
      const payload = res?.data;
      let msg: any =
        payload?.message ??
        payload?.error ??
        (Array.isArray(payload?.errors) ? payload.errors.join(', ') : null) ??
        err?.message ??
        'Login failed';
      if (typeof msg !== 'string') msg = JSON.stringify(msg);
      setError(msg);
      toastError(msg); // show toast
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row dark:bg-slate-950 dark:text-slate-100">
      {/* Left side: Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12 order-2 md:order-1 bg-white dark:bg-slate-950">
        <form onSubmit={onSubmit} className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center sm:items-start">
            <img src="/roadserve-logo.png" alt="RoadServe" className="h-24 w-auto mb-4" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center sm:text-left">Chauffeur & Professional Services</p>
          </div>
          
          <h2 className="text-xl font-semibold mb-1">Sign in</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Enter your credentials to access your account.</p>

          {error && (
            <div role="alert" className="mb-4 rounded-md border border-rose-200 bg-rose-50 text-rose-700 px-4 py-3 text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              {error}
            </div>
          )}

          <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-300">Username</label>
          <input className="input h-11 mb-4 bg-slate-50 border-slate-200 focus:bg-white dark:bg-slate-900 dark:border-slate-800" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter username" />

          <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-300">Password</label>
          <input className="input h-11 mb-6 bg-slate-50 border-slate-200 focus:bg-white dark:bg-slate-900 dark:border-slate-800" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />

          <button type="submit" className="btn btn-primary w-full h-11 text-base font-semibold shadow-sm hover:shadow-md transition-all">Sign in</button>
        </form>
      </div>

      {/* Right side: Hero Design */}
      <div className="flex-1 hidden md:flex flex-col items-center justify-center p-12 order-1 md:order-2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 relative overflow-hidden">
        {/* Abstract decorative elements */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')] opacity-30"></div>
        
        <div className="relative z-10 text-center max-w-md">
          <div className="w-48 h-auto bg-white/60 p-4 rounded-3xl border border-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <img src="/roadserve-logo.png" alt="RoadServe Logo" className="w-full h-auto object-contain drop-shadow-md" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Professional fleet management, elevated.</h2>
          <p className="text-slate-300 text-sm leading-relaxed">Streamline your chauffeur operations, manage bookings effortlessly, and deliver an exceptional experience to your clients with our comprehensive dashboard.</p>
        </div>
      </div>
    </div>
  );
}
