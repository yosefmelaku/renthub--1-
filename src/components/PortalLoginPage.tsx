import React, { useState, type FormEvent } from 'react';
import { Home, UserCircle2, ShieldCheck, ArrowRight, LogIn, Lock, Building, CheckCircle2, ChevronRight, ArrowLeft, Plus, Minus, AlertTriangle, Sparkles, HelpCircle, Check, Star } from 'lucide-react';
import type { AppUser, UserRole } from '../types';

interface PortalLoginPageProps {
  onLogin: (user: AppUser) => void;
}

type StepState = 'landing' | 'portal-select' | 'owner-login' | 'tenant-login';

export const PortalLoginPage: React.FC<PortalLoginPageProps> = ({ onLogin }) => {
  const [step, setStep] = useState<StepState>('landing');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [tenantPassword, setTenantPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Calculator State
  const [unitCount, setUnitCount] = useState<number>(3);
  const [isAnnual, setIsAnnual] = useState<boolean>(true);

  // Dynamic pricing calculation
  const calculateProPrice = () => {
    const basePrice = isAnnual ? 12 : 15;
    const perUnitExtra = isAnnual ? 1.20 : 1.50;
    
    if (unitCount <= 3) {
      return basePrice;
    }
    // Base covers up to 3 units, additional units charged extra
    return basePrice + (unitCount - 3) * perUnitExtra;
  };

  const handleGeneralStart = () => {
    setErrorMsg('');
    setStep('portal-select');
  };

  const handleOwnerSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim() || !ownerPassword) {
      setErrorMsg('Please enter both your registered email and password.');
      return;
    }
    setErrorMsg('');
    
    // Create a user name from the email
    const namePart = email.split('@')[0];
    const name = namePart.replace(/[._\-]/g, ' ').replace(/\b\w/g, (match) => match.toUpperCase());
    
    onLogin({
      name: name || 'Premium Host',
      email: email.trim(),
      role: 'owner',
    });
  };

  const handleTenantSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim() || !tenantPassword) {
      setErrorMsg('Please enter both your registered email and password.');
      return;
    }
    setErrorMsg('');
    
    const namePart = email.split('@')[0];
    const name = namePart.replace(/[._\-]/g, ' ').replace(/\b\w/g, (match) => match.toUpperCase());
    
    onLogin({
      name: name || 'Valued Tenant',
      email: email.trim(),
      role: 'renter',
    });
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-800 flex flex-col font-sans transition-all duration-300">
      
      {/* 1. LANDING PAGE STATE */}
      {step === 'landing' && (
        <div className="flex-1 flex flex-col">
          {/* Header Navbar */}
          <header className="bg-white border-b border-slate-100 sticky top-0 z-50 px-6 py-4 shadow-xs">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              {/* Brand Logo */}
              <div className="flex items-center gap-2">
                <div className="bg-emerald-600 text-white p-2 rounded-xl shadow-xs">
                  <Home className="h-5 w-5" />
                </div>
                <span className="font-sans font-extrabold text-xl tracking-tight text-slate-900">
                  Rent<span className="text-emerald-600">Hub</span> <span className="text-slate-500 font-medium text-lg">Studio</span>
                </span>
              </div>

              {/* Navigation Links */}
              <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
                <span className="hover:text-emerald-600 cursor-pointer flex items-center gap-1">Solutions <ChevronRight className="h-3 w-3 rotate-90" /></span>
                <span className="text-emerald-600 border-b-2 border-emerald-600 pb-1 cursor-pointer">Pricing</span>
                <span className="hover:text-emerald-600 cursor-pointer">Reviews</span>
                <span className="hover:text-emerald-600 cursor-pointer">How it works</span>
                <span className="hover:text-emerald-600 cursor-pointer flex items-center gap-1">Education <ChevronRight className="h-3 w-3 rotate-90" /></span>
              </nav>

              {/* Action Buttons */}
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleGeneralStart}
                  className="text-sm font-bold text-rose-500 hover:text-rose-600 transition cursor-pointer"
                >
                  Log in
                </button>
                <button 
                  onClick={handleGeneralStart}
                  className="bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold px-5 py-2.5 rounded-full transition shadow-md shadow-rose-500/10 cursor-pointer"
                >
                  Get started
                </button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 max-w-7xl mx-auto px-6 py-12 md:py-16 w-full space-y-16">
            
            {/* Hero Section */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 items-center">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
                  Choose the right plan for your needs
                </h1>
                <p className="text-slate-600 text-sm md:text-base leading-relaxed max-w-2xl">
                  Trusted by <strong className="text-slate-900 font-bold">80,000+ independent property owners</strong> just like you. Whether you’re looking to set and forget your rental management or looking to grow your investment portfolio. We have plans for you starting from $0/month.
                </p>
                <div className="pt-2">
                  <button 
                    onClick={handleGeneralStart}
                    className="bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-sm px-7 py-4 rounded-full transition shadow-lg shadow-rose-500/20 active:scale-95 cursor-pointer"
                  >
                    Get started for free
                  </button>
                </div>
              </div>

              {/* SVG Property Illustration matching Landlord Studio */}
              <div className="flex justify-center lg:justify-end relative">
                <svg viewBox="0 0 420 200" className="w-full max-w-[380px] h-auto drop-shadow-xl">
                  {/* Ground */}
                  <line x1="10" y1="180" x2="410" y2="180" stroke="#e2e8f0" strokeWidth="3" />
                  
                  {/* Grass bush patches */}
                  <path d="M20,180 C30,170 40,170 50,180" fill="#10b981" opacity="0.8" />
                  <path d="M370,180 C380,175 390,175 400,180" fill="#10b981" opacity="0.8" />
                  
                  {/* Shop Building (Dark Blue) */}
                  <rect x="70" y="80" width="130" height="100" fill="#0c2340" rx="6" />
                  <rect x="70" y="80" width="130" height="10" fill="#10b981" rx="2" /> {/* green banner */}
                  
                  {/* Shop Windows & Door */}
                  <rect x="85" y="110" width="30" height="30" fill="#3b82f6" opacity="0.3" rx="4" stroke="#475569" strokeWidth="2" />
                  <line x1="100" y1="110" x2="100" y2="140" stroke="#475569" strokeWidth="1" />
                  <line x1="85" y1="125" x2="115" y2="125" stroke="#475569" strokeWidth="1" />
                  
                  <rect x="150" y="110" width="30" height="30" fill="#3b82f6" opacity="0.3" rx="4" stroke="#475569" strokeWidth="2" />
                  <line x1="165" y1="110" x2="165" y2="140" stroke="#475569" strokeWidth="1" />
                  <line x1="150" y1="125" x2="180" y2="125" stroke="#475569" strokeWidth="1" />

                  <rect x="123" y="130" width="22" height="50" fill="#1e293b" rx="2" />
                  <circle cx="140" cy="155" r="2" fill="#fbbf24" />

                  {/* House Building (Light Blue) */}
                  <rect x="230" y="90" width="130" height="90" fill="#60a5fa" opacity="0.4" rx="4" />
                  <polygon points="220,90 295,45 370,90" fill="#2563eb" opacity="0.8" />
                  
                  {/* House details */}
                  <rect x="250" y="110" width="25" height="25" fill="#ffffff" rx="2" />
                  <line x1="262.5" y1="110" x2="262.5" y2="135" stroke="#94a3b8" />
                  <line x1="250" y1="122.5" x2="275" y2="122.5" stroke="#94a3b8" />

                  <rect x="305" y="110" width="25" height="25" fill="#ffffff" rx="2" />
                  <line x1="317.5" y1="110" x2="317.5" y2="135" stroke="#94a3b8" />
                  <line x1="305" y1="122.5" x2="330" y2="122.5" stroke="#94a3b8" />

                  <rect x="285" y="140" width="20" height="40" fill="#1e293b" />
                  <circle cx="289" cy="160" r="1.5" fill="#fbbf24" />

                  {/* Tree */}
                  <rect x="202" y="120" width="10" height="60" fill="#b45309" />
                  <path d="M185,120 C185,85 230,85 230,120 Z" fill="#10b981" />
                  {/* Swirly branch lines inside tree */}
                  <path d="M207,130 C207,145 204,155 202,170" stroke="#78350f" strokeWidth="2" fill="none" />
                </svg>
              </div>
            </div>

            {/* Interactive Calculator Section */}
            <div className="bg-blue-50/70 border border-blue-100 rounded-3xl p-6 md:p-8 shadow-xs">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-blue-100/60">
                {/* Unit selector */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <span className="text-sm font-bold text-slate-800 uppercase tracking-wider">No. of property units</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setUnitCount(prev => Math.max(1, prev - 1))}
                      className="w-10 h-10 bg-white border border-slate-200 hover:border-emerald-500 rounded-xl flex items-center justify-center font-bold text-slate-600 transition active:scale-90 cursor-pointer"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={unitCount}
                      onChange={(e) => setUnitCount(Math.max(1, Number(e.target.value)))}
                      className="w-16 h-10 bg-white border border-slate-200 rounded-xl text-center font-extrabold text-sm focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={() => setUnitCount(prev => prev + 1)}
                      className="w-10 h-10 bg-white border border-slate-200 hover:border-emerald-500 rounded-xl flex items-center justify-center font-bold text-slate-600 transition active:scale-90 cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Billing toggle */}
                <div className="flex items-center gap-4">
                  <div className="bg-slate-200/60 p-1 rounded-2xl flex items-center">
                    <button
                      onClick={() => setIsAnnual(false)}
                      className={`px-4 py-2 text-xs font-bold rounded-xl transition ${!isAnnual ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => setIsAnnual(true)}
                      className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${isAnnual ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                      <span>Annually</span>
                      <span className="bg-emerald-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider scale-95">SAVE 20%</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Dynamic Pricing Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
                
                {/* Plan 1: Starter */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between shadow-xs hover:border-slate-300 transition">
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Starter Plan</span>
                      <h3 className="text-3xl font-black text-slate-900">$0<span className="text-sm font-medium text-slate-500">/mo</span></h3>
                      <p className="text-xs text-slate-500 mt-1">Free forever for basic use.</p>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-600 pt-4 border-t border-slate-100">
                      <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> Basic rent collection</li>
                      <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> 1 Property listings limit</li>
                      <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> Basic email reports</li>
                    </ul>
                  </div>
                  <button 
                    onClick={handleGeneralStart}
                    className="w-full mt-6 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold py-3 rounded-2xl transition cursor-pointer"
                  >
                    Get started for free
                  </button>
                </div>

                {/* Plan 2: Professional (Most Popular) */}
                <div className="bg-white border-2 border-emerald-500 rounded-3xl p-6 flex flex-col justify-between shadow-md relative">
                  <span className="absolute top-0 right-6 -translate-y-1/2 bg-emerald-500 text-white text-[9px] font-extrabold uppercase px-3 py-1 rounded-full tracking-widest">
                    MOST POPULAR
                  </span>
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block mb-1">Professional Plan</span>
                      <h3 className="text-3xl font-black text-slate-900">
                        ${calculateProPrice().toFixed(2)}
                        <span className="text-sm font-medium text-slate-500">/mo</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">Billed {isAnnual ? 'annually' : 'monthly'} for {unitCount} units.</p>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-600 pt-4 border-t border-slate-100">
                      <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> Unlimited properties</li>
                      <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> Premium Cashflow dashboard</li>
                      <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> Dynamic stays & bookings queue</li>
                      <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> Document storage & cloud sync</li>
                    </ul>
                  </div>
                  <button 
                    onClick={handleGeneralStart}
                    className="w-full mt-6 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold py-3 rounded-2xl transition cursor-pointer shadow-md shadow-emerald-600/10"
                  >
                    Start 7-Day Free Trial
                  </button>
                </div>

                {/* Plan 3: Enterprise */}
                <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 flex flex-col justify-between shadow-xs">
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Enterprise Plan</span>
                      <h3 className="text-3xl font-black">Custom</h3>
                      <p className="text-xs text-slate-400 mt-1">For portfolios with large volumes.</p>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-300 pt-4 border-t border-slate-800">
                      <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Dedicated Account Manager</li>
                      <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Custom branding portals</li>
                      <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Direct API access & ledgers</li>
                    </ul>
                  </div>
                  <button 
                    onClick={handleGeneralStart}
                    className="w-full mt-6 bg-white hover:bg-slate-100 text-slate-900 text-xs font-extrabold py-3 rounded-2xl transition cursor-pointer"
                  >
                    Contact Sales
                  </button>
                </div>

              </div>
            </div>

          </main>

          {/* Landing Footer */}
          <footer className="bg-white border-t border-slate-100 py-6 mt-16 text-center text-xs text-slate-400">
            <p>&copy; {new Date().getFullYear()} RentHub Studio Cloud. All rights reserved.</p>
          </footer>
        </div>
      )}

      {/* 2. PORTAL SELECTION STATE */}
      {step === 'portal-select' && (
        <div className="flex-1 flex items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-600/10 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-sky-600/10 blur-[120px] pointer-events-none" />

          <div className="w-full max-w-md z-10">
            <div className="flex flex-col items-center mb-8">
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-2xl mb-3 shadow-xl">
                <Home className="h-8 w-8 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-extrabold text-white">Rent<span className="text-emerald-400">Hub</span> Studio</h2>
              <p className="text-slate-500 text-xs uppercase tracking-widest mt-1">Identity & Portal Routing</p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-xl animate-fadeIn">
              <div className="mb-6 text-center">
                <span className="text-xs font-bold text-emerald-400 tracking-widest uppercase block mb-1">Portal Access</span>
                <h3 className="text-xl font-bold text-white">Welcome!</h3>
                <p className="text-slate-400 text-xs mt-1 font-semibold text-emerald-300">Where would you like to log in?</p>
              </div>

              <div className="space-y-4">
                {/* OWNER PORTAL */}
                <button
                  onClick={() => setStep('owner-login')}
                  className="w-full flex items-center gap-4 rounded-3xl border border-slate-800/50 bg-slate-950/40 p-5 text-left transition hover:border-emerald-500/40 hover:bg-emerald-500/5 group cursor-pointer"
                >
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-2xl group-hover:bg-emerald-500/20 group-hover:border-emerald-500/40 transition">
                    <Building className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-white text-sm group-hover:text-emerald-300 transition">Owner Studio</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Manage property assets, tracking, and accounting.</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-emerald-400 transition" />
                </button>

                {/* TENANTS PORTAL */}
                <button
                  onClick={() => setStep('tenant-login')}
                  className="w-full flex items-center gap-4 rounded-3xl border border-slate-800/50 bg-slate-950/40 p-5 text-left transition hover:border-sky-500/40 hover:bg-sky-500/5 group cursor-pointer"
                >
                  <div className="bg-sky-500/10 border border-sky-500/20 p-3.5 rounded-2xl group-hover:bg-sky-500/20 group-hover:border-sky-500/40 transition">
                    <UserCircle2 className="h-6 w-6 text-sky-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-white text-sm group-hover:text-sky-300 transition">Tenants</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Browse listings, review bookings, and check contracts.</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-sky-400 transition" />
                </button>
              </div>

              <button
                onClick={() => setStep('landing')}
                className="mt-6 w-full flex items-center justify-center gap-2 text-slate-500 hover:text-slate-350 transition text-xs font-semibold"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Home</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. OWNER LOGIN STATE */}
      {step === 'owner-login' && (
        <div className="flex-1 flex items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-600/10 blur-[120px] pointer-events-none" />
          
          <div className="w-full max-w-md z-10 animate-fadeIn">
            <div className="flex flex-col items-center mb-8">
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-2xl mb-3 shadow-xl">
                <Building className="h-8 w-8 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-extrabold text-white">Owner Studio Portal</h2>
              <p className="text-slate-500 text-xs uppercase tracking-widest mt-1">Secure Sign In</p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-xl">
              <div className="mb-6">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">Accessing Owner Tools</span>
                <h3 className="text-xl font-bold text-white">Owner Studio Login</h3>
                <p className="text-slate-400 text-xs mt-1">Please enter your host credentials below.</p>
              </div>

              {errorMsg && (
                <div className="mb-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 px-4 py-3 rounded-2xl text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleOwnerSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="yosefmelaku@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={ownerPassword}
                    onChange={(e) => setOwnerPassword(e.target.value)}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 px-4 py-3.5 text-sm font-bold text-white transition-all shadow-lg shadow-emerald-600/10 hover:shadow-emerald-500/25 active:scale-95 cursor-pointer mt-2"
                >
                  <span>Enter Owner Studio</span>
                  <LogIn className="h-4 w-4" />
                </button>
              </form>

              <button
                onClick={() => setStep('portal-select')}
                className="mt-6 w-full flex items-center justify-center gap-2 text-slate-500 hover:text-slate-300 transition text-xs font-semibold"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Portal Selection</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. TENANT LOGIN STATE */}
      {step === 'tenant-login' && (
        <div className="flex-1 flex items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-sky-600/10 blur-[120px] pointer-events-none" />
          
          <div className="w-full max-w-md z-10 animate-fadeIn">
            <div className="flex flex-col items-center mb-8">
              <div className="bg-sky-500/10 border border-sky-500/20 p-3 rounded-2xl mb-3 shadow-xl">
                <UserCircle2 className="h-8 w-8 text-sky-400" />
              </div>
              <h2 className="text-2xl font-extrabold text-white">Tenant Portal</h2>
              <p className="text-slate-500 text-xs uppercase tracking-widest mt-1">Tenant Verification</p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-xl">
              <div className="mb-6">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider block mb-1">Accessing Tenant Stays</span>
                <h3 className="text-xl font-bold text-white">Tenant Login</h3>
                <p className="text-slate-400 text-xs mt-1">Please enter your guest credentials below.</p>
              </div>

              {errorMsg && (
                <div className="mb-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 px-4 py-3 rounded-2xl text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleTenantSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="tenant@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={tenantPassword}
                    onChange={(e) => setTenantPassword(e.target.value)}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-sky-600 hover:bg-sky-500 px-4 py-3.5 text-sm font-bold text-white transition-all shadow-lg shadow-sky-600/10 hover:shadow-sky-500/25 active:scale-95 cursor-pointer mt-2"
                >
                  <span>Enter Tenants Portal</span>
                  <LogIn className="h-4 w-4" />
                </button>
              </form>

              <button
                onClick={() => setStep('portal-select')}
                className="mt-6 w-full flex items-center justify-center gap-2 text-slate-500 hover:text-slate-300 transition text-xs font-semibold"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Portal Selection</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
