import { useState, type FormEvent, type FC } from 'react';

interface LoginPageProps {
  onLogin: (user: { name: string; email: string; role: 'renter' | 'owner' }) => void;
}

export const LoginPage: FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'renter' | 'owner'>('renter');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) {
      alert('Please enter your email address to continue.');
      return;
    }

    const name = email.split('@')[0].replace(/[._\-]/g, ' ').replace(/\b\w/g, (match) => match.toUpperCase());
    onLogin({
      name: role === 'owner' ? 'Premium Host' : name,
      email: email.trim(),
      role,
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-10">
      <div className="max-w-4xl w-full bg-slate-900/95 border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden backdrop-blur-sm">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          <div className="px-8 py-10 lg:px-12 lg:py-12 border-b border-white/10 lg:border-b-0 lg:border-r border-white/10">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
                <span className="font-semibold">RentHub</span>
                <span className="text-gray-300">Secure login first</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight">Sign in to search rentals by name, ID, address, and more.</h1>
              <p className="text-sm text-slate-300 leading-relaxed">Start from the login page and quickly find premium listings with powerful search filters. Choose renter or owner access to continue.</p>
            </div>

            <div className="mt-10 rounded-3xl border border-white/10 bg-slate-950/90 p-6 shadow-lg shadow-black/10">
              <form onSubmit={handleSubmit} className="space-y-5">
                <label className="block text-sm font-medium text-slate-300">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                />

                <label className="block text-sm font-medium text-slate-300">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                />

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('renter')}
                    className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      role === 'renter'
                        ? 'bg-emerald-500 text-slate-950 shadow-sm'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Renter
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('owner')}
                    className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      role === 'owner'
                        ? 'bg-emerald-500 text-slate-950 shadow-sm'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Owner
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
                >
                  Continue as {role === 'owner' ? 'Host' : 'Renter'}
                </button>
              </form>
            </div>
          </div>

          <div className="px-8 py-10 lg:px-12 lg:py-12 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.15),_transparent_45%)] text-slate-100">
            <div className="space-y-6">
              <div>
                <span className="text-xs uppercase tracking-[0.3em] text-emerald-300">Fast search built in</span>
                <h2 className="mt-4 text-2xl font-bold">Search smarter from the first page.</h2>
              </div>
              <ul className="space-y-4 text-sm text-slate-300">
                <li className="flex gap-3 items-start">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
                  Search by property name, city, or exact address.
                </li>
                <li className="flex gap-3 items-start">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
                  Use listing IDs, property types, or amenity tags.
                </li>
                <li className="flex gap-3 items-start">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
                  Access renter or owner dashboards instantly after login.
                </li>
              </ul>
            </div>
            <div className="mt-10 rounded-3xl border border-white/10 bg-slate-950/80 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">Pro tip</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">Enter your email and password, choose your role, then explore the full property search experience with filtering by name, location, ID, type, and amenities.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
