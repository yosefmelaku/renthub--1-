import React, { useState, type FormEvent, type FC } from 'react';

import { Home, UserCircle2, ShieldCheck, Crown, ArrowRight, LogIn, UserPlus2 } from 'lucide-react';
import type { AppUser, UserRole } from '../types';

interface LoginPageProps {
  onLogin: (user: AppUser) => void;
  onClose: () => void;
}

export const LoginPage: FC<LoginPageProps> = ({ onLogin, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('renter');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) {
      alert('Please enter your email address to continue.');
      return;
    }

    const name = email.split('@')[0].replace(/[._\-]/g, ' ').replace(/\b\w/g, (match) => match.toUpperCase());
    const displayName = role === 'owner' ? 'Premium Host' : role === 'super-admin' ? 'System Administrator' : name;

    onLogin({
      name: displayName,
      email: email.trim(),
      role,
    });
  };

  const roleOptions: Array<{ value: UserRole; label: string; icon: React.ReactNode; description: string }> = [
    { value: 'renter', label: 'Renter', icon: <UserCircle2 className="h-4 w-4" />, description: 'Browse and book stays' },
    { value: 'owner', label: 'Owner', icon: <Home className="h-4 w-4" />, description: 'Manage listings and approvals' },
    { value: 'super-admin', label: 'Super Admin', icon: <Crown className="h-4 w-4" />, description: 'Control the full platform' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">Secure Access</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Sign in or sign up to continue.</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-slate-500 hover:text-slate-900">
            ×
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-0">
          <div className="px-8 py-10 lg:px-12 lg:py-12">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-700">
                <ShieldCheck className="h-4 w-4" />
                <span className="font-semibold">RentHub</span>
                <span className="text-slate-600">secure login first</span>
              </div>
              <h1 className="text-3xl font-extrabold leading-tight text-slate-900">Choose your portal and continue with confidence.</h1>
              <p className="text-sm leading-relaxed text-slate-600">Use the same elegant flow to browse homes, manage listings, or operate the platform as a super admin.</p>
            </div>

            <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex rounded-2xl border border-slate-200 bg-white p-1">
                  <button type="button" onClick={() => setAuthMode('login')} className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${authMode === 'login' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
                    <LogIn className="h-4 w-4" />
                    Login
                  </button>
                  <button type="button" onClick={() => setAuthMode('signup')} className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${authMode === 'signup' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
                    <UserPlus2 className="h-4 w-4" />
                    Sign Up
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {roleOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setRole(option.value)}
                      className={`rounded-2xl border px-3 py-3 text-left transition ${role === option.value ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm' : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-200'}`}
                    >
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        {option.icon}
                        <span>{option.label}</span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-500">{option.description}</p>
                    </button>
                  ))}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Email address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" />
                </div>

                <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500">
                  {authMode === 'signup' ? 'Create account' : 'Continue'} as {role === 'super-admin' ? 'Super Admin' : role === 'owner' ? 'Host' : 'Renter'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>

          <div className="bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.15),_transparent_45%)] px-8 py-10 text-slate-100 lg:px-12 lg:py-12">
            <div className="space-y-6">
              <div>
                <span className="text-xs uppercase tracking-[0.3em] text-emerald-300">Built for every role</span>
                <h2 className="mt-4 text-2xl font-bold text-slate-900">Navigate faster with role-aware access.</h2>
              </div>
              <ul className="space-y-4 text-sm text-slate-600">
                <li className="flex gap-3 items-start"><span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-400"></span>Use instant search to find homes, cities, and property features.</li>
                <li className="flex gap-3 items-start"><span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-400"></span>Switch between renter, owner, and super-admin dashboards without friction.</li>
                <li className="flex gap-3 items-start"><span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-400"></span>Keep bookings, payments, and approvals streamlined from one secure entrypoint.</li>
              </ul>
            </div>
            <div className="mt-10 rounded-3xl border border-white/10 bg-slate-950/80 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">Pro tip</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">Pick the role that matches your workflow. The experience adapts instantly so you can focus on the next task.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
