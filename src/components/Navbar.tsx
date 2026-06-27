import React from 'react';
import { Home, User, ShieldAlert, KeyRound } from 'lucide-react';

interface NavbarProps {
  currentTab: 'explore' | 'renter-dashboard' | 'owner-dashboard';
  setCurrentTab: (tab: 'explore' | 'renter-dashboard' | 'owner-dashboard') => void;
  currentUser: { name: string; email: string; role: 'renter' | 'owner' };
  setCurrentUser: (user: { name: string; email: string; role: 'renter' | 'owner' }) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  setCurrentUser,
}) => {
  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-xs" id="app-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Platform Name */}
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

          {/* Tab Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <button
              id="tab-btn-explore"
              onClick={() => setCurrentTab('explore')}
              className={`px-4 py-2 rounded-lg font-sans text-sm font-medium transition-all ${
                currentTab === 'explore'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Browse Properties
            </button>
            <button
              id="tab-btn-renter"
              onClick={() => setCurrentTab('renter-dashboard')}
              className={`px-4 py-2 rounded-lg font-sans text-sm font-medium transition-all ${
                currentTab === 'renter-dashboard'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              My Bookings
            </button>
            <button
              id="tab-btn-owner"
              onClick={() => setCurrentTab('owner-dashboard')}
              className={`px-4 py-2 rounded-lg font-sans text-sm font-medium transition-all ${
                currentTab === 'owner-dashboard'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Host Dashboard
            </button>
          </div>

          {/* User Persona & Mobile Selector */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-gray-50 border border-gray-100 rounded-xl p-1.5" id="user-persona-toggle">
              <span className="text-xs text-gray-500 font-mono px-2 hidden lg:inline">Simulation Persona:</span>
              <button
                id="persona-renter-toggle"
                onClick={() => {
                  setCurrentUser({
                    name: "Yosef Melaku",
                    email: "yosefmelaku9876@gmail.com",
                    role: 'renter'
                  });
                }}
                className={`text-xs px-3 py-1.5 rounded-lg font-sans font-medium transition-all ${
                  currentUser.role === 'renter'
                    ? 'bg-white text-gray-900 shadow-xs border border-gray-200/50 font-semibold'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Guest
              </button>
              <button
                id="persona-owner-toggle"
                onClick={() => {
                  setCurrentUser({
                    name: "Premium Host",
                    email: "host.premium@luxerent.com",
                    role: 'owner'
                  });
                }}
                className={`text-xs px-3 py-1.5 rounded-lg font-sans font-medium transition-all ${
                  currentUser.role === 'owner'
                    ? 'bg-white text-gray-900 shadow-xs border border-gray-200/50 font-semibold'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Host
              </button>
            </div>

            {/* Profile pill */}
            <div className="flex items-center space-x-2 border-l border-gray-100 pl-3 hidden sm:flex">
              <div className="bg-gray-100 p-1.5 rounded-full">
                <User className="h-4 w-4 text-gray-600" />
              </div>
              <div className="text-left leading-tight">
                <p className="text-xs font-semibold text-gray-800">{currentUser.name}</p>
                <p className="text-[10px] text-gray-400 font-mono truncate max-w-[120px]">{currentUser.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Tab bar */}
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
