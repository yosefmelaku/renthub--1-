import React, { useState, type FormEvent } from 'react';
import { Home, UserCircle2, ShieldCheck, ArrowRight, LogIn, Lock, Building2, ArrowLeft, Eye, EyeOff, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import type { AppUser, UserRole } from '../types';

interface AuthPageProps {
  onLogin: (user: AppUser) => void;
  onCancel: () => void;
}

type AuthFlowState = 'select-mode' | 'signup-form' | 'login-form';

// Password strength checker
function getPasswordStrength(pw: string): { score: number; label: string; color: string; checks: { label: string; pass: boolean }[] } {
  const checks = [
    { label: 'At least 12 characters',        pass: pw.length >= 12 },
    { label: 'Uppercase letter (A–Z)',         pass: /[A-Z]/.test(pw) },
    { label: 'Lowercase letter (a–z)',         pass: /[a-z]/.test(pw) },
    { label: 'Number (0–9)',                   pass: /[0-9]/.test(pw) },
    { label: 'Special character (!@#$%^&*…)', pass: /[^A-Za-z0-9]/.test(pw) },
  ];
  const score = checks.filter(c => c.pass).length;
  const label = score <= 1 ? 'Very Weak' : score === 2 ? 'Weak' : score === 3 ? 'Fair' : score === 4 ? 'Strong' : 'Very Strong';
  const color = score <= 1 ? 'bg-rose-500' : score === 2 ? 'bg-orange-400' : score === 3 ? 'bg-amber-400' : score === 4 ? 'bg-emerald-400' : 'bg-emerald-600';
  return { score, label, color, checks };
}

// Forbidden usernames for any role
const FORBIDDEN_USERNAMES = ['admin', 'administrator', 'root', 'superadmin', 'super_admin', 'sysadmin', 'system'];

function isForbiddenUsername(value: string): boolean {
  return FORBIDDEN_USERNAMES.some(f => value.toLowerCase().replace(/\s/g, '').includes(f));
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onCancel }) => {
  const [flow, setFlow] = useState<AuthFlowState>('select-mode');
  const [selectedRole, setSelectedRole] = useState<UserRole>('renter');
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showStrength, setShowStrength] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const strength = getPasswordStrength(password);

  const handleModeSelection = (mode: 'signup' | 'login', role: UserRole = 'renter') => {
    setErrorMsg('');
    setAuthMode(mode);
    setSelectedRole(role);
    setFlow(mode === 'signup' ? 'signup-form' : 'login-form');
  };

  const handleSignupSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim()) { setErrorMsg('Please enter your full name.'); return; }

    // Block forbidden usernames
    if (isForbiddenUsername(name.trim())) {
      setErrorMsg('This username is not allowed. Please use your real name.');
      return;
    }

    if (!email.trim() || !email.includes('@')) { setErrorMsg('Please enter a valid email address.'); return; }

    // Block "admin" in email prefix for non-super-admin flows
    const emailPrefix = email.split('@')[0].toLowerCase();
    if (isForbiddenUsername(emailPrefix)) {
      setErrorMsg('This email is not permitted. Please use a personal email address.');
      return;
    }

    // Enforce strong password
    if (strength.score < 4) {
      setErrorMsg('Password is too weak. Please meet all security requirements below.');
      setShowStrength(true);
      return;
    }

    setErrorMsg('');
    onLogin({ name: name.trim(), email: email.trim(), role: selectedRole });
  };

  const handleLoginSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim()) { setErrorMsg('Please enter your email address.'); return; }
    if (!password) { setErrorMsg('Please enter your password.'); return; }

    const emailLower = email.toLowerCase();
    const emailPrefix = emailLower.split('@')[0];

    // Block plain "admin" username login attempt
    if (isForbiddenUsername(emailPrefix) && !emailLower.endsWith('@renthub.app')) {
      setErrorMsg('Access denied. Super Admin accounts must use the official @renthub.app domain.');
      return;
    }

    setErrorMsg('');

    // Determine role — Super Admin only via secure @renthub.app domain
    let finalRole: UserRole = selectedRole;
    let displayName = selectedRole === 'owner' ? 'Premium Host' : email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    if (emailLower === 'admin@renthub.app' || emailLower === 'superadmin@renthub.app') {
      setErrorMsg('Generic admin accounts are not permitted. Please use a named Super Admin credential.');
      return;
    }

    if (emailLower.endsWith('@renthub.app')) {
      finalRole = 'super-admin';
      displayName = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) + ' (RentHub)';
    }

    onLogin({ name: displayName, email: email.trim(), role: finalRole });
  };

  return (
    <div className="min-h-[85vh] w-full flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-4xl bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[550px] transition-all">

        {/* LEFT — Branding */}
        <div className="lg:col-span-5 bg-slate-900 text-white p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -bottom-20 -right-20 w-60 h-60 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />

          <div className="z-10">
            <button
              onClick={onCancel}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition bg-slate-800/50 hover:bg-slate-800 px-3 py-2 rounded-xl mb-8 cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Browse
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-2xl">
                <Home className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white tracking-tight">Rent<span className="text-emerald-400">Hub</span></h2>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest">Enterprise Cloud Suite</p>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-slate-100 leading-tight">Unlock elegant rental experiences instantly.</h3>
            <p className="text-sm text-slate-400 mt-4 leading-relaxed">
              Access the secure cloud platform designed for hosts running studios and tenants requesting premium bookings.
            </p>

            {/* Security policy notice */}
            <div className="mt-8 p-4 bg-slate-800/60 rounded-2xl border border-slate-700/50 space-y-2">
              <p className="text-xs font-bold text-slate-300 flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-400" /> Account Security Policy</p>
              <ul className="space-y-1.5 text-[11px] text-slate-400 leading-relaxed">
                <li className="flex gap-2"><span className="text-emerald-400 mt-0.5">•</span> Never use "admin" as a username</li>
                <li className="flex gap-2"><span className="text-emerald-400 mt-0.5">•</span> Super Admins must use <span className="text-slate-300 font-mono">@renthub.app</span> email</li>
                <li className="flex gap-2"><span className="text-emerald-400 mt-0.5">•</span> Strong password required (12+ chars)</li>
                <li className="flex gap-2"><span className="text-emerald-400 mt-0.5">•</span> Minimum Super Admin accounts at all times</li>
              </ul>
            </div>
          </div>

          <div className="z-10 mt-8 pt-8 border-t border-slate-800">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <p className="text-xs text-slate-400">End-to-end encrypted · PCI-DSS compliant</p>
            </div>
          </div>
        </div>

        {/* RIGHT — Forms */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center">

          {/* FLOW 1: SELECT MODE */}
          {flow === 'select-mode' && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-600">Getting Started</span>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-1.5">Create your RentHub Account</h3>
                <p className="text-sm text-slate-500 mt-1">Select your portal to create an account and begin.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => handleModeSelection('signup', 'owner')}
                  className="group flex flex-col text-left p-6 rounded-3xl border border-slate-200/80 bg-white hover:border-emerald-500 hover:shadow-lg transition-all duration-300 cursor-pointer"
                >
                  <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl self-start group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mt-6 group-hover:text-emerald-700 transition">Owner Studio</h4>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">List properties, track bookings, and manage cash flows.</p>
                  <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-emerald-600 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                    <span>Create Account</span><ArrowRight className="h-3 w-3" />
                  </div>
                </button>

                <button
                  onClick={() => handleModeSelection('signup', 'renter')}
                  className="group flex flex-col text-left p-6 rounded-3xl border border-slate-200/80 bg-white hover:border-sky-500 hover:shadow-lg transition-all duration-300 cursor-pointer"
                >
                  <div className="bg-sky-50 text-sky-600 p-3 rounded-2xl self-start group-hover:bg-sky-500 group-hover:text-white transition-all duration-300">
                    <UserCircle2 className="h-6 w-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mt-6 group-hover:text-sky-700 transition">Tenants Portal</h4>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">Browse bookings, track stays, and complete rent payments.</p>
                  <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-sky-600 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                    <span>Create Account</span><ArrowRight className="h-3 w-3" />
                  </div>
                </button>
              </div>

              <div className="pt-6 border-t border-slate-100 text-center">
                <p className="text-sm text-slate-500">
                  Already have an account?{' '}
                  <button onClick={() => handleModeSelection('login', 'renter')} className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer transition">
                    Log In instead
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* FLOW 2: SIGN-UP */}
          {flow === 'signup-form' && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <button onClick={() => setFlow('select-mode')} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition mb-3 cursor-pointer">
                  <ArrowLeft className="h-3.5 w-3.5" /> Choose Portal Role
                </button>
                <h3 className="text-2xl font-extrabold text-slate-900">
                  Register: {selectedRole === 'owner' ? 'Owner Studio' : 'Tenants Portal'}
                </h3>
                <p className="text-sm text-slate-500 mt-1">Set up your secure credentials to access the console.</p>
              </div>

              {errorMsg && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-xs font-semibold flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />{errorMsg}
                </div>
              )}

              <form onSubmit={handleSignupSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Full Name</label>
                  <input
                    type="text" required placeholder="Your real full name"
                    value={name} onChange={e => setName(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition"
                  />
                  {isForbiddenUsername(name) && name.length > 0 && (
                    <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1"><XCircle className="h-3.5 w-3.5" /> Forbidden username — use your real name</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Email Address</label>
                  <input
                    type="email" required placeholder="name@example.com"
                    value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'} required placeholder="Min. 12 chars with mixed case, numbers & symbols"
                      value={password} onChange={e => { setPassword(e.target.value); setShowStrength(true); }}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-4 pr-12 py-3.5 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Password strength meter */}
                  {showStrength && password.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-500">Strength</span>
                        <span className={`${strength.score >= 4 ? 'text-emerald-600' : strength.score === 3 ? 'text-amber-600' : 'text-rose-600'}`}>{strength.label}</span>
                      </div>
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map(i => (
                          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= strength.score ? strength.color : 'bg-slate-200'}`} />
                        ))}
                      </div>
                      <div className="grid grid-cols-1 gap-1 mt-2">
                        {strength.checks.map((c, i) => (
                          <div key={i} className="flex items-center gap-2 text-[11px]">
                            {c.pass
                              ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                              : <XCircle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                            }
                            <span className={c.pass ? 'text-emerald-700' : 'text-slate-400'}>{c.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className={`w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold text-white transition-all shadow-md mt-2 cursor-pointer hover:shadow-lg ${
                    selectedRole === 'owner' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-sky-600 hover:bg-sky-500'
                  }`}
                >
                  Create Account & Log In <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>
          )}

          {/* FLOW 3: LOGIN */}
          {flow === 'login-form' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <button onClick={() => setFlow('select-mode')} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition mb-3 cursor-pointer">
                  <ArrowLeft className="h-3.5 w-3.5" /> Choose Portal Role
                </button>
                <h3 className="text-2xl font-extrabold text-slate-900">Welcome Back</h3>
                <p className="text-sm text-slate-500 mt-1">Sign in with your credentials.</p>
              </div>

              {errorMsg && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-xs font-semibold flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />{errorMsg}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Select Portal</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setSelectedRole('renter')}
                      className={`flex items-center justify-center gap-2 py-3 rounded-2xl border text-sm font-bold transition cursor-pointer ${selectedRole === 'renter' ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-slate-200 bg-white text-slate-600 hover:border-sky-200'}`}>
                      <UserCircle2 className="h-4 w-4" /> Tenants
                    </button>
                    <button type="button" onClick={() => setSelectedRole('owner')}
                      className={`flex items-center justify-center gap-2 py-3 rounded-2xl border text-sm font-bold transition cursor-pointer ${selectedRole === 'owner' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-200'}`}>
                      <Building2 className="h-4 w-4" /> Owner Studio
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Email Address</label>
                  <input
                    type="email" required placeholder="name@example.com"
                    value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition"
                  />
                  {/* Super admin hint */}
                  {email.toLowerCase().includes('@renthub.app') && (
                    <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5 text-violet-500" />
                      <span className="text-violet-600 font-semibold">Super Admin domain detected</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'} required placeholder="••••••••"
                      value={password} onChange={e => setPassword(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-4 pr-12 py-3.5 text-sm outline-none focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 py-4 text-sm font-bold text-white shadow-md hover:shadow-lg mt-2 cursor-pointer transition">
                  Sign In <LogIn className="h-4 w-4" />
                </button>
              </form>

              <div className="pt-6 border-t border-slate-100 text-center">
                <p className="text-sm text-slate-500">
                  Don't have an account?{' '}
                  <button onClick={() => handleModeSelection('signup', 'renter')} className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer transition">
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
