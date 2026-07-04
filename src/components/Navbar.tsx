import React from 'react';
import { Home, User, ShieldAlert, KeyRound, Lock, LogOut, Search } from 'lucide-react';
import { AppUser } from '../types';


interface NavbarProps {
  currentTab: 'explore' | 'renter-dashboard' | 'owner-dashboard' | 'super-admin';
  setCurrentTab: (tab: 'explore' | 'renter-dashboard' | 'owner-dashboard' | 'super-admin') => void;
  currentUser: AppUser | null;
  globalSearchTerm: string;
  setGlobalSearchTerm: (value: string) => void;
  onLoginClick: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  globalSearchTerm,
  setGlobalSearchTerm,
  onLoginClick,
  onLogout,
}) => {
  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-xs" id="app-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('explore')}>
              <div className="bg-emerald-600 text-white p-2 rounded-xl shadow-xs" id="nav-logo-box">
                <Home className="h-6 w-6" />
              </div>
              <div>
                <span className="font-sans font-bold text-xl tracking-tight text-gray-900">
                  Rent<span className="text-emerald-600">Hub</span>
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs bg-emerald-50 text-emerald-700 font-mono px-2 py-0.5 rounded-full border border-emerald-100">
                  Enterprise
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 md:hidden">
              {currentUser ? (
                <button type="button" onClick={onLogout} className="rounded-xl border border-gray-200 p-2 text-gray-600 cursor-pointer">
                  <LogOut className="h-4 w-4" />
                </button>
              ) : (
                <button type="button" onClick={onLoginClick} className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs cursor-pointer hover:bg-emerald-500 transition-all">
                  Sign In
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 md:ml-auto">
            <button
              type="button"
              id="tab-btn-explore"
              onClick={() => setCurrentTab('explore')}
              className={`px-4 py-2 rounded-lg border font-sans text-sm font-medium transition-all ${
                currentTab === 'explore'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm'
                  : 'border-gray-200 bg-white text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Browse Properties
            </button>
            <button
              type="button"
              id="tab-btn-renter"
              onClick={() => setCurrentTab('renter-dashboard')}
              className={`px-4 py-2 rounded-lg border font-sans text-sm font-medium transition-all ${
                currentTab === 'renter-dashboard'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm'
                  : 'border-gray-200 bg-white text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              My Bookings
            </button>
            <button
              type="button"
              id="tab-btn-owner"
              onClick={() => setCurrentTab('owner-dashboard')}
              className={`px-4 py-2 rounded-lg border font-sans text-sm font-medium transition-all ${
                currentTab === 'owner-dashboard'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm'
                  : 'border-gray-200 bg-white text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Host Dashboard
            </button>
            <button
              type="button"
              id="tab-btn-super-admin"
              onClick={() => setCurrentTab('super-admin')}
              className={`px-4 py-2 rounded-lg border font-sans text-sm font-medium transition-all ${
                currentTab === 'super-admin'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm'
                  : 'border-gray-200 bg-white text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Super Admin
            </button>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={globalSearchTerm}
                  onChange={(event) => setGlobalSearchTerm(event.target.value)}
                  placeholder="Search listings, city, or amenities"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm text-gray-700 outline-none transition focus:border-emerald-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="hidden md:flex items-center gap-3">
              {currentUser ? (
                <>
                  <button
                    type="button"
                    onClick={onLogout}
                    className="text-xs font-semibold px-3 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 inline-flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                  <div className="flex items-center space-x-2 border-l border-gray-100 pl-3">
                    <div className="bg-gray-100 p-1.5 rounded-full">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="text-left leading-tight">
                      <p className="text-xs font-semibold text-gray-800">{currentUser.name}</p>
                      <p className="text-[10px] text-gray-400 font-mono truncate max-w-[120px]">{currentUser.email}</p>
                    </div>
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  onClick={onLoginClick}
                  className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  Sign In / Register
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="md:hidden flex justify-around border-t border-gray-100 py-2">
          <button
            onClick={() => setCurrentTab('explore')}
            className={`flex flex-col items-center space-y-0.5 text-xs font-medium ${
              currentTab === 'explore' ? 'text-emerald-600' : 'text-gray-500'
            }`}
          >
            <Home className="h-5 w-5" />
            <span>Browse</span>
          </button>
          <button
            onClick={() => setCurrentTab('renter-dashboard')}
            className={`flex flex-col items-center space-y-0.5 text-xs font-medium ${
              currentTab === 'renter-dashboard' ? 'text-emerald-600' : 'text-gray-500'
            }`}
          >
            <KeyRound className="h-5 w-5" />
            <span>Bookings</span>
          </button>
          <button
            onClick={() => setCurrentTab('owner-dashboard')}
            className={`flex flex-col items-center space-y-0.5 text-xs font-medium ${
              currentTab === 'owner-dashboard' ? 'text-emerald-600' : 'text-gray-500'
            }`}
          >
            <ShieldAlert className="h-5 w-5" />
            <span>Hosting</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
