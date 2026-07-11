import React, { useState, useMemo } from 'react';
import { PropertyListing, Booking, AppUser } from '../types';
import { 
  TrendingUp, DollarSign, CalendarCheck2, LayoutGrid, PlusCircle, CheckCircle, XCircle, 
  Trash2, Image, Sparkles, Building, Bed, Bath, Plus, MapPin, RefreshCw, Upload, Wrench,
  AlertTriangle, Clock3, Percent, Calendar, Users, ArrowUpRight, PieChart, ChevronDown, 
  Bell, Lightbulb, Menu, LogOut, FileText, Briefcase, Settings, Landmark, ShieldCheck,
  Home, UserCircle2
} from 'lucide-react';

interface OwnerDashboardProps {
  listings: PropertyListing[];
  bookings: Booking[];
  onCreateListing: (listingData: Omit<PropertyListing, 'id' | 'rating' | 'reviewsCount'>) => Promise<PropertyListing>;
  onDeleteListing: (listingId: string) => Promise<void>;
  onUpdateBookingStatus: (bookingId: string, status: Booking['status']) => Promise<void>;
  loading: boolean;
  onRefresh: () => void;
  currentUser: AppUser | null;
  onLogout: () => void;
  onSwitchToTenant: () => void;
}

type SubTab = 'stats' | 'listings' | 'bookings' | 'add' | 'maintenance' | 'organisation' | 'reports' | 'integrations' | 'contacts' | 'more';

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({
  listings,
  bookings,
  onCreateListing,
  onDeleteListing,
  onUpdateBookingStatus,
  loading,
  onRefresh,
  currentUser,
  onLogout,
  onSwitchToTenant
}) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('stats');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Form State for Adding Property
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'house' | 'apartment' | 'villa' | 'studio'>('apartment');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState<number>(150);
  const [beds, setBeds] = useState<number>(2);
  const [baths, setBaths] = useState<number>(2);
  const [imageUrl, setImageUrl] = useState('');
  const [customAmenity, setCustomAmenity] = useState('');
  const [amenities, setAmenities] = useState<string[]>(['Fast Wi-Fi', 'AC', 'Workspace']);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  // Maintenance Alerts
  const [maintenanceRequests, setMaintenanceRequests] = useState([
    { id: 'req-101', property: 'Cliffside Villa', guest: 'Talia S.', issue: 'HVAC cooling sporadic after midnight', priority: 'high', status: 'Open', updatedAt: '12 min ago' },
    { id: 'req-102', property: 'Harbor Loft', guest: 'Mina K.', issue: 'Smart lock battery warning', priority: 'medium', status: 'In Review', updatedAt: '37 min ago' },
    { id: 'req-103', property: 'Skyline Residence', guest: 'Noah R.', issue: 'Kitchen appliance not responding', priority: 'high', status: 'Resolved', updatedAt: '1 hr ago' },
  ]);

  const PRESET_IMAGES = [
    { name: "Modern Villa", url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80" },
    { name: "Nordic House", url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80" },
    { name: "Chic Penthouse", url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80" },
    { name: "Minimalist Loft", url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80" }
  ];

  // Owner filter details
  const ownerListings = useMemo(() => {
    return listings.filter(l => l.ownerId === 'owner_default' || l.ownerId === currentUser?.email);
  }, [listings, currentUser]);

  const ownerListingIds = useMemo(() => {
    return new Set(ownerListings.map(l => l.id));
  }, [ownerListings]);

  const ownerBookings = useMemo(() => {
    return bookings.filter(b => ownerListingIds.has(b.listingId));
  }, [bookings, ownerListingIds]);

  const stats = useMemo(() => {
    const totalEarnings = ownerBookings
      .filter(b => b.paymentStatus === 'paid' && b.status !== 'declined' && b.status !== 'cancelled')
      .reduce((sum, b) => sum + b.totalPrice, 0);

    const approvedCount = ownerBookings.filter(b => b.status === 'approved').length;
    const totalCount = ownerBookings.length;
    const occupancyRate = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;

    return {
      totalEarnings,
      occupancyRate,
      totalBookings: totalCount,
      activeListingsCount: ownerListings.length
    };
  }, [ownerBookings, ownerListings]);

  const dispatchSummary = useMemo(() => {
    const openCount = maintenanceRequests.filter(r => r.status === 'Open').length;
    const reviewCount = maintenanceRequests.filter(r => r.status === 'In Review').length;
    const resolvedCount = maintenanceRequests.filter(r => r.status === 'Resolved').length;
    return { openCount, reviewCount, resolvedCount };
  }, [maintenanceRequests]);

  const handleAddAmenity = () => {
    if (customAmenity.trim() && !amenities.includes(customAmenity.trim())) {
      setAmenities([...amenities, customAmenity.trim()]);
      setCustomAmenity('');
    }
  };

  const handleRemoveAmenity = (name: string) => {
    setAmenities(amenities.filter(a => a !== name));
  };

  const handleMaintenanceStatusChange = (requestId: string, nextStatus: string) => {
    setMaintenanceRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: nextStatus } : r));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !location.trim() || !imageUrl.trim()) {
      setFormError('Please fill out all mandatory fields (Title, Description, Location, Image URL)');
      return;
    }
    if (price <= 0) {
      setFormError('Price must be greater than $0');
      return;
    }

    setFormError('');
    try {
      await onCreateListing({
        title,
        description,
        type,
        location,
        price,
        beds,
        baths,
        image: imageUrl,
        amenities,
        ownerId: currentUser?.email ?? 'owner_default'
      });
      
      setFormSuccess(true);
      setTitle('');
      setDescription('');
      setLocation('');
      setPrice(150);
      setBeds(2);
      setBaths(2);
      setImageUrl('');
      setAmenities(['Fast Wi-Fi', 'AC', 'Workspace']);
      
      setTimeout(() => {
        setFormSuccess(false);
        setActiveSubTab('listings');
      }, 1500);
    } catch (err) {
      setFormError('Failed to publish listing. Please try again.');
    }
  };

  // Helper calculations for User Info
  const initials = useMemo(() => {
    if (!currentUser?.name) return 'yM';
    const parts = currentUser.name.split(' ');
    if (parts.length >= 2) {
      // Lowercase first, uppercase second to mimic "yM"
      return `${parts[0][0].toLowerCase()}${parts[1][0].toUpperCase()}`;
    }
    return currentUser.name.substring(0, 2).toLowerCase();
  }, [currentUser]);

  const firstName = useMemo(() => {
    if (!currentUser?.name) return 'yosef';
    return currentUser.name.split(' ')[0].toLowerCase();
  }, [currentUser]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans" id="owner-portal-layout">
      
      {/* 1. TOP ORANGE ALERT BAR */}
      <div className="bg-[#f59e0b] text-white py-2.5 px-6 text-center text-xs font-bold flex items-center justify-center gap-2 shadow-sm shrink-0 select-none">
        <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0" />
        <span>Trial ends in 7 days.</span>
        <button className="underline hover:text-slate-100 font-extrabold cursor-pointer ml-1">Upgrade Now</button>
      </div>

      {/* 2. BODY CONTAINER */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* SIDEBAR NAVIGATION (Dark Blue) */}
        <aside className="w-64 bg-[#0b1a30] text-slate-300 flex flex-col shrink-0 border-r border-slate-900 shadow-xl relative z-20">
          {/* Sidebar Brand header */}
          <div className="p-6 border-b border-slate-900 flex items-center gap-3 bg-[#0a1526]">
            <div className="bg-emerald-500 text-white p-2 rounded-xl">
              <Home className="h-5 w-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-white tracking-wide block uppercase leading-none">RentHub</span>
              <span className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase">Studio Portal</span>
            </div>
          </div>

          {/* Sidebar Menu items */}
          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            <button
              onClick={() => setActiveSubTab('stats')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition cursor-pointer text-left ${
                activeSubTab === 'stats' 
                  ? 'bg-emerald-600/10 border border-emerald-500/20 text-emerald-400' 
                  : 'hover:bg-slate-800/40 text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="h-4.5 w-4.5 shrink-0" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveSubTab('organisation')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition cursor-pointer text-left ${
                activeSubTab === 'organisation' 
                  ? 'bg-emerald-600/10 border border-emerald-500/20 text-emerald-400' 
                  : 'hover:bg-slate-800/40 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Briefcase className="h-4.5 w-4.5 shrink-0" />
              <span>Organisation</span>
            </button>

            <button
              onClick={() => setActiveSubTab('listings')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition cursor-pointer text-left ${
                activeSubTab === 'listings' || activeSubTab === 'add'
                  ? 'bg-emerald-600/10 border border-emerald-500/20 text-emerald-400' 
                  : 'hover:bg-slate-800/40 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building className="h-4.5 w-4.5 shrink-0" />
              <span>Properties</span>
            </button>

            <button
              onClick={() => setActiveSubTab('reports')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition cursor-pointer text-left ${
                activeSubTab === 'reports' 
                  ? 'bg-emerald-600/10 border border-emerald-500/20 text-emerald-400' 
                  : 'hover:bg-slate-800/40 text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="h-4.5 w-4.5 shrink-0" />
              <span>Reports</span>
            </button>

            <button
              onClick={() => setActiveSubTab('bookings')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition cursor-pointer text-left ${
                activeSubTab === 'bookings' 
                  ? 'bg-emerald-600/10 border border-emerald-500/20 text-emerald-400' 
                  : 'hover:bg-slate-800/40 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="h-4.5 w-4.5 shrink-0" />
              <span>Find Tenants</span>
            </button>

            <button
              onClick={() => setActiveSubTab('integrations')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition cursor-pointer text-left ${
                activeSubTab === 'integrations' 
                  ? 'bg-emerald-600/10 border border-emerald-500/20 text-emerald-400' 
                  : 'hover:bg-slate-800/40 text-slate-400 hover:text-slate-200'
              }`}
            >
              <RefreshCw className="h-4.5 w-4.5 shrink-0" />
              <span>Integrations</span>
            </button>

            <button
              onClick={() => setActiveSubTab('maintenance')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition cursor-pointer text-left ${
                activeSubTab === 'maintenance' 
                  ? 'bg-emerald-600/10 border border-emerald-500/20 text-emerald-400' 
                  : 'hover:bg-slate-800/40 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Wrench className="h-4.5 w-4.5 shrink-0" />
              <span>Maintenance</span>
            </button>

            <button
              onClick={() => setActiveSubTab('contacts')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition cursor-pointer text-left ${
                activeSubTab === 'contacts' 
                  ? 'bg-emerald-600/10 border border-emerald-500/20 text-emerald-400' 
                  : 'hover:bg-slate-800/40 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="h-4.5 w-4.5 shrink-0" />
              <span>Contacts</span>
            </button>

            <button
              onClick={() => setActiveSubTab('more')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition cursor-pointer text-left ${
                activeSubTab === 'more' 
                  ? 'bg-emerald-600/10 border border-emerald-500/20 text-emerald-400' 
                  : 'hover:bg-slate-800/40 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Settings className="h-4.5 w-4.5 shrink-0" />
              <span>More</span>
            </button>
          </nav>

          {/* Quick Stats shortcut */}
          <div className="p-4 m-4 bg-slate-900/60 rounded-2xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Status</span>
            <div className="flex justify-between text-xs font-medium text-slate-300">
              <span>Database URL</span>
              <span className="text-emerald-500 font-mono text-[10px]">Connected</span>
            </div>
          </div>
        </aside>

        {/* WORKSPACE AREA (Left Content) */}
        <div className="flex-grow flex flex-col overflow-y-auto">
          
          {/* TOP NAVBAR CONTAINER */}
          <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-xs">
            <div className="flex items-center gap-4">
              <button className="text-slate-500 hover:text-slate-800 md:hidden">
                <Menu className="h-5 w-5" />
              </button>
              {/* Quick database refresh indicator */}
              <button 
                onClick={onRefresh} 
                className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1.5 cursor-pointer"
                title="Sync database status"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Sync Cloud</span>
              </button>
            </div>

            {/* Topbar User dropdown */}
            <div className="flex items-center gap-4 relative">
              <button className="text-slate-400 hover:text-slate-600 transition">
                <Calendar className="h-4.5 w-4.5" />
              </button>
              <button className="text-slate-400 hover:text-slate-600 transition">
                <Bell className="h-4.5 w-4.5" />
              </button>
              <button className="text-slate-400 hover:text-slate-600 transition">
                <Lightbulb className="h-4.5 w-4.5" />
              </button>

              <div className="h-5 w-px bg-slate-200"></div>

              {/* Profile drop trigger */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 hover:bg-slate-50 px-2 py-1.5 rounded-xl transition cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs select-none">
                    {initials}
                  </div>
                  <span className="hidden sm:inline-block text-xs font-bold text-slate-800 font-sans">
                    {currentUser?.name ?? 'yosef Melaku'}
                  </span>
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-50">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Signed in as</p>
                      <p className="text-xs font-bold text-slate-800 truncate mt-0.5">{currentUser?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onSwitchToTenant();
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-emerald-600 font-semibold flex items-center gap-2 cursor-pointer"
                    >
                      <UserCircle2 className="h-4 w-4" />
                      <span>Switch to Tenant View</span>
                    </button>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 font-semibold flex items-center gap-2 border-t border-slate-100 cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* MAIN WORKSPACE WRAPPER */}
          <main className="p-6 md:p-8 flex-grow">

            {/* TAB: DASHBOARD STATS WIDGETS */}
            {activeSubTab === 'stats' && (
              <div className="space-y-6 animate-fadeIn" id="owner-stats-portal-view">
                
                {/* Dashboard Title & Dropdown controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 capitalize">
                      Hello {firstName},
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">Here is your property portfolio dashboard overview.</p>
                  </div>

                  {/* Dropdowns */}
                  <div className="flex items-center gap-2">
                    <button className="bg-slate-100 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 flex items-center gap-2 hover:bg-slate-200 transition">
                      <span>Portfolio</span>
                      <ChevronDown className="h-3 w-3 text-slate-400" />
                    </button>
                    <button className="bg-slate-100 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 flex items-center gap-2 hover:bg-slate-200 transition">
                      <span>Properties</span>
                      <ChevronDown className="h-3 w-3 text-slate-400" />
                    </button>
                    <button className="bg-slate-100 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition">
                      Categories
                    </button>
                  </div>
                </div>

                {/* Key Metrics row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Rent Received */}
                  <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-xs relative overflow-hidden group">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">Rent received</span>
                    </div>
                    <div className="mt-5 flex items-center gap-3.5">
                      <div className="bg-emerald-500/10 text-emerald-600 p-3 rounded-full border border-emerald-500/20 shrink-0">
                        <Home className="h-6 w-6" />
                      </div>
                      <p className="text-3xl font-black text-slate-900">USD {stats.totalEarnings.toFixed(2)}</p>
                    </div>
                    <div className="mt-5 pt-4 border-t border-slate-50 flex items-center justify-between text-xs">
                      <span className="text-slate-400">USD {stats.totalEarnings.toFixed(0)} Received last month</span>
                    </div>
                  </div>

                  {/* Upcoming Payments */}
                  <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-xs relative overflow-hidden group">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">Upcoming payments</span>
                    </div>
                    <div className="mt-5 flex items-center gap-3.5">
                      <div className="bg-blue-500/10 text-blue-600 p-3 rounded-full border border-blue-500/20 shrink-0">
                        <Calendar className="h-6 w-6" />
                      </div>
                      <p className="text-3xl font-black text-slate-900">USD 0.00</p>
                    </div>
                    <div className="mt-5 pt-4 border-t border-slate-50 flex items-center justify-between text-xs">
                      <span className="text-slate-400">0 payment</span>
                    </div>
                  </div>

                  {/* Rent Overdue */}
                  <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-xs relative overflow-hidden group">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">Rent overdue</span>
                    </div>
                    <div className="mt-5 flex items-center gap-3.5">
                      <div className="bg-rose-500/10 text-rose-600 p-3 rounded-full border border-rose-500/20 shrink-0">
                        <Clock3 className="h-6 w-6" />
                      </div>
                      <p className="text-3xl font-black text-rose-600">USD 0.00</p>
                    </div>
                    <div className="mt-5 pt-4 border-t border-slate-50 flex items-center justify-between text-xs">
                      <span className="text-slate-400">0 overdue</span>
                    </div>
                  </div>
                </div>

                {/* Cashflow & Calendar Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Cashflow Graphic Widget */}
                  <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-xs lg:col-span-2 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
                      <div>
                        <h3 className="text-sm font-extrabold flex items-center gap-2 text-slate-800">
                          <TrendingUp className="h-4.5 w-4.5 text-emerald-500" />
                          <span>Cashflow</span>
                        </h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">Overview of operational income & expenses.</p>
                      </div>
                      
                      {/* Date values */}
                      <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-3.5 py-1.5 rounded-2xl text-xs font-bold text-slate-700">
                        <span>1 Jan 2026</span>
                        <span className="text-slate-300 mx-1">|</span>
                        <span>31 Dec 2026</span>
                      </div>
                    </div>

                    {/* Totals info panel */}
                    <div className="flex items-center justify-around bg-slate-50 border border-slate-100 py-3.5 rounded-2xl text-center">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase">USD {stats.totalEarnings.toFixed(0)}</span>
                        <div className="flex items-center gap-1.5 justify-center mt-0.5">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">INCOME</span>
                        </div>
                      </div>
                      <div className="h-8 w-px bg-slate-200"></div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase">USD 0</span>
                        <div className="flex items-center gap-1.5 justify-center mt-0.5">
                          <span className="w-2 h-2 rounded-full bg-blue-300"></span>
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">EXPENSES</span>
                        </div>
                      </div>
                      <div className="h-8 w-px bg-slate-200"></div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase">USD {stats.totalEarnings.toFixed(0)}</span>
                        <div className="flex items-center gap-1.5 justify-center mt-0.5">
                          <span className="w-2 h-2 rounded-full bg-slate-900"></span>
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">NET</span>
                        </div>
                      </div>
                    </div>

                    {/* Chart Bars */}
                    <div className="pt-4">
                      <div className="flex items-end justify-between h-24 gap-2.5 px-2">
                        {['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'].map((month, i) => {
                          const isCurrent = month === 'JUL';
                          const barHeight = stats.totalEarnings > 0 && i === 6 ? 'h-full bg-blue-500' : 'h-1 bg-slate-200';
                          return (
                            <div key={month} className="flex-grow flex flex-col items-center gap-2 group cursor-pointer">
                              <div className="w-full bg-slate-50 border border-slate-100 rounded-lg flex items-end h-16 overflow-hidden">
                                <div className={`w-full transition-all duration-500 rounded-t-sm ${barHeight}`} />
                              </div>
                              <span className={`text-[9px] font-bold ${isCurrent ? 'text-blue-500' : 'text-slate-400'} group-hover:text-slate-700`}>{month}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Calendar Mini-Widget */}
                  <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-xs flex flex-col justify-between space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                        <Calendar className="h-4.5 w-4.5 text-blue-500" />
                        <span>Calendar</span>
                      </h4>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-1">
                        <span>July 2026</span>
                        <div className="flex items-center gap-2">
                          <button className="p-1 hover:bg-slate-50 rounded">&lt;</button>
                          <button className="p-1 hover:bg-slate-50 rounded">&gt;</button>
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="grid grid-cols-7 text-[9px] font-bold text-slate-400 uppercase mb-2">
                          <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                        </div>
                        <div className="grid grid-cols-7 text-xs gap-y-1 bg-slate-50 p-2 rounded-2xl border border-slate-100 font-medium">
                          {/* Blank slots */}
                          <span></span><span></span><span></span>
                          {[...Array(31)].map((_, idx) => {
                            const day = idx + 1;
                            const isToday = day === 4;
                            return (
                              <span 
                                key={day} 
                                className={`py-1 rounded-md transition ${isToday ? 'bg-blue-600 text-white font-extrabold shadow-sm shadow-blue-600/10' : 'text-slate-500 hover:bg-slate-200/50'}`}
                              >
                                {day}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 text-center font-medium italic">No events for the selected month</p>
                    </div>

                    <button 
                      onClick={() => setActiveSubTab('bookings')}
                      className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl py-2 text-xs font-extrabold text-slate-600 transition cursor-pointer"
                    >
                      Open calendar
                    </button>
                  </div>
                </div>

                {/* Additional Bento widgets (Leads, Properties, ROI, Valuation) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  
                  {/* Top expense categories widget */}
                  <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-xs flex flex-col justify-between space-y-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-3">Top expense categories</span>
                      <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-2.5 rounded-xl mb-3">
                        <span className="text-xs font-semibold text-slate-500">TOTAL</span>
                        <span className="text-xs font-extrabold text-slate-800">USD 0</span>
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between text-slate-500">
                          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500"></span>Overdue</span>
                          <span className="font-bold text-slate-700">USD 0</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>Paid</span>
                          <span className="font-bold text-slate-700">USD 0</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span>Upcoming</span>
                          <span className="font-bold text-slate-700">USD 0</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Listings view & create */}
                  <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Listings</span>
                      <button 
                        onClick={() => setActiveSubTab('listings')}
                        className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
                      >
                        View all
                      </button>
                    </div>
                    {ownerListings.length === 0 ? (
                      <div className="py-4 text-center space-y-3">
                        <p className="text-slate-400 text-xs">You have no live listings.</p>
                        <button
                          onClick={() => setActiveSubTab('add')}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
                        >
                          Create listing
                        </button>
                      </div>
                    ) : (
                      <div className="py-3">
                        <p className="text-3xl font-black text-emerald-600">{ownerListings.length}</p>
                        <p className="text-[10px] text-slate-400 mt-1">Live active units list</p>
                      </div>
                    )}
                  </div>

                  {/* Properties Types list */}
                  <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-xs flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-3">Properties</span>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between text-slate-500">
                          <span>Units</span>
                          <span className="font-bold text-slate-700">{ownerListings.filter(l => l.type === 'apartment' || l.type === 'studio').length}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>Single family homes</span>
                          <span className="font-bold text-slate-700">{ownerListings.filter(l => l.type === 'house' || l.type === 'villa').length}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs">
                      <span className="text-slate-400 font-bold uppercase">TOTAL</span>
                      <span className="font-extrabold text-emerald-600">{ownerListings.length}</span>
                    </div>
                  </div>

                  {/* Property Valuation */}
                  <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-xs flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-3">Property valuation</span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">NET GAIN</span>
                        <span className="text-sm font-extrabold text-slate-800">USD 0</span>
                        <span className="text-[10px] font-bold text-emerald-500">(0%)</span>
                      </div>
                    </div>
                    <div className="space-y-1.5 text-[10px] text-slate-400 border-t border-slate-100 pt-3 mt-3">
                      <div className="flex justify-between">
                        <span>CURRENT VALUATION:</span>
                        <span className="font-bold text-slate-700">USD 0</span>
                      </div>
                      <div className="flex justify-between">
                        <span>PURCHASE PRICE:</span>
                        <span className="font-bold text-slate-700">USD 0</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB: PROPERTIES / MY LISTINGS */}
            {(activeSubTab === 'listings' || activeSubTab === 'add') && (
              <div className="space-y-0 animate-fadeIn" id="owner-properties-portal-view">
                
                {/* Header: Listings title + New Listing button */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-2">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Listings</h2>
                  <button
                    onClick={() => setActiveSubTab(activeSubTab === 'add' ? 'listings' : 'add')}
                    className="bg-[#ff445a] hover:bg-[#e63046] text-white font-bold text-sm px-5 py-2.5 rounded-lg shadow-sm transition cursor-pointer flex items-center gap-2 shrink-0"
                  >
                    {activeSubTab === 'add' ? (
                      <>
                        <Building className="h-4 w-4" />
                        <span>View Listings</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        <span>New listing</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Sub Tab View: List of properties */}
                {activeSubTab === 'listings' && (
                  <div className="space-y-0">
                    {/* Tab bar: All / Published / Drafts */}
                    <div className="border-b border-slate-200 mb-8">
                      <div className="flex items-center gap-8">
                        <button className="relative pb-3 text-sm font-bold text-blue-600 transition">
                          All
                          <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-600 rounded-t-full" />
                        </button>
                        <button className="pb-3 text-sm font-medium text-slate-400 hover:text-slate-600 transition">
                          Published
                        </button>
                        <button className="pb-3 text-sm font-medium text-slate-400 hover:text-slate-600 transition">
                          Drafts
                        </button>
                      </div>
                    </div>

                    {ownerListings.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {ownerListings.map((property) => (
                          <div 
                            key={property.id} 
                            className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                          >
                            <div className="relative aspect-video bg-slate-100">
                              <img src={property.image} alt={property.title} className="w-full h-full object-cover" />
                              <button
                                onClick={async () => {
                                  if (window.confirm('Are you absolutely sure you want to remove this property listing from the live rental network?')) {
                                    await onDeleteListing(property.id);
                                  }
                                }}
                                className="absolute top-3 right-3 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 p-2 rounded-xl shadow-xs border border-slate-100 transition cursor-pointer"
                                title="Remove Property"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                              <span className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                                {property.type}
                              </span>
                            </div>

                            <div className="p-5 space-y-3">
                              <h4 className="font-bold text-slate-900 text-sm leading-snug truncate">{property.title}</h4>
                              <div className="flex items-center text-xs text-slate-500">
                                <MapPin className="h-3.5 w-3.5 mr-1 text-slate-400" />
                                <span>{property.location}</span>
                              </div>

                              <div className="flex justify-between items-baseline pt-3 border-t border-slate-50">
                                <span className="text-xs font-bold text-slate-800">${property.price} / night</span>
                                <span className="text-[10px] text-slate-400 font-mono">Rating: {property.rating.toFixed(1)} ★</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* Empty state: Phone mockup illustration matching LandlordStudio */
                      <div className="flex flex-col items-center justify-center py-16">
                        <div className="relative">
                          {/* Phone device frame */}
                          <div className="w-48 h-72 bg-white rounded-[2rem] border-[3px] border-slate-300 shadow-lg overflow-hidden flex flex-col relative">
                            {/* Phone top notch */}
                            <div className="w-16 h-1.5 bg-slate-200 rounded-full mx-auto mt-2 mb-2" />
                            
                            {/* Phone screen content */}
                            <div className="flex-1 mx-2 mb-2 bg-slate-50 rounded-xl overflow-hidden flex flex-col">
                              {/* Mini property card in phone */}
                              <div className="p-3 flex-1 flex flex-col items-center justify-center">
                                {/* House illustration */}
                                <div className="relative mb-3">
                                  <div className="w-24 h-16 bg-blue-100 rounded-lg relative overflow-hidden">
                                    {/* House roof */}
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[48px] border-r-[48px] border-b-[20px] border-l-transparent border-r-transparent border-b-blue-300" />
                                    {/* House body */}
                                    <div className="absolute bottom-0 left-2 right-2 h-8 bg-blue-200 rounded-t-sm">
                                      {/* Window */}
                                      <div className="absolute top-1.5 left-2 w-3 h-3 bg-white/80 rounded-sm" />
                                      <div className="absolute top-1.5 right-2 w-3 h-3 bg-white/80 rounded-sm" />
                                      {/* Door */}
                                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-5 bg-blue-400 rounded-t-sm" />
                                    </div>
                                  </div>
                                  {/* Small triangle roof accent */}
                                  <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                                    <Home className="h-5 w-5 text-blue-400" />
                                  </div>
                                </div>

                                {/* SELECT button in phone */}
                                <button className="bg-blue-600 text-white text-[8px] font-bold px-5 py-1.5 rounded-md tracking-wider uppercase shadow-sm">
                                  SELECT
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Floating heart icon */}
                          <div className="absolute -top-2 -right-6 w-9 h-9 bg-white rounded-full border-2 border-emerald-400 flex items-center justify-center shadow-md">
                            <svg className="w-4 h-4 text-emerald-500 fill-emerald-500" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="0">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                          </div>
                        </div>

                        <p className="text-slate-400 text-sm mt-8 text-center max-w-xs">No listings yet. Add your first property to get started.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Sub Tab View: Add property wizard */}
                {activeSubTab === 'add' && (
                  <div className="bg-white rounded-3xl border border-slate-100 shadow-xs max-w-2xl mx-auto overflow-hidden mt-6">
                    <div className="border-b border-slate-100 p-5 flex justify-between items-center bg-slate-50">
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm">Property Creator Wizard</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Publish your luxury spaces to the marketplace instantly.</p>
                      </div>
                      <PlusCircle className="h-6 w-6 text-[#ff445a]" />
                    </div>

                    <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
                      {formSuccess && (
                        <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-4 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2">
                          <CheckCircle className="h-5 w-5 text-emerald-600" />
                          <span>Listing published live to networks successfully!</span>
                        </div>
                      )}

                      {formError && (
                        <div className="bg-rose-50 border border-rose-100 text-rose-800 p-4 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2">
                          <XCircle className="h-5 w-5 text-rose-600" />
                          <span>{formError}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-500">Property Title *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Architectural Cliffside Villa"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-sans text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-500">Category</label>
                          <select
                            value={type}
                            onChange={(e) => setType(e.target.value as any)}
                            className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-sans text-xs focus:outline-none focus:border-blue-500 focus:bg-white capitalize"
                          >
                            <option value="apartment">apartment</option>
                            <option value="villa">villa</option>
                            <option value="house">house</option>
                            <option value="studio">studio</option>
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="text-xs font-bold text-slate-500">Description *</label>
                          <textarea
                            required
                            rows={3}
                            placeholder="Describe what makes this listing unique..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-sans text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-500">Address Location *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Malibu, California"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-sans text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-500">Rent Price (USD / night) *</label>
                          <input
                            type="number"
                            required
                            min="10"
                            value={price}
                            onChange={(e) => setPrice(Number(e.target.value))}
                            className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-sans text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-500">Beds count</label>
                          <input
                            type="number"
                            min="1"
                            value={beds}
                            onChange={(e) => setBeds(Number(e.target.value))}
                            className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-sans text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-500">Baths count</label>
                          <input
                            type="number"
                            min="1"
                            step="0.5"
                            value={baths}
                            onChange={(e) => setBaths(Number(e.target.value))}
                            className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-sans text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                          />
                        </div>
                      </div>

                      {/* Image URLs & Presets */}
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-500">Cover Image URL *</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            required
                            placeholder="Select a preset below or enter unsplash link"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-sans text-xs focus:outline-none focus:border-blue-500 focus:bg-white"
                          />
                        </div>
                        
                        <div className="space-y-1.5 pt-1.5">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Or quick select curated preset:</span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {PRESET_IMAGES.map((img) => (
                              <button
                                key={img.name}
                                type="button"
                                onClick={() => setImageUrl(img.url)}
                                className={`p-2 rounded-xl border text-[10px] font-bold text-left truncate cursor-pointer transition ${
                                  imageUrl === img.url ? 'bg-blue-50 border-blue-400 text-blue-800' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                }`}
                              >
                                {img.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Amenities Creator */}
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-500">List of Amenities</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="e.g. Infinity Pool, Fast Wi-Fi, Chef's Kitchen"
                            value={customAmenity}
                            onChange={(e) => setCustomAmenity(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddAmenity(); } }}
                            className="flex-grow px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-sans text-xs focus:outline-none focus:border-blue-500"
                          />
                          <button
                            type="button"
                            onClick={handleAddAmenity}
                            className="bg-[#ff445a] hover:bg-[#e63046] text-white font-extrabold text-xs px-4 rounded-xl cursor-pointer"
                          >
                            Add
                          </button>
                        </div>
                        
                        <div className="flex flex-wrap gap-1.5 pt-1.5">
                          {amenities.map((amenity, idx) => (
                            <span key={idx} className="bg-slate-50 text-slate-600 border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
                              <span>{amenity}</span>
                              <button type="button" onClick={() => handleRemoveAmenity(amenity)} className="text-slate-400 hover:text-rose-600 font-bold">&times;</button>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex justify-end">
                        <button
                          type="submit"
                          className="bg-[#ff445a] hover:bg-[#e63046] text-white font-extrabold text-sm px-6 py-3 rounded-xl shadow-md transition cursor-pointer"
                        >
                          Publish Listing
                        </button>
                      </div>
                    </form>
                  </div>
                )}

              </div>
            )}

            {/* TAB: FIND TENANTS / BOOKINGS QUEUE */}
            {activeSubTab === 'bookings' && (
              <div className="space-y-6 animate-fadeIn" id="owner-bookings-portal-view">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Tenant Stays Queue</h2>
                  <p className="text-xs text-slate-400 mt-1">Approve, decline, or review stay reservations across your listings.</p>
                </div>

                {ownerBookings.length > 0 ? (
                  <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-450 uppercase tracking-widest font-sans">
                            <th className="p-4">Listing Space</th>
                            <th className="p-4">Renter Guest</th>
                            <th className="p-4">Stay Period</th>
                            <th className="p-4">Paid Total</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Approval controls</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-55 text-xs">
                          {ownerBookings.map((booking) => (
                            <tr key={booking.id} className="hover:bg-slate-50/50 transition">
                              <td className="p-4 font-bold text-slate-900 truncate max-w-[180px]">{booking.listingTitle}</td>
                              <td className="p-4 font-semibold text-slate-700">{booking.renterName}</td>
                              <td className="p-4 text-slate-400">
                                {booking.startDate} &rarr; {booking.endDate} 
                                <span className="block font-mono text-[9px] mt-0.5">({booking.nights} nights)</span>
                              </td>
                              <td className="p-4 font-extrabold text-slate-800">${booking.totalPrice}</td>
                              <td className="p-4">
                                <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                                  booking.status === 'approved' 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                    : booking.status === 'pending'
                                      ? 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse'
                                      : 'bg-rose-55 text-rose-700 border-rose-100'
                                }`}>
                                  {booking.status}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                {booking.status === 'pending' ? (
                                  <div className="flex gap-1.5 justify-end">
                                    <button
                                      onClick={async () => {
                                        if (window.confirm('Reject this reservation stay?')) {
                                          await onUpdateBookingStatus(booking.id, 'declined');
                                        }
                                      }}
                                      className="bg-rose-50 hover:bg-rose-100 border border-rose-200/50 text-rose-700 p-1.5 rounded-lg cursor-pointer transition"
                                      title="Reject Request"
                                    >
                                      <XCircle className="h-4.5 w-4.5" />
                                    </button>
                                    <button
                                      onClick={async () => {
                                        await onUpdateBookingStatus(booking.id, 'approved');
                                      }}
                                      className="bg-emerald-600 hover:bg-emerald-500 text-white p-1.5 rounded-lg shadow-xs cursor-pointer transition"
                                      title="Approve Request"
                                    >
                                      <CheckCircle className="h-4.5 w-4.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-slate-400 font-mono">Processed</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center space-y-4 max-w-sm mx-auto shadow-xs">
                    <CalendarCheck2 className="h-10 w-10 text-slate-300 mx-auto" />
                    <h4 className="font-bold text-slate-800 text-sm">Stay queue empty</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">Guests haven't requested bookings on your active properties yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB: MAINTENANCE & ALERTS */}
            {activeSubTab === 'maintenance' && (
              <div className="space-y-6 animate-fadeIn" id="owner-maintenance-portal-view">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Maintenance Dispatch</h2>
                  <p className="text-xs text-slate-400 mt-1">Review active reports and coordinate resolution with tenants.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <span>Open Alerts</span>
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                    </div>
                    <p className="mt-2 text-2xl font-extrabold text-slate-950">{dispatchSummary.openCount}</p>
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <span>In Review</span>
                      <Clock3 className="h-4 w-4 text-blue-500" />
                    </div>
                    <p className="mt-2 text-2xl font-extrabold text-slate-950">{dispatchSummary.reviewCount}</p>
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <span>Resolved</span>
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                    </div>
                    <p className="mt-2 text-2xl font-extrabold text-slate-950">{dispatchSummary.resolvedCount}</p>
                  </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs">
                  <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-emerald-600" />
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Dispatch Queue</h3>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {maintenanceRequests.map((request) => (
                      <div key={request.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-slate-900 text-sm">{request.property}</p>
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              request.priority === 'high' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                            }`}>
                              {request.priority}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{request.guest} &bull; {request.issue}</p>
                          <p className="text-[10px] text-slate-450 mt-1">Updated {request.updatedAt}</p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                            request.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700' : request.status === 'In Review' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {request.status}
                          </span>
                          <select
                            value={request.status}
                            onChange={(e) => handleMaintenanceStatusChange(request.id, e.target.value)}
                            className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 outline-none"
                          >
                            <option value="Open">Open</option>
                            <option value="In Review">In Review</option>
                            <option value="Resolved">Resolved</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: ORGANISATION VIEW */}
            {activeSubTab === 'organisation' && (
              <div className="space-y-6 animate-fadeIn" id="owner-org-portal-view">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Organisation settings</h2>
                  <p className="text-xs text-slate-400 mt-1">Manage your agency credentials, members, and portfolio status.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Agency profile */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-4 lg:col-span-2">
                    <h3 className="text-sm font-bold text-slate-800">Portfolio Profile Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Agency Name</label>
                        <p className="text-xs font-bold text-slate-700 mt-1">RentHub Studio Properties Ltd.</p>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Primary Owner</label>
                        <p className="text-xs font-bold text-slate-700 mt-1">{currentUser?.name ?? 'yosef Melaku'}</p>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Contact Email</label>
                        <p className="text-xs font-bold text-slate-700 mt-1 font-mono">{currentUser?.email}</p>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Service Level</label>
                        <p className="text-xs font-bold text-emerald-600 mt-1 flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          <span>Professional Trial Mode</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Team Members */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-4">
                    <h3 className="text-sm font-bold text-slate-800">Members List (1)</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-50 pb-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">{initials}</div>
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">{currentUser?.name ?? 'yosef Melaku'}</span>
                            <span className="text-[9px] text-slate-400 block font-mono">{currentUser?.email}</span>
                          </div>
                        </div>
                        <span className="bg-blue-50 text-blue-700 text-[9px] font-bold uppercase px-2 py-0.5 rounded border border-blue-100">Owner</span>
                      </div>
                    </div>
                    <button className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 py-2.5 rounded-2xl text-xs font-extrabold text-slate-600 transition">
                      + Invite Team Member
                    </button>
                  </div>

                </div>
              </div>
            )}

            {/* TAB: REPORTS */}
            {activeSubTab === 'reports' && (
              <div className="space-y-6 animate-fadeIn text-slate-800" id="owner-reports-portal-view">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Financial Reports</h2>
                  <p className="text-xs text-slate-400 mt-1">Review tax-ready accounting ledgers, transaction records, and earnings.</p>
                </div>

                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-6">
                  <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">Available Statements</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-slate-100 hover:border-slate-200 p-4 rounded-2xl flex items-center justify-between transition cursor-pointer group">
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-800 group-hover:text-emerald-600 transition">Income Statement</h4>
                        <p className="text-[10px] text-slate-400">Review net earnings, expenses, and total gross profit margins.</p>
                      </div>
                      <ArrowUpRight className="h-4.5 w-4.5 text-slate-400 group-hover:text-emerald-500 transition" />
                    </div>

                    <div className="border border-slate-100 hover:border-slate-200 p-4 rounded-2xl flex items-center justify-between transition cursor-pointer group">
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-800 group-hover:text-emerald-600 transition">Rent Ledger</h4>
                        <p className="text-[10px] text-slate-400">Detailed logs of paid bookings, cancellations, and overdue balances.</p>
                      </div>
                      <ArrowUpRight className="h-4.5 w-4.5 text-slate-400 group-hover:text-emerald-500 transition" />
                    </div>

                    <div className="border border-slate-100 hover:border-slate-200 p-4 rounded-2xl flex items-center justify-between transition cursor-pointer group">
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-800 group-hover:text-emerald-600 transition">Expense report</h4>
                        <p className="text-[10px] text-slate-400">Breakdown of maintenance costs, commissions, and platform fees.</p>
                      </div>
                      <ArrowUpRight className="h-4.5 w-4.5 text-slate-400 group-hover:text-emerald-500 transition" />
                    </div>

                    <div className="border border-slate-100 hover:border-slate-200 p-4 rounded-2xl flex items-center justify-between transition cursor-pointer group">
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-800 group-hover:text-emerald-600 transition">SOC-2 Audit Ledger</h4>
                        <p className="text-[10px] text-slate-400">Compliance transaction logging for security certifications.</p>
                      </div>
                      <ArrowUpRight className="h-4.5 w-4.5 text-slate-400 group-hover:text-emerald-500 transition" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: INTEGRATIONS */}
            {activeSubTab === 'integrations' && (
              <div className="space-y-6 animate-fadeIn" id="owner-integrations-portal-view">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">API Integrations</h2>
                  <p className="text-xs text-slate-400 mt-1">Connect your property ledger directly with accounting & payment providers.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* QuickBooks */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <Landmark className="h-5 w-5" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-800">QuickBooks Online</h4>
                      <p className="text-[10px] text-slate-450 leading-relaxed">Direct synchronization of rent received, maintenance invoices, and tax filings.</p>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Disabled</span>
                      <button className="bg-slate-150 hover:bg-slate-200 text-slate-700 text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer">Connect</button>
                    </div>
                  </div>

                  {/* Stripe */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <DollarSign className="h-5 w-5" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-800">Stripe Payments</h4>
                      <p className="text-[10px] text-slate-450 leading-relaxed">Receive credit card and ACH rent payments directly to your bank account securely.</p>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-[10px] text-emerald-600 font-extrabold uppercase">Live / Ready</span>
                      <button className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer">Configure</button>
                    </div>
                  </div>

                  {/* WhatsApp Alerts */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <Bell className="h-5 w-5" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-800">WhatsApp Notification Hub</h4>
                      <p className="text-[10px] text-slate-450 leading-relaxed">Send automated SMS and WhatsApp check-in instructions and rent reminder codes.</p>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Disabled</span>
                      <button className="bg-slate-150 hover:bg-slate-200 text-slate-700 text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer">Connect</button>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* TAB: CONTACTS */}
            {activeSubTab === 'contacts' && (
              <div className="space-y-6 animate-fadeIn" id="owner-contacts-portal-view">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Tenant & Vendor contacts</h2>
                  <p className="text-xs text-slate-400 mt-1">Directory of active renters, maintenance specialists, and builders.</p>
                </div>

                <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <th className="p-4">Full Name</th>
                          <th className="p-4">Contact Details</th>
                          <th className="p-4">Role Classification</th>
                          <th className="p-4">Associated Property</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr className="hover:bg-slate-50/50 transition">
                          <td className="p-4 font-bold text-slate-800">Talia S.</td>
                          <td className="p-4 font-mono text-slate-500">talia.s@example.com <span className="block mt-0.5 text-[10px] text-slate-400">+1 (555) 0192</span></td>
                          <td className="p-4"><span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[9px] font-bold uppercase px-2 py-0.5 rounded">Renter</span></td>
                          <td className="p-4 text-slate-500 font-semibold">Cliffside Villa</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 transition">
                          <td className="p-4 font-bold text-slate-800">Mina K.</td>
                          <td className="p-4 font-mono text-slate-500">mina.k@example.com <span className="block mt-0.5 text-[10px] text-slate-400">+1 (555) 0148</span></td>
                          <td className="p-4"><span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[9px] font-bold uppercase px-2 py-0.5 rounded">Renter</span></td>
                          <td className="p-4 text-slate-500 font-semibold">Harbor Loft</td>
                        </tr>
                        <tr className="hover:bg-slate-50/50 transition">
                          <td className="p-4 font-bold text-slate-800">Dave Cooper</td>
                          <td className="p-4 font-mono text-slate-500">dave.cooper@dispatch.com <span className="block mt-0.5 text-[10px] text-slate-400">+1 (555) 0111</span></td>
                          <td className="p-4"><span className="bg-amber-50 text-amber-700 border border-amber-100 text-[9px] font-bold uppercase px-2 py-0.5 rounded">HVAC Tech Vendor</span></td>
                          <td className="p-4 text-slate-400 font-medium">Multiple units</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: MORE SETTINGS */}
            {activeSubTab === 'more' && (
              <div className="space-y-6 animate-fadeIn text-slate-800" id="owner-settings-portal-view">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Portal Configurations</h2>
                  <p className="text-xs text-slate-400 mt-1">General system configurations and platform settings.</p>
                </div>

                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-slate-800">Security & Billing</h3>
                  <p className="text-xs text-slate-500">You are currently logged into Owner Studio on a mock developer account. For database configurations or custom Firestore structures, please review integrations or contact support.</p>
                  <div className="pt-2">
                    <button className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer">
                      Review Security Audits
                    </button>
                  </div>
                </div>
              </div>
            )}

          </main>
        </div>

      </div>
    </div>
  );
};