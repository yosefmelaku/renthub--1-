import React, { useState, useMemo } from 'react';
import { PropertyListing, Booking } from '../types';
import { 
  TrendingUp, DollarSign, CalendarCheck2, LayoutGrid, PlusCircle, CheckCircle, XCircle, 
  Trash2, Image, Sparkles, Building, Bed, Bath, Plus, MapPin, RefreshCw, Upload, Wrench,
  AlertTriangle, Clock3, Percent, Calendar, Users, ArrowUpRight, PieChart

} from 'lucide-react';

interface OwnerDashboardProps {
  listings: PropertyListing[];
  bookings: Booking[];
  onCreateListing: (listingData: Omit<PropertyListing, 'id' | 'rating' | 'reviewsCount'>) => Promise<PropertyListing>;
  onDeleteListing: (listingId: string) => Promise<void>;
  onUpdateBookingStatus: (bookingId: string, status: Booking['status']) => Promise<void>;
  loading: boolean;
  onRefresh: () => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({
  listings,
  bookings,
  onCreateListing,
  onDeleteListing,
  onUpdateBookingStatus,
  loading,
  onRefresh,
}) => {
  // Tabs: 'stats' | 'listings' | 'bookings' | 'add' | 'maintenance'
  const [activeSubTab, setActiveSubTab] = useState<'stats' | 'listings' | 'bookings' | 'add' | 'maintenance'>('stats');

  // Form State
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
  const [maintenanceRequests, setMaintenanceRequests] = useState([
    { id: 'req-101', property: 'Cliffside Villa', guest: 'Talia S.', issue: 'HVAC cooling sporadic after midnight', priority: 'high', status: 'Open', updatedAt: '12 min ago' },
    { id: 'req-102', property: 'Harbor Loft', guest: 'Mina K.', issue: 'Smart lock battery warning', priority: 'medium', status: 'In Review', updatedAt: '37 min ago' },
    { id: 'req-103', property: 'Skyline Residence', guest: 'Noah R.', issue: 'Kitchen appliance not responding', priority: 'high', status: 'Resolved', updatedAt: '1 hr ago' },
  ]);

  // Curated list of premium royalty-free images to let user auto-fill
  const PRESET_IMAGES = [
    { name: "Modern Villa", url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80" },
    { name: "Nordic House", url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80" },
    { name: "Chic Penthouse", url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80" },
    { name: "Minimalist Loft", url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80" }
  ];

  // Calculate Owner Analytics (Filtered for 'owner_default' or listings owned by this owner)
  const ownerListings = useMemo(() => {
    return listings.filter(l => l.ownerId === 'owner_default');
  }, [listings]);

  const ownerListingIds = useMemo(() => {
    return new Set(ownerListings.map(l => l.id));
  }, [ownerListings]);

  const ownerBookings = useMemo(() => {
    return bookings.filter(b => ownerListingIds.has(b.listingId));
  }, [bookings, ownerListingIds]);

  const stats = useMemo(() => {
    // Total Earnings: Sum of paid bookings for owner's listings
    const totalEarnings = ownerBookings
      .filter(b => b.paymentStatus === 'paid' && b.status !== 'declined' && b.status !== 'cancelled')
      .reduce((sum, b) => sum + b.totalPrice, 0);

    const approvedCount = ownerBookings.filter(b => b.status === 'approved').length;
    const totalCount = ownerBookings.length;
    
    // Occupancy Rate: Simplified simulation based on approved stays
    const occupancyRate = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;

    return {
      totalEarnings,
      occupancyRate,
      totalBookings: totalCount,
      activeListingsCount: ownerListings.length
    };
  }, [ownerBookings, ownerListings]);

  const dispatchSummary = useMemo(() => {
    const openCount = maintenanceRequests.filter((request) => request.status === 'Open').length;
    const reviewCount = maintenanceRequests.filter((request) => request.status === 'In Review').length;
    const resolvedCount = maintenanceRequests.filter((request) => request.status === 'Resolved').length;
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
    setMaintenanceRequests((prev) => prev.map((request) => request.id === requestId ? { ...request, status: nextStatus } : request));
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
        ownerId: 'owner_default'
      });
      
      setFormSuccess(true);
      // Reset form fields
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

  return (
    <div className="space-y-6" id="owner-dashboard-container">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-sans font-extrabold text-gray-900">Host Management Suite</h2>
          <p className="text-xs text-gray-500 font-sans mt-0.5">Control properties, approve guest schedules, and monitor marketplace performance.</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            id="owner-refresh-btn"
            onClick={onRefresh}
            disabled={loading}
            className="p-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-gray-600 disabled:opacity-50 cursor-pointer"
            title="Refresh database"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            id="subtab-toggle-add"
            onClick={() => setActiveSubTab('add')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>List New Property</span>
          </button>
        </div>
      </div>

      {/* Sub tabs navigation */}
      <div className="flex border-b border-gray-100 pb-px" id="owner-sub-tabs">
        <button
          id="btn-subtab-stats"
          onClick={() => setActiveSubTab('stats')}
          className={`px-4 py-2.5 font-sans text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'stats'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Performance Stats
        </button>
        <button
          id="btn-subtab-listings"
          onClick={() => setActiveSubTab('listings')}
          className={`px-4 py-2.5 font-sans text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'listings'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          My Listings ({ownerListings.length})
        </button>
        <button
          id="btn-subtab-bookings"
          onClick={() => setActiveSubTab('bookings')}
          className={`px-4 py-2.5 font-sans text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'bookings'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Guest Stays Queue ({ownerBookings.length})
        </button>
        <button
          id="btn-subtab-maintenance"
          onClick={() => setActiveSubTab('maintenance')}
          className={`px-4 py-2.5 font-sans text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'maintenance'
              ? 'border-emerald-600 text-emerald-700 font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Maintenance & Dispatch
        </button>
      </div>

      {/* SUB-TAB: STATS INDEX */}
      {activeSubTab === 'stats' && (
        <div className="space-y-6 animate-fadeIn" id="subtab-panel-stats">
          
          {/* Row 1: Rent received, Upcoming payments, Rent overdue */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Rent Received */}
            <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden group">
              <div className="absolute top-[-20%] right-[-10%] w-32 h-32 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-500" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Rent received</span>
                <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
                  <DollarSign className="h-5 w-5" />
                </span>
              </div>
              <p className="mt-5 text-3xl font-extrabold tracking-tight">USD {stats.totalEarnings.toFixed(2)}</p>
              <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Received last month</span>
                <span className="font-bold text-emerald-400">USD {stats.totalEarnings.toFixed(0)}</span>
              </div>
            </div>

            {/* Upcoming Payments */}
            <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden group">
              <div className="absolute top-[-20%] right-[-10%] w-32 h-32 rounded-full bg-blue-500/10 blur-2xl pointer-events-none group-hover:bg-blue-500/20 transition-all duration-500" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Upcoming payments</span>
                <span className="p-2 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20">
                  <Clock3 className="h-5 w-5" />
                </span>
              </div>
              <p className="mt-5 text-3xl font-extrabold tracking-tight">USD 0.00</p>
              <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Status</span>
                <span className="font-semibold text-blue-400">0 payment</span>
              </div>
            </div>

            {/* Rent Overdue */}
            <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden group">
              <div className="absolute top-[-20%] right-[-10%] w-32 h-32 rounded-full bg-rose-500/10 blur-2xl pointer-events-none group-hover:bg-rose-500/20 transition-all duration-500" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Rent overdue</span>
                <span className="p-2 bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/20">
                  <AlertTriangle className="h-5 w-5" />
                </span>
              </div>
              <p className="mt-5 text-3xl font-extrabold tracking-tight text-rose-400">USD 0.00</p>
              <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Alerts</span>
                <span className="font-bold text-rose-400">0 overdue</span>
              </div>
            </div>
          </div>

          {/* Row 2: Cashflow & Top expense categories */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Cashflow Widget (Large: 2 cols) */}
            <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 shadow-xl lg:col-span-2 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-400" />
                    <span>Cashflow</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Summary of incomes and operational expenses.</p>
                </div>
                
                {/* Date range blocks */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-2xl">
                    <div className="text-center bg-slate-900 px-1.5 py-0.5 rounded text-[10px]">
                      <span className="font-bold block leading-none">1</span>
                      <span className="text-[8px] uppercase">Jan</span>
                    </div>
                    <div className="text-left">
                      <span className="text-[8px] text-slate-500 block">Start Date</span>
                      <span className="text-[10px] font-semibold text-slate-300">1 Jan 2026</span>
                    </div>
                  </div>
                  <span className="text-slate-600 text-xs">to</span>
                  <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-2xl">
                    <div className="text-center bg-slate-900 px-1.5 py-0.5 rounded text-[10px]">
                      <span className="font-bold block leading-none">31</span>
                      <span className="text-[8px] uppercase">Dec</span>
                    </div>
                    <div className="text-left">
                      <span className="text-[8px] text-slate-500 block">End Date</span>
                      <span className="text-[10px] font-semibold text-slate-300">31 Dec 2026</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Income, Expense, Net values */}
              <div className="grid grid-cols-3 gap-4 bg-slate-950 border border-slate-850 p-4 rounded-2xl text-center">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">INCOME</span>
                  <span className="text-base font-extrabold text-white mt-1 block">USD {stats.totalEarnings.toFixed(0)}</span>
                </div>
                <div className="border-x border-slate-800">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">EXPENSES</span>
                  <span className="text-base font-extrabold text-rose-400 mt-1 block">USD 0</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">NET</span>
                  <span className="text-base font-extrabold text-emerald-400 mt-1 block">USD {stats.totalEarnings.toFixed(0)}</span>
                </div>
              </div>

              {/* Monthly Bar Chart */}
              <div className="pt-2">
                <div className="flex items-end justify-between h-28 gap-2 px-1">
                  {['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'].map((month, i) => {
                    const isCurrent = month === 'JUL'; // Hardcoded/Simulated July 2026
                    const heightClass = stats.totalEarnings > 0 && i === 6 ? 'h-full bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'h-1 bg-slate-800';
                    return (
                      <div key={month} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                        <div className="w-full bg-slate-950 rounded-lg flex items-end h-20 overflow-hidden relative border border-slate-800/40">
                          <div className={`w-full transition-all duration-500 rounded-t ${heightClass}`} />
                        </div>
                        <span className={`text-[9px] font-bold ${isCurrent ? 'text-emerald-400' : 'text-slate-500'} group-hover:text-slate-300`}>{month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Top Expense Categories Widget */}
            <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-6">
              <div className="space-y-1">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-indigo-400" />
                  <span>Top expense categories</span>
                </h3>
                <p className="text-[10px] text-slate-400">1 Jan 2026 - 31 Dec 2026</p>
              </div>

              {/* Expenses Breakdown */}
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-slate-950 border border-slate-850 p-3 rounded-2xl">
                  <span className="text-xs font-semibold text-slate-400">TOTAL</span>
                  <span className="text-sm font-extrabold text-white">USD 0</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      Overdue
                    </span>
                    <span className="font-bold text-slate-300">USD 0</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      Paid
                    </span>
                    <span className="font-bold text-slate-300">USD 0</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      Upcoming
                    </span>
                    <span className="font-bold text-slate-300">USD 0</span>
                  </div>
                </div>
              </div>

              {/* Empty chart display */}
              <div className="border border-dashed border-slate-800 rounded-2xl py-5 text-center text-[10px] text-slate-500">
                No expense data recorded in this period.
              </div>
            </div>
          </div>

          {/* Row 3: Listings, Leads, Properties, Occupancy */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Listings Widget */}
            <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Listings</span>
                <button 
                  onClick={() => setActiveSubTab('listings')}
                  className="text-emerald-400 hover:text-emerald-300 transition text-xs font-bold"
                >
                  View all
                </button>
              </div>

              {ownerListings.length === 0 ? (
                <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
                  <p className="text-slate-400 text-xs font-medium">You have no live listings.</p>
                  <button
                    onClick={() => setActiveSubTab('add')}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-2xl transition cursor-pointer shadow-lg shadow-emerald-600/10"
                  >
                    Create listing
                  </button>
                </div>
              ) : (
                <div className="py-2 space-y-2">
                  <p className="text-emerald-400 text-2xl font-black">{ownerListings.length}</p>
                  <p className="text-[10px] text-slate-400">Live active listing units publishing rentals.</p>
                </div>
              )}
            </div>

            {/* Leads Widget */}
            <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Leads</span>
                <span className="text-slate-600 hover:text-slate-400 text-xs font-bold cursor-default">View all</span>
              </div>
              <div className="py-6 flex flex-col items-center justify-center text-center">
                <p className="text-slate-400 text-xs font-medium">You have no leads.</p>
              </div>
            </div>

            {/* Properties Widget */}
            <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">Properties</span>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Units</span>
                    <span className="font-bold">{ownerListings.filter(l => l.type === 'apartment' || l.type === 'studio').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Single family homes</span>
                    <span className="font-bold">{ownerListings.filter(l => l.type === 'house' || l.type === 'villa').length}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between text-xs">
                <span className="text-slate-400 font-bold uppercase">TOTAL</span>
                <span className="font-extrabold text-emerald-400">{ownerListings.length}</span>
              </div>
            </div>

            {/* Occupancy Widget */}
            <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between items-center text-center relative overflow-hidden group">
              <div className="w-full text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Occupancy</span>
              </div>
              <div className="py-3 flex flex-col items-center justify-center">
                <div className="relative flex items-center justify-center">
                  {/* Styled simulated radial ring */}
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle cx="40" cy="40" r="34" stroke="#1e293b" strokeWidth="6" fill="transparent" />
                    <circle 
                      cx="40" 
                      cy="40" 
                      r="34" 
                      stroke="#10b981" 
                      strokeWidth="6" 
                      fill="transparent" 
                      strokeDasharray="213.6" 
                      strokeDashoffset={213.6 - (213.6 * (stats.activeListingsCount > 0 ? stats.occupancyRate : 0)) / 100}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <span className="absolute text-base font-extrabold text-white">
                    {stats.activeListingsCount > 0 ? stats.occupancyRate : 0}%
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mt-3 block">OCCUPIED</span>
              </div>
            </div>
          </div>

          {/* Row 4: Calendar, Cash on cash return, Property valuation */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Calendar Widget */}
            <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="text-sm font-bold flex items-center gap-2">
                  <Calendar className="h-4.5 w-4.5 text-blue-400" />
                  <span>July 2026</span>
                </h4>
                <button
                  onClick={() => setActiveSubTab('bookings')}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
                >
                  Open calendar
                </button>
              </div>

              {/* Dynamic Calendar Grid */}
              <div className="text-center">
                <div className="grid grid-cols-7 text-[10px] font-bold text-slate-500 uppercase mb-2">
                  <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                </div>
                <div className="grid grid-cols-7 text-xs gap-y-1 bg-slate-950/40 p-2 rounded-2xl border border-slate-850">
                  {/* July 2026 starts on Wednesday, so 3 empty blocks */}
                  <span className="text-slate-800"></span>
                  <span className="text-slate-800"></span>
                  <span className="text-slate-800"></span>
                  {[...Array(31)].map((_, idx) => {
                    const day = idx + 1;
                    const isToday = day === 4; // Simulated July 4, 2026
                    return (
                      <span 
                        key={day} 
                        className={`py-1 rounded-md transition ${
                          isToday ? 'bg-emerald-600 text-white font-extrabold' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                        }`}
                      >
                        {day}
                      </span>
                    );
                  })}
                </div>
              </div>
              <p className="text-[10px] text-slate-500 text-center font-medium italic">No events for the selected month</p>
            </div>

            {/* Cash on Cash Return */}
            <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-[-20%] right-[-10%] w-32 h-32 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-4">Cash on cash return</span>
                <p className="text-4xl font-black text-emerald-400">0%</p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-500 font-medium">
                Trailing 12-month
              </div>
            </div>

            {/* Property Valuation */}
            <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-4">Property valuation</span>
                
                <div className="flex items-baseline gap-2">
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">NET GAIN</span>
                  <span className="text-base font-extrabold text-emerald-400">USD 0</span>
                  <span className="text-xs font-semibold text-emerald-500/80">(0%)</span>
                </div>
              </div>

              <div className="mt-4 space-y-2.5 pt-4 border-t border-slate-800 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>CURRENT VALUATION:</span>
                  <span className="font-bold text-white">USD 0</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>PURCHASE PRICE:</span>
                  <span className="font-bold text-white">USD 0</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* SUB-TAB: MY LISTINGS GRID */}
      {activeSubTab === 'listings' && (
        <div className="space-y-4" id="subtab-panel-listings">
          {ownerListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ownerListings.map((property) => (
                <div 
                  key={property.id} 
                  id={`owner-property-card-${property.id}`}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between"
                >
                  <div className="relative aspect-video bg-gray-50">
                    <img src={property.image} alt={property.title} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    <button
                      id={`btn-delete-${property.id}`}
                      onClick={async () => {
                        if (window.confirm('Are you absolutely sure you want to remove this property listing from the live rental network?')) {
                          await onDeleteListing(property.id);
                        }
                      }}
                      className="absolute top-3 right-3 bg-white hover:bg-rose-50 text-gray-600 hover:text-rose-600 p-2 rounded-xl shadow-sm border border-gray-100 transition-colors cursor-pointer"
                      title="Remove Property"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <span className="absolute bottom-3 left-3 bg-gray-900/80 backdrop-blur-xs text-white text-[10px] font-sans font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                      {property.type}
                    </span>
                  </div>

                  <div className="p-4 space-y-2.5">
                    <h4 className="font-sans font-bold text-gray-900 text-base leading-snug truncate">{property.title}</h4>
                    <div className="flex items-center text-xs text-gray-500 font-sans">
                      <MapPin className="h-3.5 w-3.5 mr-1 text-gray-400" />
                      <span>{property.location}</span>
                    </div>

                    <div className="flex justify-between items-baseline pt-2 border-t border-gray-50">
                      <span className="text-sm font-sans font-bold text-gray-900">${property.price} / night</span>
                      <span className="text-[10px] text-gray-400 font-mono">Rating: {property.rating.toFixed(1)} ★</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center space-y-4 max-w-sm mx-auto">
              <Building className="h-10 w-10 text-gray-400 mx-auto" />
              <h4 className="font-sans font-bold text-gray-800 text-base">No active listings</h4>
              <p className="text-xs text-gray-500">You haven't listed any real-estate properties for rental yet. Get started by clicking list below.</p>
              <button
                id="empty-listings-create-btn"
                onClick={() => setActiveSubTab('add')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer"
              >
                List My First Property
              </button>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB: GUEST STAYS QUEUE */}
      {activeSubTab === 'bookings' && (
        <div className="space-y-4" id="subtab-panel-bookings">
          {ownerBookings.length > 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider font-sans">
                      <th className="p-4">Listing Space</th>
                      <th className="p-4">Guest / Renter</th>
                      <th className="p-4">Stay Period</th>
                      <th className="p-4">Paid Total</th>
                      <th className="p-4">State Status</th>
                      <th className="p-4 text-right">Approval controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-sm">
                    {ownerBookings.map((booking) => (
                      <tr key={booking.id} id={`owner-queue-row-${booking.id}`} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 font-sans font-semibold text-gray-900 truncate max-w-[180px]">
                          {booking.listingTitle}
                        </td>
                        <td className="p-4">
                          <span className="font-sans font-medium text-gray-800">{booking.renterName}</span>
                        </td>
                        <td className="p-4 font-sans text-xs text-gray-500">
                          {booking.startDate} &rarr; {booking.endDate} <span className="block font-mono text-[10px]">({booking.nights} nights)</span>
                        </td>
                        <td className="p-4">
                          <span className="font-sans font-bold text-gray-900">${booking.totalPrice}</span>
                        </td>
                        <td className="p-4">
                          <span className={`text-[10px] font-sans font-bold tracking-wider uppercase px-2 py-0.5 rounded-md border ${
                            booking.status === 'approved' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                              : booking.status === 'pending'
                                ? 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse'
                                : booking.status === 'declined'
                                  ? 'bg-rose-50 text-rose-700 border-rose-100'
                                  : 'bg-gray-100 text-gray-600 border-gray-200'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {booking.status === 'pending' ? (
                            <div className="flex gap-1.5 justify-end">
                              <button
                                id={`queue-decline-${booking.id}`}
                                onClick={async () => {
                                  if (window.confirm('Reject this reservation stay?')) {
                                    await onUpdateBookingStatus(booking.id, 'declined');
                                  }
                                }}
                                className="bg-rose-50 hover:bg-rose-100 border border-rose-200/50 text-rose-700 p-1.5 rounded-lg transition-colors cursor-pointer"
                                title="Reject Request"
                              >
                                <XCircle className="h-4.5 w-4.5" />
                              </button>
                              <button
                                id={`queue-approve-${booking.id}`}
                                onClick={async () => {
                                  await onUpdateBookingStatus(booking.id, 'approved');
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 rounded-lg shadow-xs transition-colors cursor-pointer"
                                title="Approve Request"
                              >
                                <CheckCircle className="h-4.5 w-4.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-gray-400 font-mono">Processed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center space-y-4 max-w-sm mx-auto">
              <CalendarCheck2 className="h-10 w-10 text-gray-400 mx-auto" />
              <h4 className="font-sans font-bold text-gray-800 text-base">Stay requests queue empty</h4>
              <p className="text-xs text-gray-500">Guests haven't requested bookings on your active properties yet.</p>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB: MAINTENANCE & DISPATCH */}
      {activeSubTab === 'maintenance' && (
        <div className="space-y-4" id="subtab-panel-maintenance">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Open Alerts</span>
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              </div>
              <p className="mt-3 text-2xl font-extrabold text-gray-900">{dispatchSummary.openCount}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">In Review</span>
                <Clock3 className="h-4 w-4 text-blue-500" />
              </div>
              <p className="mt-3 text-2xl font-extrabold text-gray-900">{dispatchSummary.reviewCount}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Resolved</span>
                <CheckCircle className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="mt-3 text-2xl font-extrabold text-gray-900">{dispatchSummary.resolvedCount}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center gap-2">
              <Wrench className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-semibold text-gray-900">Dispatch Queue</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {maintenanceRequests.map((request) => (
                <div key={request.id} className="p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{request.property}</p>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${request.priority === 'high' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>
                        {request.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{request.guest} • {request.issue}</p>
                    <p className="text-[11px] text-gray-400 mt-1">Updated {request.updatedAt}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${request.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700' : request.status === 'In Review' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>
                      {request.status}
                    </span>
                    <select
                      value={request.status}
                      onChange={(event) => handleMaintenanceStatusChange(request.id, event.target.value)}
                      className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-2 text-xs text-gray-700"
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

      {/* SUB-TAB: PUBLISH NEW LISTING */}
      {activeSubTab === 'add' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xs max-w-2xl mx-auto" id="subtab-panel-publish">
          <div className="border-b border-gray-100 p-5 flex justify-between items-center bg-slate-50 rounded-t-3xl">
            <div>
              <h3 className="font-sans font-bold text-gray-900 text-base">New Property Publication Wizard</h3>
              <p className="text-xs text-gray-500 font-sans mt-0.5">Publish your luxury spaces to the marketplace networks instantly.</p>
            </div>
            <PlusCircle className="h-6 w-6 text-emerald-600" />
          </div>

          <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
            
            {formSuccess && (
              <div id="publish-success-message" className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-4 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span>Listing published live to networks successfully!</span>
              </div>
            )}

            {formError && (
              <div id="publish-error-message" className="bg-rose-50 border border-rose-100 text-rose-800 p-4 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-2">
                <XCircle className="h-5 w-5 text-rose-600" />
                <span>{formError}</span>
              </div>
            )}

            {/* Core Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="publish-title" className="text-xs font-semibold text-gray-600">Property Title *</label>
                <input
                  id="publish-title"
                  type="text"
                  required
                  placeholder="e.g. Architectural Cliffside Villa"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full mt-1.5 px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl font-sans text-sm focus:outline-hidden focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label htmlFor="publish-type" className="text-xs font-semibold text-gray-600">Property Category</label>
                <select
                  id="publish-type"
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full mt-1.5 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-sans text-xs focus:outline-hidden focus:border-emerald-500 focus:bg-white capitalize"
                >
                  <option value="apartment">apartment</option>
                  <option value="villa">villa</option>
                  <option value="house">house</option>
                  <option value="studio">studio</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="publish-description" className="text-xs font-semibold text-gray-600">Property Description *</label>
                <textarea
                  id="publish-description"
                  required
                  rows={3}
                  placeholder="Tell potential guests what makes this listing unique and distinct. Highlight views, specific design elements, or exceptional layout aspects."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full mt-1.5 px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl font-sans text-sm focus:outline-hidden focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label htmlFor="publish-location" className="text-xs font-semibold text-gray-600">Location Address *</label>
                <input
                  id="publish-location"
                  type="text"
                  required
                  placeholder="e.g. Aspen, Colorado"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full mt-1.5 px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl font-sans text-sm focus:outline-hidden focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label htmlFor="publish-price" className="text-xs font-semibold text-gray-600">Rent Price (USD / night) *</label>
                <input
                  id="publish-price"
                  type="number"
                  required
                  min="10"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full mt-1.5 px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl font-sans text-sm focus:outline-hidden focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label htmlFor="publish-beds" className="text-xs font-semibold text-gray-600">Beds count</label>
                <input
                  id="publish-beds"
                  type="number"
                  min="1"
                  value={beds}
                  onChange={(e) => setBeds(Number(e.target.value))}
                  className="w-full mt-1.5 px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl font-sans text-sm focus:outline-hidden focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label htmlFor="publish-baths" className="text-xs font-semibold text-gray-600">Baths count</label>
                <input
                  id="publish-baths"
                  type="number"
                  min="1"
                  step="0.5"
                  value={baths}
                  onChange={(e) => setBaths(Number(e.target.value))}
                  className="w-full mt-1.5 px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl font-sans text-sm focus:outline-hidden focus:border-emerald-500 focus:bg-white"
                />
              </div>
            </div>

            {/* High Res Image select helper */}
            <div className="space-y-3">
              <div>
                <label htmlFor="publish-image-url" className="text-xs font-semibold text-gray-600 block">Cover Image URL *</label>
                <div className="flex flex-col sm:flex-row gap-2 mt-1.5">
                  <input
                    id="publish-image-url"
                    type="text"
                    required
                    placeholder="https://images.unsplash.com/photo-... or select a local file"
                    value={imageUrl.startsWith('data:image/') ? '[Local Uploaded Image]' : imageUrl}
                    onChange={(e) => {
                      if (!e.target.value.startsWith('[Local')) {
                        setImageUrl(e.target.value);
                      }
                    }}
                    className="flex-1 px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl font-sans text-sm focus:outline-hidden focus:border-emerald-500 focus:bg-white"
                  />
                  <label className="flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl font-sans font-medium text-xs cursor-pointer transition-all shrink-0">
                    <Upload className="h-4 w-4" />
                    <span>Upload Local File</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (typeof reader.result === 'string') {
                              setImageUrl(reader.result);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
                {imageUrl.startsWith('data:image/') && (
                  <div className="mt-2 flex items-center justify-between p-2 bg-emerald-50/50 border border-emerald-100 rounded-lg">
                    <span className="text-[11px] text-emerald-800 font-medium font-mono truncate max-w-[80%]">Local image loaded successfully!</span>
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="text-[10px] text-red-600 hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
              
              {/* Presets picker */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-gray-400 uppercase font-sans font-bold block">Or Quick Select Curated Preset Image:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRESET_IMAGES.map((img) => (
                    <button
                      key={img.name}
                      id={`btn-preset-${img.name.toLowerCase().replace(/\s+/g, '-')}`}
                      type="button"
                      onClick={() => setImageUrl(img.url)}
                      className={`p-1.5 rounded-lg border text-left flex items-center space-x-2 cursor-pointer transition-all ${
                        imageUrl === img.url
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                          : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <Image className="h-4 w-4 shrink-0 text-emerald-600" />
                      <span className="text-[10px] font-sans font-medium truncate">{img.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Amenities Creator */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-gray-600 block">List of Amenities</label>
              <div className="flex gap-2">
                <input
                  id="publish-amenity-input"
                  type="text"
                  placeholder="e.g. Ocean View, Smart TV, Chef Kitchen"
                  value={customAmenity}
                  onChange={(e) => setCustomAmenity(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddAmenity(); } }}
                  className="flex-grow px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl font-sans text-sm focus:outline-hidden focus:border-emerald-500"
                />
                <button
                  id="add-amenity-btn"
                  type="button"
                  onClick={handleAddAmenity}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-xs font-semibold px-4 py-2 rounded-xl"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1.5">
                {amenities.map((amenity, idx) => (
                  <span key={idx} className="bg-gray-50 text-gray-600 border border-gray-200 text-xs font-sans px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
                    <span>{amenity}</span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveAmenity(amenity)}
                      className="hover:text-rose-600 text-gray-400 font-bold focus:outline-hidden"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Submit btn */}
            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                id="submit-new-listing"
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-extrabold text-sm px-6 py-3 rounded-xl shadow-md cursor-pointer transition-colors"
              >
                Publish Listing
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
};
