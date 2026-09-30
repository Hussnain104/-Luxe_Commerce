import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, Mail, User as UserIcon, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

export const LoginPage: React.FC = () => {
  const { login, register, switchDemoRole, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/account';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === 'login') {
      const ok = await login(email, password);
      if (ok) navigate(from, { replace: true });
    } else {
      const ok = await register({ firstName, lastName, email, password, phone });
      if (ok) navigate(from, { replace: true });
    }
    setLoading(false);
  };

  const handleDemoClick = async (role: 'super_admin' | 'manager' | 'customer') => {
    await switchDemoRole(role);
    if (role === 'super_admin' || role === 'manager') {
      navigate('/admin');
    } else {
      navigate('/account');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50/50 py-16 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-neutral-200 shadow-xl overflow-hidden">
        {/* Top Header */}
        <div className="p-8 text-center bg-neutral-950 text-white space-y-2">
          <Link to="/" className="font-serif-luxury text-2xl font-bold tracking-widest block">
            LUXE<span className="font-light text-amber-400">COMMERCE</span>
          </Link>
          <p className="text-xs text-neutral-400 font-mono uppercase tracking-wider">
            Private Client & Atelier Gateway
          </p>
        </div>

        {/* 1-Click Demo Accounts Switcher for Reviewers */}
        <div className="p-4 bg-amber-50/80 border-b border-amber-100">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>Instant Demo Access (No password required)</span>
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleDemoClick('super_admin')}
              className="bg-neutral-900 hover:bg-black text-amber-300 py-1.5 px-2 rounded-lg text-[11px] font-bold shadow-xs transition cursor-pointer"
            >
              Super Admin
            </button>
            <button
              onClick={() => handleDemoClick('manager')}
              className="bg-neutral-800 hover:bg-neutral-900 text-white py-1.5 px-2 rounded-lg text-[11px] font-medium shadow-xs transition cursor-pointer"
            >
              Manager
            </button>
            <button
              onClick={() => handleDemoClick('customer')}
              className="bg-neutral-200 hover:bg-neutral-300 text-neutral-900 py-1.5 px-2 rounded-lg text-[11px] font-medium shadow-xs transition cursor-pointer"
            >
              VIP Client
            </button>
          </div>
        </div>

        {/* Mode Switch Tabs */}
        <div className="flex border-b border-neutral-200">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
              mode === 'login'
                ? 'border-b-2 border-neutral-900 text-neutral-900'
                : 'text-neutral-400 hover:text-neutral-600'
            }`}
          >
            Client Sign In
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
              mode === 'register'
                ? 'border-b-2 border-neutral-900 text-neutral-900'
                : 'text-neutral-400 hover:text-neutral-600'
            }`}
          >
            Join the Inner Circle
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {mode === 'register' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-lg p-2.5 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-lg p-2.5 text-xs"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Private Telephone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-lg p-2.5 text-xs"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">VIP Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@luxecommerce.com or client@luxe.com"
              className="w-full bg-neutral-50 border border-neutral-200 rounded-lg p-2.5 text-xs"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-neutral-700">Security Password</label>
              {mode === 'login' && (
                <span className="text-[11px] text-neutral-400">Demo pwd: password123</span>
              )}
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-lg p-2.5 text-xs"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-neutral-900 hover:bg-black text-white py-3.5 rounded-xl font-semibold text-xs tracking-widest uppercase flex items-center justify-center gap-2 shadow-md transition disabled:opacity-50 mt-6 cursor-pointer"
          >
            <span>{loading ? 'Authenticating...' : mode === 'login' ? 'Authorize Session' : 'Create VIP Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="p-4 bg-neutral-50 border-t border-neutral-100 text-center text-[11px] text-neutral-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline mr-1" />
          256-Bit Hardware Encrypted Vault Connection
        </div>
      </div>
    </div>
  );
};
