import React, { useState, type FormEvent } from 'react';
import { Home, UserCircle2, ShieldCheck, ArrowRight, LogIn, Lock, Building2, ChevronRight, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import type { AppUser, UserRole } from '../types';

interface AuthPageProps {
  onLogin: (user: AppUser) => void;
  onCancel: () => void;
}

type AuthFlowState = 'select-mode' | 'signup-form' | 'login-form';

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onCancel }) => {
  const [flow, setFlow] = useState<AuthFlowState>('select-mode');
  const [selectedRole, setSelectedRole] = useState<UserRole>('renter');
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup');
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleModeSelection = (mode: 'signup' | 'login', role: UserRole = 'renter') => {
    setErrorMsg('');
    setAuthMode(mode);
    setSelectedRole(role);
    if (mode === 'signup') {
      setFlow('signup-form');
    } else {
      setFlow('login-form');
    }
  };

  const handleSignupSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setErrorMsg('');
    
    // Simulate user creation and log them in
    onLogin({
      name: name.trim(),
      email: email.trim(),
      role: selectedRole,
    });
  };

  const handleLoginSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setErrorMsg('');
    
    // Auto-generate name based on email prefix
    const generatedName = email.split('@')[0]
      .replace(/[._\-]/g, ' ')
      .replace(/\b\w/g, (match) => match.toUpperCase());

    // Super-admin special case email check
    const finalRole = email.toLowerCase().includes('admin') ? 'super-admin' as const : selectedRole;
    
    onLogin({
      name: finalRole === 'super-admin' ? 'System Administrator' : (selectedRole === 'owner' ? 'Premium Host' : generatedName || 'Valued Tenant'),
      email: email.trim(),
      role: finalRole,
    });
  };

  return (
    <div className="min-h-[85vh] w-full flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-4xl bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[550px] transition-all">
        
        {/* LEFT COLUMN: VISUAL BRANDING & PROMO */}
        <div className="lg:col-span-5 bg-slate-900 text-white p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
          {/* Decorative ambient glows */}
          <div className="absolute top-0 left-0 w-full h-full bg-radial-gradient from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-60 h-60 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />
          
          <div className="z-10">
            <button 
              onClick={onCancel}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-all bg-slate-800/50 hover:bg-slate-800 px-3 py-2 rounded-xl mb-8 cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Browse</span>
            </button>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-2xl">
                <Home className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  Rent<span className="text-emerald-400">Hub</span>
                </h2>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest">Enterprise Cloud Suite</p>
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-slate-100 leading-tight">
              Unlock elegant rental experiences instantly.
            </h3>
            <p className="text-sm text-slate-400 mt-4 leading-relaxed">
              Access the secure cloud platform designed for hosts running studios and tenants requesting premium bookings.
            </p>
          </div>
          
          <div className="z-10 mt-8 pt-8 border-t border-slate-800">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <p className="text-xs text-slate-400">
                End-to-end encrypted user authentication and PCI-DSS compliance.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ACTION FLOWS */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
          
          {/* FLOW 1: SELECT MODE / INITIAL LANDING */}
          {flow === 'select-mode' && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-600">Getting Started</span>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-1.5">Create your RentHub Account</h3>
                <p className="text-sm text-slate-500 mt-1">Select your portal to create an account and begin.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* OWNER STUDIO (HOST) CARD */}
                <button
                  onClick={() => handleModeSelection('signup', 'owner')}
                  className="group relative flex flex-col text-left p-6 rounded-3xl border border-slate-200/80 bg-white hover:border-emerald-500 hover:shadow-lg transition-all duration-300 cursor-pointer"
                >
                  <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl self-start group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mt-6 group-hover:text-emerald-700 transition">Owner Studio</h4>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    List upscale properties, track guest approvals, and manage cash flows.
                  </p>
                  <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-emerald-600 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                    <span>Create Account</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </button>

                {/* TENANTS PORTAL CARD */}
                <button
                  onClick={() => handleModeSelection('signup', 'renter')}
                  className="group relative flex flex-col text-left p-6 rounded-3xl border border-slate-200/80 bg-white hover:border-sky-500 hover:shadow-lg transition-all duration-300 cursor-pointer"
                >
                  <div className="bg-sky-50 text-sky-600 p-3 rounded-2xl self-start group-hover:bg-sky-500 group-hover:text-white transition-all duration-300">
                    <UserCircle2 className="h-6 w-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mt-6 group-hover:text-sky-700 transition">Tenants Portal</h4>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Browse luxury bookings, check in-progress stay updates, and complete rent payments.
                  </p>
                  <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-sky-600 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                    <span>Create Account</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </button>
              </div>

              <div className="pt-6 border-t border-slate-100 text-center">
                <p className="text-sm text-slate-500">
                  Already have an account?{' '}
                  <button
                    onClick={() => handleModeSelection('login', 'renter')}
                    className="font-bold text-emerald-600 hover:text-emerald-700 transition hover:underline cursor-pointer"
                  >
                    Log In instead
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* FLOW 2: SIGN-UP FORM */}
          {flow === 'signup-form' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <button
                  onClick={() => setFlow('select-mode')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition mb-3 cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Choose Portal Role</span>
                </button>
                <h3 className="text-2xl font-extrabold text-slate-900">
                  Register: {selectedRole === 'owner' ? 'Owner Studio' : 'Tenants Portal'}
                </h3>
                <p className="text-sm text-slate-500 mt-1">Set up your security credentials to access the console.</p>
              </div>

              {errorMsg && (
                <div className="bg-rose-50 border border-rose-100 text-rose-700 px-4 py-3 rounded-2xl text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSignupSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-4 pr-12 py-3.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/5"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className={`w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold text-white transition-all shadow-md mt-4 cursor-pointer hover:shadow-lg ${
                    selectedRole === 'owner' 
                      ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/10 hover:shadow-emerald-500/20' 
                      : 'bg-sky-600 hover:bg-sky-500 shadow-sky-600/10 hover:shadow-sky-500/20'
                  }`}
                >
                  <span>Create Account & Log In</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>
          )}

          {/* FLOW 3: LOGIN FORM */}
          {flow === 'login-form' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <button
                  onClick={() => setFlow('select-mode')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition mb-3 cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Choose Portal Role</span>
                </button>
                <h3 className="text-2xl font-extrabold text-slate-900">Welcome Back</h3>
                <p className="text-sm text-slate-500 mt-1">Sign in with your email credentials.</p>
              </div>

              {errorMsg && (
                <div className="bg-rose-50 border border-rose-100 text-rose-700 px-4 py-3 rounded-2xl text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Select Portal</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedRole('renter')}
                      className={`flex items-center justify-center gap-2 py-3 rounded-2xl border text-sm font-bold transition cursor-pointer ${
                        selectedRole === 'renter' 
                          ? 'border-sky-500 bg-sky-50 text-sky-700 shadow-sm' 
                          : 'border-slate-200 bg-white text-slate-600 hover:border-sky-200'
                      }`}
                    >
                      <UserCircle2 className="h-4 w-4" />
                      <span>Tenants</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setSelectedRole('owner')}
                      className={`flex items-center justify-center gap-2 py-3 rounded-2xl border text-sm font-bold transition cursor-pointer ${
                        selectedRole === 'owner' 
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm' 
                          : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-200'
                      }`}
                    >
                      <Building2 className="h-4 w-4" />
                      <span>Owner Studio</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-4 pr-12 py-3.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/5"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 py-4 text-sm font-bold text-white transition-all shadow-md shadow-emerald-600/10 hover:shadow-emerald-500/20 hover:shadow-lg mt-4 cursor-pointer"
                >
                  <span>Sign In</span>
                  <LogIn className="h-4 w-4" />
                </button>
              </form>

              <div className="pt-6 border-t border-slate-100 text-center">
                <p className="text-sm text-slate-500">
                  Don't have an account?{' '}
                  <button
                    onClick={() => handleModeSelection('signup', 'renter')}
                    className="font-bold text-emerald-600 hover:text-emerald-700 transition hover:underline cursor-pointer"
                  >
                    Register instead
                  </button>
                </p>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
