import React, { useState } from 'react';
import {
  X, Check, Info, Home, FileText, DollarSign, Users, Shield, Wrench, PenTool,
  Monitor, ChevronDown
} from 'lucide-react';

interface UpgradePageProps {
  onClose: () => void;
}

export const UpgradePage: React.FC<UpgradePageProps> = ({ onClose }) => {
  const trialStartKey = 'renthub_trial_start';
  const [units, setUnits] = useState(3);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');
  const [showFullFeatures, setShowFullFeatures] = useState(false);
  const [upgradedPlan, setUpgradedPlan] = useState<string | null>(null);
  const [trialDaysLeft] = useState(() => {
    const stored = localStorage.getItem(trialStartKey);
    const startDate = stored ? new Date(stored) : new Date();
    if (!stored) localStorage.setItem(trialStartKey, startDate.toISOString());
    const elapsed = Math.floor((Date.now() - startDate.getTime()) / 86400000);
    return Math.max(0, 14 - elapsed);
  });

  const handleUpgrade = (plan: string) => {
    setUpgradedPlan(plan);
    localStorage.removeItem(trialStartKey);
    setTimeout(() => setUpgradedPlan(null), 3000);
  };

  const discount = billingCycle === 'annually' ? 0.8 : 1;
  const proPriceMonthly = 12;
  const proPlusPriceMonthly = 28;

  const solutionsFeatures = [
    { icon: <DollarSign className="h-4 w-4" />, label: 'Rental accounting' },
    { icon: <FileText className="h-4 w-4" />, label: 'Tax reporting' },
    { icon: <DollarSign className="h-4 w-4" />, label: 'Collect rent' },
    { icon: <Home className="h-4 w-4" />, label: 'Find tenants' },
    { icon: <Shield className="h-4 w-4" />, label: 'Tenant screening' },
    { icon: <Wrench className="h-4 w-4" />, label: 'Property maintenance' },
    { icon: <PenTool className="h-4 w-4" />, label: 'Electronic signatures' },
  ];

  const features = [
    {
      label: "Who's it for?",
      go: 'New landlords managing 1–3 units, listing properties manually, and tracking finances in spreadsheets',
      pro: 'Growing landlords managing multiple units who want to automate accounting and reporting',
      proplus: 'Portfolio landlords & property managers needing advanced automation, multi-user access, and dedicated account manager',
    },
    {
      label: 'Best for',
      go: 'Trying out property management software',
      pro: 'Growing & optimizing rental income',
      proplus: 'Streamlining & scaling investments',
    },
    { label: 'Properties',           go: 'Up to 3',  pro: 'Unlimited',              proplus: 'Unlimited'                },
    { label: 'Tenants',              go: 'Up to 3',  pro: 'Unlimited',              proplus: 'Unlimited'                },
    { label: 'Leases',               go: 'Up to 3',  pro: 'Unlimited',              proplus: 'Unlimited'                },
    { label: 'Accounting & reports', go: 'Basic',     pro: 'Advanced',               proplus: 'Advanced + Automation'    },
    { label: 'Maintenance tracking', go: '✓',         pro: '✓',                      proplus: '✓ + Contractor portal'    },
    { label: 'Tenant portal',        go: '✓',         pro: '✓',                      proplus: '✓'                        },
    { label: 'Online rent payments', go: '—',          pro: '✓',                      proplus: '✓'                        },
    { label: 'Multi-user access',    go: '—',          pro: '—',                       proplus: '✓'                        },
    { label: 'Dedicated account manager', go: '—',    pro: '—',                       proplus: '✓'                        },
    { label: 'Priority support',     go: '—',          pro: 'Email',                  proplus: 'Phone & Email'            },
  ];

  return (
    <div className="fixed inset-0 z-[9999] bg-white overflow-y-auto flex flex-col" style={{ top: 0, left: 0, right: 0, bottom: 0 }}>

      {/* Orange trial banner */}
      {trialDaysLeft > 0 ? (
        <div className="bg-[#ff9f00] text-white py-2 px-4 text-xs font-bold text-center flex items-center justify-center gap-1.5 shrink-0">
          <Info className="h-4 w-4 fill-white text-[#ff9f00]" />
          <span>Trial ends in {trialDaysLeft} {trialDaysLeft === 1 ? 'day' : 'days'}. <span className="underline cursor-pointer" onClick={onClose}>Upgrade Now</span></span>
        </div>
      ) : (
        <div className="bg-rose-600 text-white py-2 px-4 text-xs font-bold text-center flex items-center justify-center gap-1.5 shrink-0">
          <Info className="h-4 w-4 fill-white text-rose-600" />
          <span>Trial expired. <span className="underline cursor-pointer" onClick={onClose}>Upgrade Now</span></span>
        </div>
      )}

      {/* Nav bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="bg-emerald-500 text-white p-1.5 rounded-lg">
              <Home className="h-4 w-4" />
            </div>
            <span className="font-extrabold text-slate-900 text-base tracking-tight">RentHub</span>
          </div>
          <nav className="hidden md:flex items-center gap-5 text-sm font-semibold">
            <button className="text-emerald-600 hover:text-emerald-700 transition flex items-center gap-1">
              Solutions <ChevronDown className="h-3 w-3" />
            </button>
            <button className="text-slate-900 font-bold hover:text-emerald-600 transition underline underline-offset-4 decoration-2 decoration-emerald-500">Pricing</button>
            <button className="text-slate-600 hover:text-slate-900 transition">Reviews</button>
            <button className="text-slate-600 hover:text-slate-900 transition">How it works</button>
            <button className="text-slate-600 hover:text-slate-900 transition flex items-center gap-1">
              Education <ChevronDown className="h-3 w-3" />
            </button>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition hidden sm:block">Log in</button>
          <button
            onClick={onClose}
            className="bg-[#ff445a] hover:bg-[#e63046] text-white text-sm font-bold px-5 py-2 rounded-lg transition cursor-pointer"
          >
            Get started
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer md:hidden"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Upgrade success toast */}
      {upgradedPlan && (
        <div className="max-w-5xl mx-auto w-full px-4 mt-4">
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800 flex items-center gap-2 shadow-sm">
            <Check className="h-4 w-4 text-emerald-600" />
            Upgraded to <strong>{upgradedPlan}</strong> successfully! Your new features are now active.
          </div>
        </div>
      )}

      {/* ==================== HERO SECTION ==================== */}
      <div className="bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto w-full px-6 py-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left Column: Title, Features, CTA */}
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-black text-[#0b1a30] leading-tight tracking-tight">
                Choose the right plan for your portfolio
              </h1>
              <p className="text-slate-500 text-sm md:text-base leading-relaxed max-w-md">
                Trusted by <strong className="text-slate-800">80,000+ independent landlords</strong>. Whether you're new to property management or looking to grow your rental portfolio.
              </p>

              <button
                onClick={() => {
                  const pricingSection = document.getElementById('pricing-plans-section');
                  pricingSection?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-[#ff445a] hover:bg-[#e63046] text-white font-bold text-sm px-7 py-3.5 rounded-lg shadow-md transition cursor-pointer inline-flex items-center gap-2"
              >
                Get started for free
              </button>

              {/* Solutions feature list */}
              <div className="pt-4 space-y-3">
                {solutionsFeatures.map((feature) => (
                  <div key={feature.label} className="flex items-center gap-3 text-slate-600 text-sm">
                    <span className="text-slate-400">{feature.icon}</span>
                    <span className="font-medium">{feature.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Demo Preview + House Illustration */}
            <div className="relative hidden lg:flex items-center justify-center">
              {/* Dashboard mockup */}
              <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
                <div className="bg-slate-100 px-3 py-2 flex items-center gap-1.5 border-b border-slate-200">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                <div className="p-4 space-y-3">
                  {/* Mini dashboard widgets */}
                  <div className="flex gap-2">
                    <div className="flex-1 bg-slate-50 border border-slate-100 rounded-lg p-2.5">
                      <div className="text-[8px] font-bold text-slate-400 uppercase">Revenue</div>
                      <div className="text-sm font-extrabold text-slate-800 mt-1">$24,680</div>
                      <div className="mt-1.5 flex gap-0.5 items-end h-8">
                        {[40, 55, 35, 70, 60, 85, 75].map((h, i) => (
                          <div key={i} className="flex-1 bg-blue-500 rounded-t-sm" style={{ height: `${h}%` }} />
                        ))}
                      </div>
                    </div>
                    <div className="flex-1 bg-slate-50 border border-slate-100 rounded-lg p-2.5">
                      <div className="text-[8px] font-bold text-slate-400 uppercase">Occupancy</div>
                      <div className="text-sm font-extrabold text-emerald-600 mt-1">92%</div>
                      <div className="mt-1.5 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '92%' }} />
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-blue-500" />
                    <div>
                      <div className="text-[9px] font-bold text-slate-700">See it in action</div>
                      <div className="text-[8px] text-slate-400">Watch the RentHub demo</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* House illustration (bottom-right) */}
              <div className="absolute -bottom-8 -right-4 w-32">
                <svg viewBox="0 0 160 130" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Ground */}
                  <ellipse cx="80" cy="125" rx="75" ry="8" fill="#d1fae5" />
                  {/* House body */}
                  <rect x="35" y="55" width="90" height="70" rx="4" fill="#0f4c81" />
                  {/* Roof */}
                  <polygon points="25,58 80,15 135,58" fill="#0b3a63" />
                  {/* Door */}
                  <rect x="68" y="85" width="22" height="40" rx="2" fill="#1e6fb5" />
                  {/* Door knob */}
                  <circle cx="85" cy="107" r="2" fill="#fbbf24" />
                  {/* Windows */}
                  <rect x="43" y="68" width="18" height="14" rx="1" fill="#93c5fd" opacity="0.8" />
                  <rect x="43" y="68" width="18" height="14" rx="1" stroke="#60a5fa" strokeWidth="0.5" />
                  <line x1="52" y1="68" x2="52" y2="82" stroke="#60a5fa" strokeWidth="0.5" />
                  <line x1="43" y1="75" x2="61" y2="75" stroke="#60a5fa" strokeWidth="0.5" />
                  <rect x="97" y="68" width="18" height="14" rx="1" fill="#93c5fd" opacity="0.8" />
                  <rect x="97" y="68" width="18" height="14" rx="1" stroke="#60a5fa" strokeWidth="0.5" />
                  <line x1="106" y1="68" x2="106" y2="82" stroke="#60a5fa" strokeWidth="0.5" />
                  <line x1="97" y1="75" x2="115" y2="75" stroke="#60a5fa" strokeWidth="0.5" />
                  {/* Tree */}
                  <rect x="140" y="80" width="6" height="45" rx="2" fill="#92400e" />
                  <circle cx="143" cy="65" r="20" fill="#10b981" />
                  <circle cx="133" cy="72" r="14" fill="#059669" />
                  <circle cx="153" cy="72" r="14" fill="#059669" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== PRICING SECTION ==================== */}
      <div className="bg-[#eef2f7] py-14" id="pricing-plans-section">
        <div className="max-w-6xl mx-auto w-full px-6 space-y-8">

          {/* Unit counter + Billing toggle row */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Unit counter */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-slate-800">No. of property units</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setUnits(u => Math.max(1, u - 1))}
                  className="w-9 h-9 rounded-lg border border-slate-300 bg-white text-slate-700 font-bold text-lg flex items-center justify-center hover:bg-slate-50 cursor-pointer transition"
                >
                  −
                </button>
                <span className="w-12 h-9 rounded-lg border border-slate-300 bg-white text-center text-sm font-bold text-slate-900 flex items-center justify-center">
                  {units}
                </span>
                <button
                  onClick={() => setUnits(u => u + 1)}
                  className="w-9 h-9 rounded-lg border border-slate-300 bg-white text-slate-700 font-bold text-lg flex items-center justify-center hover:bg-slate-50 cursor-pointer transition"
                >
                  +
                </button>
              </div>
            </div>

            {/* Monthly / Annually toggle */}
            <div className="flex items-center">
              <div className="bg-white border border-slate-200 rounded-xl flex overflow-hidden shadow-sm">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-5 py-2.5 text-sm font-bold transition cursor-pointer ${
                    billingCycle === 'monthly'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'bg-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('annually')}
                  className={`px-5 py-2.5 text-sm font-bold transition cursor-pointer flex items-center gap-2 ${
                    billingCycle === 'annually'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'bg-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Annually
                  <span className="bg-[#ff445a] text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Save 20%
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Pricing cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">

            {/* Go — Free / Current */}
            <div className="bg-white border border-slate-200 rounded-l-2xl md:rounded-l-2xl md:rounded-r-none rounded-2xl md:rounded-2xl-none p-8 flex flex-col gap-5 relative">
              <div>
                <h3 className="text-2xl font-black text-slate-900 italic">Go</h3>
                <div className="flex items-end gap-1 mt-3">
                  <p className="text-4xl font-extrabold text-slate-900">Free</p>
                </div>
                <p className="text-sm text-slate-500 mt-3 leading-relaxed">
                  Perfect for new landlords managing 1–3 units.
                </p>
              </div>
              <button
                disabled
                className="w-full bg-slate-100 text-slate-400 font-bold text-sm py-3 rounded-xl cursor-not-allowed"
              >
                Current plan
              </button>
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2.5 text-sm text-slate-600">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Up to 3 properties</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-600">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Basic accounting & reports</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-600">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Maintenance tracking</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-600">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Tenant portal</span>
                </div>
              </div>
            </div>

            {/* Pro — Most Popular */}
            <div className="bg-[#0b2545] text-white rounded-2xl p-8 flex flex-col gap-5 relative shadow-2xl z-10 md:-my-4">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="bg-[#ff445a] text-white text-[10px] font-extrabold uppercase tracking-widest px-5 py-1.5 rounded-full shadow-lg">
                  Most Popular
                </span>
              </div>
              <div>
                <h3 className="text-2xl font-black italic text-white mt-2">Pro</h3>
                <div className="flex items-end gap-1 mt-3">
                  <p className="text-4xl font-extrabold text-white">
                    ${(proPriceMonthly * discount).toFixed(2)}
                  </p>
                  <span className="text-blue-300 text-sm mb-1">/mo</span>
                </div>
                {billingCycle === 'annually' && (
                  <p className="text-xs text-blue-300 mt-1 line-through">${proPriceMonthly.toFixed(2)}/mo</p>
                )}
                <p className="text-sm text-blue-200/70 mt-3 leading-relaxed">
                  For growing landlords who want to automate accounting and reporting.
                </p>
              </div>
              <button
                onClick={() => handleUpgrade('Pro')}
                className="w-full bg-[#ff445a] hover:bg-[#e63046] text-white font-bold text-sm py-3 rounded-xl cursor-pointer transition shadow-lg"
              >
                Upgrade to Pro
              </button>
              <div className="space-y-3 pt-2 border-t border-white/10">
                <div className="flex items-center gap-2.5 text-sm text-blue-100">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Unlimited properties</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-blue-100">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Advanced accounting & reports</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-blue-100">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Online rent payments</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-blue-100">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Email priority support</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-blue-100">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Everything in Go</span>
                </div>
              </div>
            </div>

            {/* Pro Plus — Best Value */}
            <div className="bg-[#0f172a] text-white rounded-r-2xl md:rounded-r-2xl md:rounded-l-none rounded-2xl md:rounded-2xl-none p-8 flex flex-col gap-5 relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="bg-slate-700 text-white text-[10px] font-extrabold uppercase tracking-widest px-5 py-1.5 rounded-full">
                  Best Value
                </span>
              </div>
              <div>
                <h3 className="text-2xl font-black italic text-white mt-2">Pro Plus</h3>
                <div className="flex items-end gap-1 mt-3">
                  <p className="text-4xl font-extrabold text-white">
                    ${(proPlusPriceMonthly * discount).toFixed(2)}
                  </p>
                  <span className="text-slate-400 text-sm mb-1">/mo</span>
                </div>
                {billingCycle === 'annually' && (
                  <p className="text-xs text-slate-400 mt-1 line-through">${proPlusPriceMonthly.toFixed(2)}/mo</p>
                )}
                <p className="text-sm text-slate-400 mt-3 leading-relaxed">
                  For portfolio landlords & property managers needing advanced automation.
                </p>
              </div>
              <button
                onClick={() => handleUpgrade('Pro Plus')}
                className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm py-3 rounded-xl cursor-pointer transition"
              >
                Upgrade to Pro Plus
              </button>
              <div className="space-y-3 pt-2 border-t border-white/10">
                <div className="flex items-center gap-2.5 text-sm text-slate-300">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Unlimited properties</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-300">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Advanced + Automated reports</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-300">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Multi-user access</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-300">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Dedicated account manager</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-300">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Phone & email priority support</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-300">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Everything in Pro</span>
                </div>
              </div>
            </div>
          </div>

          {/* Full plan features accordion */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
            <button
              onClick={() => setShowFullFeatures(v => !v)}
              className="w-full flex items-center justify-center gap-2 py-4 text-sm font-semibold text-slate-700 hover:text-slate-900 cursor-pointer transition"
            >
              Full plan features comparison
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showFullFeatures ? 'rotate-180' : ''}`} />
            </button>

            {showFullFeatures && (
              <div className="border-t border-slate-200 bg-white">
                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left px-6 py-4 text-slate-500 font-semibold w-1/4" />
                        <th className="px-4 py-4 text-center w-1/4">
                          <p className="font-semibold text-slate-700">Go</p>
                          <p className="text-xs text-slate-400 mt-0.5">Free</p>
                          <button disabled className="mt-3 w-full bg-slate-100 text-slate-400 text-xs font-bold py-2 rounded-lg cursor-not-allowed">
                            Current Plan
                          </button>
                        </th>
                        <th className="px-4 py-4 text-center w-1/4 bg-blue-50">
                          <p className="font-bold text-blue-700">Pro</p>
                          <p className="text-xs text-slate-500 mt-0.5">${(proPriceMonthly * discount).toFixed(2)}/mo</p>
                          <button onClick={() => handleUpgrade('Pro')} className="mt-3 w-full bg-[#ff445a] hover:bg-[#e63046] text-white text-xs font-bold py-2 rounded-lg cursor-pointer transition">
                            Upgrade to Pro
                          </button>
                        </th>
                        <th className="px-4 py-4 text-center w-1/4">
                          <p className="font-bold text-slate-800">Pro Plus</p>
                          <p className="text-xs text-slate-500 mt-0.5">${(proPlusPriceMonthly * discount).toFixed(2)}/mo</p>
                          <button onClick={() => handleUpgrade('Pro Plus')} className="mt-3 w-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-2 rounded-lg cursor-pointer transition">
                            Upgrade to Pro Plus
                          </button>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {features.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50/60">
                          <td className="px-6 py-4 font-medium text-slate-700 text-sm">{row.label}</td>
                          <td className="px-4 py-4 text-center text-slate-500 text-xs align-top">{row.go}</td>
                          <td className="px-4 py-4 text-center text-slate-700 text-xs bg-blue-50/30 align-top">{row.pro}</td>
                          <td className="px-4 py-4 text-center text-slate-700 text-xs align-top">{row.proplus}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-slate-100 py-6 text-center">
        <p className="text-xs text-slate-400">© 2026 RentHub · Cloud Managed Rental Suite · All rights reserved</p>
      </div>
    </div>
  );
};
