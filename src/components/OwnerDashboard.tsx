import React, { useState, useMemo } from 'react';
import { PropertyListing, Booking } from '../types';
import { 
  Building2, LayoutGrid, Users, PieChart, Wrench, Sparkles, MapPin, RefreshCw, Upload, 
  Image, Trash2, CalendarCheck2, XCircle, CheckCircle, Clock3, AlertTriangle, 
  ChevronDown, ChevronRight, DollarSign, Calendar, Search, ArrowLeft, ArrowUpRight, 
  TrendingUp, Info, User, HelpCircle, FileText, Bell, Lightbulb, Menu, Plus
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

type SidebarTab = 'dashboard' | 'organisation' | 'properties' | 'reports' | 'find-tenants' | 'integrations' | 'maintenance' | 'contacts';

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({
  listings,
  bookings,
  onCreateListing,
  onDeleteListing,
  onUpdateBookingStatus,
  loading,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<SidebarTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [propertyFilter, setPropertyFilter] = useState<'all' | 'villa' | 'office' | 'realestate' | 'apartment'>('all');
  const [showAddPropertyModal, setShowAddPropertyModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'house' | 'apartment' | 'villa' | 'studio' | 'office' | 'realestate'>('villa');
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
    { id: 'req-101', property: 'Office Suite A - Downtown', guest: 'Talia S. (TechCorp)', issue: 'HVAC cooling sporadic after midnight', priority: 'high', status: 'Open', updatedAt: '12 min ago' },
    { id: 'req-102', property: 'Luxury Villa - Malibu', guest: 'Mina K.', issue: 'Smart lock battery warning', priority: 'medium', status: 'In Progress', updatedAt: '37 min ago' },
    { id: 'req-103', property: 'Commercial Showroom - Plaza', guest: 'Noah R.', issue: 'Front display light fixtures flickering', priority: 'high', status: 'Completed', updatedAt: '1 hr ago' },
  ]);
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [maintenancePropFilter, setMaintenancePropFilter] = useState('All Properties');
  const [maintenancePriorityFilter, setMaintenancePriorityFilter] = useState('All Priorities');
  const [newRequestForm, setNewRequestForm] = useState({ property: '', issue: '', guest: '', priority: 'medium' });

  const PRESET_IMAGES = [
    { name: "Executive Office", url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80" },
    { name: "Luxury Villa", url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80" },
    { name: "Commercial Retail", url: "https://images.unsplash.com/photo-1555421689-491a97ff2040?auto=format&fit=crop&w=1200&q=80" },
    { name: "Modern Loft", url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80" }
  ];

  // Calculate Owner Analytics (Filtered for listings owned by this owner)
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

  // Financial splits by property types
  const typeEarnings = useMemo(() => {
    const splits = { villa: 0, office: 0, realestate: 0, apartment: 0 };
    ownerBookings
      .filter(b => b.paymentStatus === 'paid' && b.status !== 'declined' && b.status !== 'cancelled')
      .forEach(b => {
        const prop = ownerListings.find(l => l.id === b.listingId);
        if (prop) {
          const t = prop.type;
          if (t === 'villa' || t === 'house') splits.villa += b.totalPrice;
          else if (t === 'office') splits.office += b.totalPrice;
          else if (t === 'realestate') splits.realestate += b.totalPrice;
          else splits.apartment += b.totalPrice;
        }
      });
    return splits;
  }, [ownerBookings, ownerListings]);

  const filteredPropertiesList = useMemo(() => {
    if (propertyFilter === 'all') return ownerListings;
    return ownerListings.filter(p => {
      if (propertyFilter === 'villa') return p.type === 'villa' || p.type === 'house';
      if (propertyFilter === 'office') return p.type === 'office';
      if (propertyFilter === 'realestate') return p.type === 'realestate';
      return p.type === 'apartment' || p.type === 'studio';
    });
  }, [ownerListings, propertyFilter]);

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

  const handleNewRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequestForm.property.trim() || !newRequestForm.issue.trim()) return;
    const newReq = {
      id: `req-${Date.now()}`,
      property: newRequestForm.property,
      guest: newRequestForm.guest || 'Unassigned',
      issue: newRequestForm.issue,
      priority: newRequestForm.priority,
      status: 'Open',
      updatedAt: 'just now',
    };
    setMaintenanceRequests((prev) => [newReq, ...prev]);
    setNewRequestForm({ property: '', issue: '', guest: '', priority: 'medium' });
    setShowNewRequestModal(false);
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
        setShowAddPropertyModal(false);
        setActiveTab('properties');
      }, 1200);
    } catch (err) {
      setFormError('Failed to publish listing. Please try again.');
    }
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutGrid className="h-5 w-5" /> },
    { id: 'organisation', label: 'Organisation', icon: <Building2 className="h-5 w-5" /> },
    { id: 'properties', label: 'Properties', icon: <Home className="h-5 w-5" /> },
    { id: 'reports', label: 'Reports', icon: <PieChart className="h-5 w-5" /> },
    { id: 'find-tenants', label: 'Find Tenants', icon: <Users className="h-5 w-5" /> },
    { id: 'integrations', label: 'Integrations', icon: <Sparkles className="h-5 w-5" /> },
    { id: 'maintenance', label: 'Maintenance', icon: <Wrench className="h-5 w-5" /> },
    { id: 'contacts', label: 'Contacts', icon: <FileText className="h-5 w-5" /> },
  ] as const;

  return (
    <div className="flex flex-col lg:flex-row bg-[#f8fafc] min-h-[90vh] rounded-3xl overflow-hidden border border-slate-200/60 shadow-lg font-sans">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className={`bg-[#0c1a30] text-slate-300 transition-all duration-300 ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'} w-full lg:flex lg:flex-col shrink-0`}>
        {/* Sidebar Logo Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 text-white p-2 rounded-xl">
              <Building2 className="h-5 w-5" />
            </div>
            {!sidebarCollapsed && (
              <span className="font-extrabold text-white text-base tracking-tight">
                RentHub<span className="text-emerald-400">Studio</span>
              </span>
            )}
          </div>
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:block text-slate-500 hover:text-white p-1 hover:bg-slate-800 rounded-lg cursor-pointer"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible shrink-0 lg:shrink">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSelectedReport(null);
              }}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer whitespace-nowrap lg:whitespace-normal ${
                activeTab === item.id 
                  ? 'bg-emerald-500/10 text-emerald-400 border-l-4 border-emerald-500 font-bold' 
                  : 'hover:bg-slate-800/40 hover:text-slate-100'
              }`}
            >
              {item.icon}
              {(!sidebarCollapsed || window.innerWidth < 1024) && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* MAIN VIEW CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* LandlordStudio trial warning banner at the top */}
        <div className="bg-[#ff9f00] text-white py-2 px-4 text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-sm">
          <Info className="h-4 w-4 fill-white text-[#ff9f00]" />
          <span>Trial ends in 14 days. <span className="underline cursor-pointer hover:text-amber-50">Upgrade Now</span></span>
        </div>

        {/* TOP INTERACTIVE CONTROLS BAR */}
        <header className="bg-white border-b border-slate-200/80 px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-800 capitalize">
              {activeTab === 'dashboard' ? 'Overview' : activeTab.replace('-', ' ')}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={onRefresh}
              className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200 rounded-xl cursor-pointer"
              title="Sync Database"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* Profile Dropdown Simulation */}
            <div className="flex items-center gap-2.5 border-l border-slate-200 pl-4">
              <div className="bg-emerald-50 text-emerald-700 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-xs">
                yM
              </div>
              <div className="hidden sm:block text-left text-xs leading-none">
                <p className="font-bold text-slate-800">Yosef Melaku</p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">Premium Landlord</p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </div>
          </div>
        </header>

        {/* SUB-VIEW CONDITIONAL RENDER */}
        <main className="p-6 overflow-y-auto max-w-7xl w-full mx-auto space-y-6">
          
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs relative overflow-hidden group">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Gross Rent Received</span>
                    <span className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl">
                      <DollarSign className="h-5 w-5" />
                    </span>
                  </div>
                  <p className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900">USD {stats.totalEarnings.toFixed(2)}</p>
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <span>Active bookings value</span>
                    <span className="font-bold text-emerald-600">USD {stats.totalEarnings.toFixed(0)}</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs relative overflow-hidden group">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Upcoming Payments</span>
                    <span className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
                      <Clock3 className="h-5 w-5" />
                    </span>
                  </div>
                  <p className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900">USD 0.00</p>
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <span>Scheduled leases</span>
                    <span className="font-semibold text-blue-600">0 payments due</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs relative overflow-hidden group">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Rent Overdue</span>
                    <span className="p-2.5 bg-rose-50 text-rose-600 rounded-2xl">
                      <AlertTriangle className="h-5 w-5" />
                    </span>
                  </div>
                  <p className="mt-5 text-3xl font-extrabold tracking-tight text-rose-600">USD 0.00</p>
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <span>Alert level</span>
                    <span className="font-bold text-rose-600">0 unpaid items</span>
                  </div>
                </div>
              </div>

              {/* Cashflow & Financial splits */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Cashflow Graphic */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs lg:col-span-2 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-emerald-500" />
                        <span>Cashflow Ledger</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5 font-medium">Income and operational expenses overview.</p>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                      <span className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg">1 Jan 2026</span>
                      <span>to</span>
                      <span className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg">31 Dec 2026</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl text-center border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">INCOME</span>
                      <span className="text-lg font-extrabold text-slate-800 mt-1 block">USD {stats.totalEarnings.toFixed(0)}</span>
                    </div>
                    <div className="border-x border-slate-200">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">EXPENSES</span>
                      <span className="text-lg font-extrabold text-rose-500 mt-1 block">USD 0</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">NET EARNINGS</span>
                      <span className="text-lg font-extrabold text-emerald-600 mt-1 block">USD {stats.totalEarnings.toFixed(0)}</span>
                    </div>
                  </div>

                  {/* Simulated monthly bar graphs */}
                  <div className="pt-2">
                    <div className="flex items-end justify-between h-24 gap-2.5">
                      {['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'].map((month, i) => {
                        const isCurrent = month === 'JUL';
                        const heightClass = stats.totalEarnings > 0 && i === 6 ? 'h-full bg-emerald-500 shadow-md' : 'h-[6px] bg-slate-200';
                        return (
                          <div key={month} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                            <div className="w-full bg-slate-50 rounded-lg flex items-end h-16 overflow-hidden relative border border-slate-200/50">
                              <div className={`w-full transition-all duration-500 rounded-t ${heightClass}`} />
                            </div>
                            <span className={`text-[9px] font-bold ${isCurrent ? 'text-emerald-500' : 'text-slate-400'}`}>{month}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Categorized splits: Villa, Office, Realestate */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                      <PieChart className="h-5 w-5 text-indigo-500" />
                      <span>Leasing Splits</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Earnings split by asset categories.</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs border-b border-slate-50 pb-2">
                      <span className="text-slate-500 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        Houses & Villas
                      </span>
                      <span className="font-bold text-slate-800">USD {typeEarnings.villa.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs border-b border-slate-50 pb-2">
                      <span className="text-slate-500 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                        Office Spaces
                      </span>
                      <span className="font-bold text-slate-800">USD {typeEarnings.office.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs border-b border-slate-50 pb-2">
                      <span className="text-slate-500 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        Commercial Real Estate
                      </span>
                      <span className="font-bold text-slate-800">USD {typeEarnings.realestate.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs pb-2">
                      <span className="text-slate-500 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                        Apartments & Studios
                      </span>
                      <span className="font-bold text-slate-800">USD {typeEarnings.apartment.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Occupancy Performance</p>
                    <p className="text-3xl font-extrabold text-slate-800 mt-2">
                      {stats.activeListingsCount > 0 ? stats.occupancyRate : 0}%
                    </p>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: ORGANISATION */}
          {activeTab === 'organisation' && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xs space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Organisation Management</h3>
                <p className="text-sm text-slate-500 mt-1">Configure company profiles, lease systems, and billing tiers.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Organisation Name</label>
                    <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 font-semibold">
                      Melaku Property Management Ltd
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Primary Administrator</label>
                    <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                      Yosef Melaku (yosefmelaku9876@gmail.com)
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200/50 p-6 rounded-3xl flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 px-3 py-1 rounded-full">
                      Professional Plan
                    </span>
                    <h4 className="text-lg font-bold text-slate-800 mt-2">Evaluation Period</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      You are currently testing the multi-tenant real estate module suite with access to unlimited offices, villas, and reporting ledgers.
                    </p>
                  </div>
                  <button className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-3 rounded-2xl mt-6 cursor-pointer shadow-xs">
                    Upgrade Account License
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PROPERTIES (CATEGORIZED) */}
          {activeTab === 'properties' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Controls bar: Category filter + Add Button */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200/80 p-4 rounded-3xl shadow-xs">
                
                {/* Category filters */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'all', label: 'All Assets' },
                    { id: 'villa', label: 'Houses & Villas' },
                    { id: 'office', label: 'Office Spaces' },
                    { id: 'realestate', label: 'Commercial Real Estate' },
                    { id: 'apartment', label: 'Apartments' },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setPropertyFilter(filter.id as any)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        propertyFilter === filter.id 
                          ? 'bg-emerald-500 text-white shadow-xs' 
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowAddPropertyModal(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4.5 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5 shrink-0 transition-all shadow-xs"
                >
                  <Plus className="h-4 w-4" />
                  <span>List New Property</span>
                </button>
              </div>

              {/* Grid lists */}
              {filteredPropertiesList.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPropertiesList.map((property) => (
                    <div 
                      key={property.id} 
                      className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div className="relative aspect-video bg-slate-50">
                        <img src={property.image} alt={property.title} className="w-full h-full object-cover" />
                        <button
                          onClick={async () => {
                            if (window.confirm('Are you absolutely sure you want to remove this property listing from the live rental network?')) {
                              await onDeleteListing(property.id);
                            }
                          }}
                          className="absolute top-3 right-3 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 p-2 rounded-xl shadow-sm border border-slate-100 transition-colors cursor-pointer"
                          title="Remove Property"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <span className="absolute bottom-3 left-3 bg-[#0c1a30]/80 backdrop-blur-xs text-white text-[10px] font-sans font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider">
                          {property.type === 'realestate' ? 'Commercial' : property.type}
                        </span>
                      </div>

                      <div className="p-5 space-y-3">
                        <h4 className="font-bold text-slate-800 text-base truncate">{property.title}</h4>
                        <div className="flex items-center text-xs text-slate-400 font-medium">
                          <MapPin className="h-3.5 w-3.5 mr-1 text-slate-300" />
                          <span className="truncate">{property.location}</span>
                        </div>

                        <div className="flex justify-between items-baseline pt-3 border-t border-slate-100">
                          <span className="text-sm font-bold text-slate-800">${property.price} / night</span>
                          <span className="text-[10px] text-slate-400 font-mono">Rating: {property.rating.toFixed(1)} ★</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center space-y-4 max-w-sm mx-auto shadow-xs">
                  <Building2 className="h-10 w-10 text-slate-400 mx-auto" />
                  <h4 className="font-bold text-slate-800 text-base">No active listings</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    You haven't listed any real-estate properties matching this filter. Get started by clicking list below.
                  </p>
                  <button
                    onClick={() => setShowAddPropertyModal(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer"
                  >
                    List My First Property
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: REPORTS (Matches screenshot exactly!) */}
          {activeTab === 'reports' && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Reports Section */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Reports</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* P&L Summary */}
                  <button 
                    onClick={() => setSelectedReport('p&l')}
                    className="flex items-start gap-4 p-5 rounded-3xl border border-slate-200/80 bg-white hover:border-emerald-500 hover:bg-emerald-500/5 hover:shadow-md transition text-left cursor-pointer group w-full"
                  >
                    <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl group-hover:bg-blue-500 group-hover:text-white transition">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-800 text-sm group-hover:text-emerald-700 transition">P&L Summary</h4>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        This report shows a one line summary of the total income and expense assigned to a property.
                      </p>
                    </div>
                  </button>

                  {/* Income Expense Statement */}
                  <button 
                    onClick={() => setSelectedReport('income-expense')}
                    className="flex items-start gap-4 p-5 rounded-3xl border border-slate-200/80 bg-white hover:border-emerald-500 hover:bg-emerald-500/5 hover:shadow-md transition text-left cursor-pointer group w-full"
                  >
                    <div className="bg-indigo-50 text-indigo-600 p-3 rounded-2xl group-hover:bg-indigo-500 group-hover:text-white transition">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-800 text-sm group-hover:text-emerald-700 transition">Income Expense Statement</h4>
                          <span className="bg-slate-200 text-slate-600 font-mono text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider scale-90 shrink-0">Legacy</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        This report shows details of income & expenses (incl. running balance) assigned to each property.
                      </p>
                    </div>
                  </button>

                  {/* Breakdown Statement */}
                  <button 
                    onClick={() => setSelectedReport('breakdown')}
                    className="flex items-start gap-4 p-5 rounded-3xl border border-slate-200/80 bg-white hover:border-emerald-500 hover:bg-emerald-500/5 hover:shadow-md transition text-left cursor-pointer group w-full"
                  >
                    <div className="bg-slate-100 text-slate-600 p-3 rounded-2xl group-hover:bg-slate-600 group-hover:text-white transition">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-800 text-sm group-hover:text-emerald-700 transition">Breakdown Statement</h4>
                          <span className="bg-slate-200 text-slate-600 font-mono text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider scale-90 shrink-0">Legacy</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        This report shows the income and expenses assigned to each property grouped by category.
                      </p>
                    </div>
                  </button>

                  {/* Schedule E */}
                  <button 
                    onClick={() => setSelectedReport('schedule-e')}
                    className="flex items-start gap-4 p-5 rounded-3xl border border-slate-200/80 bg-white hover:border-emerald-500 hover:bg-emerald-500/5 hover:shadow-md transition text-left cursor-pointer group w-full"
                  >
                    <div className="bg-slate-100 text-slate-600 p-3 rounded-2xl group-hover:bg-slate-600 group-hover:text-white transition">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-800 text-sm group-hover:text-emerald-700 transition">Schedule E</h4>
                          <span className="bg-slate-200 text-slate-600 font-mono text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider scale-90 shrink-0">Legacy</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        This report makes filing Schedule E easy. It groups multi-units and displays your income & expense by category.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Rent Payments Section */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Rent Payments</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Rent Ledger */}
                  <button 
                    onClick={() => setSelectedReport('rent-ledger')}
                    className="flex items-start gap-4 p-5 rounded-3xl border border-slate-200/80 bg-white hover:border-emerald-500 hover:bg-emerald-500/5 hover:shadow-md transition text-left cursor-pointer group w-full"
                  >
                    <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl group-hover:bg-emerald-500 group-hover:text-white transition">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-800 text-sm group-hover:text-emerald-700 transition">Rent Ledger</h4>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Provides a complete list of payments due versus payments logged over a specified time period. Unlike other reports which are cash basis, this report is generated on **accrual basis**.
                      </p>
                    </div>
                  </button>

                  {/* Overdue Rent Payments */}
                  <button 
                    onClick={() => setSelectedReport('overdue-payments')}
                    className="flex items-start gap-4 p-5 rounded-3xl border border-slate-200/80 bg-white hover:border-emerald-500 hover:bg-emerald-500/5 hover:shadow-md transition text-left cursor-pointer group w-full"
                  >
                    <div className="bg-rose-50 text-rose-600 p-3 rounded-2xl group-hover:bg-rose-500 group-hover:text-white transition">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-800 text-sm group-hover:text-emerald-700 transition">Overdue Rent Payments</h4>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        This report shows a list of all overdue rent payments and late fees in your selected time period.
                      </p>
                    </div>
                  </button>

                  {/* Rent Payment Difference */}
                  <button 
                    onClick={() => setSelectedReport('rent-diff')}
                    className="flex items-start gap-4 p-5 rounded-3xl border border-slate-200/80 bg-white hover:border-emerald-500 hover:bg-emerald-500/5 hover:shadow-md transition text-left cursor-pointer group w-full"
                  >
                    <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl group-hover:bg-emerald-500 group-hover:text-white transition">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-800 text-sm group-hover:text-emerald-700 transition">Rent Payment Difference</h4>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        View a summary of missed and overdue rent payments to spot income transaction discrepancies.
                      </p>
                    </div>
                  </button>

                  {/* Rent Changes */}
                  <button 
                    onClick={() => setSelectedReport('rent-changes')}
                    className="flex items-start gap-4 p-5 rounded-3xl border border-slate-200/80 bg-white hover:border-emerald-500 hover:bg-emerald-500/5 hover:shadow-md transition text-left cursor-pointer group w-full"
                  >
                    <div className="bg-slate-100 text-slate-600 p-3 rounded-2xl group-hover:bg-slate-600 group-hover:text-white transition">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-800 text-sm group-hover:text-emerald-700 transition">Rent Changes</h4>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        This report shows all past and scheduled changes to rent amounts for the selected properties.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: FIND TENANTS */}
          {activeTab === 'find-tenants' && (
            <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xs overflow-hidden animate-fadeIn">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-800">Rental Inquiries & Tenant Applications</h3>
                <p className="text-xs text-slate-400 mt-0.5">Collect applications, run background screening logs, and approve leases.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50/30 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="p-4">Applicant Name</th>
                      <th className="p-4">Target space</th>
                      <th className="p-4">Monthly Income</th>
                      <th className="p-4">Credit Check</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50/30 transition">
                      <td className="p-4 font-bold text-slate-800">Abebe Kebede</td>
                      <td className="p-4">Executive Office Space B</td>
                      <td className="p-4">$12,000 / mo</td>
                      <td className="p-4 text-emerald-600 font-semibold">Passed (Score: 780)</td>
                      <td className="p-4">
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-100">Approved</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/30 transition">
                      <td className="p-4 font-bold text-slate-800">Sarah Jenkins</td>
                      <td className="p-4">Luxury Ocean Villa</td>
                      <td className="p-4">$18,500 / mo</td>
                      <td className="p-4 text-emerald-600 font-semibold">Passed (Score: 810)</td>
                      <td className="p-4">
                        <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-100 animate-pulse">Under Review</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/30 transition">
                      <td className="p-4 font-bold text-slate-800">John Doe Corp</td>
                      <td className="p-4">Commercial Plaza Showroom</td>
                      <td className="p-4">$45,000 / mo</td>
                      <td className="p-4 text-blue-600 font-semibold">In Progress</td>
                      <td className="p-4">
                        <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200">Submitted</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: INTEGRATIONS */}
          {activeTab === 'integrations' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Platform Integrations</h3>
                <p className="text-xs text-slate-500">Connect bookkeeping, payment processing, and calendar modules.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { name: 'Stripe Payments', desc: 'Accept online rent payments automatically.', status: 'Active', color: 'bg-emerald-50 text-emerald-700' },
                  { name: 'QuickBooks Online', desc: 'Sync cashflows and ledgers directly for tax season.', status: 'Connect', color: 'bg-slate-100 text-slate-700' },
                  { name: 'Google Calendars', desc: 'Sync checkout/check-in alerts.', status: 'Connect', color: 'bg-slate-100 text-slate-700' },
                  { name: 'DocuSign Lease', desc: 'Automate residential and commercial lease signing.', status: 'Connect', color: 'bg-slate-100 text-slate-700' },
                ].map((item) => (
                  <div key={item.name} className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-800 text-sm">{item.name}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.color}`}>{item.status}</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                    </div>
                    <button className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs py-2 rounded-xl border border-slate-200 mt-6 cursor-pointer transition">
                      Configure
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: MAINTENANCE — Kanban Board */}
          {activeTab === 'maintenance' && (() => {
            const allProps = ['All Properties', ...Array.from(new Set(maintenanceRequests.map(r => r.property)))];
            const filtered = maintenanceRequests.filter(r => {
              const propOk = maintenancePropFilter === 'All Properties' || r.property === maintenancePropFilter;
              const priOk = maintenancePriorityFilter === 'All Priorities' || r.priority === maintenancePriorityFilter;
              return propOk && priOk;
            });
            const columns: { key: string; label: string; color: string; headerColor: string }[] = [
              { key: 'Open',        label: 'NEW',         color: 'bg-slate-50',   headerColor: 'text-slate-500' },
              { key: 'In Progress', label: 'IN PROGRESS', color: 'bg-blue-50/40', headerColor: 'text-blue-600'  },
              { key: 'Completed',   label: 'COMPLETED',   color: 'bg-slate-50',   headerColor: 'text-slate-500' },
            ];

            return (
              <div className="space-y-5 animate-fadeIn">

                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Properties dropdown */}
                  <div className="relative">
                    <select
                      value={maintenancePropFilter}
                      onChange={e => setMaintenancePropFilter(e.target.value)}
                      className="appearance-none bg-white border border-slate-200 text-slate-700 text-xs font-semibold px-4 py-2.5 pr-8 rounded-xl outline-none cursor-pointer hover:border-slate-300 transition shadow-xs"
                    >
                      {allProps.map(p => <option key={p}>{p}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  </div>

                  {/* Priority dropdown */}
                  <div className="relative">
                    <select
                      value={maintenancePriorityFilter}
                      onChange={e => setMaintenancePriorityFilter(e.target.value)}
                      className="appearance-none bg-white border border-slate-200 text-slate-700 text-xs font-semibold px-4 py-2.5 pr-8 rounded-xl outline-none cursor-pointer hover:border-slate-300 transition shadow-xs"
                    >
                      {['All Priorities', 'high', 'medium', 'low'].map(p => <option key={p}>{p}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  </div>

                  <div className="flex-1" />

                  {/* New Request button */}
                  <button
                    onClick={() => setShowNewRequestModal(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    New request
                  </button>
                </div>

                {/* Kanban Board Columns */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                  {columns.map(col => {
                    const cards = filtered.filter(r => r.status === col.key);
                    return (
                      <div key={col.key} className="flex flex-col gap-3">
                        {/* Column Header */}
                        <div className={`flex items-center gap-2 ${col.headerColor}`}>
                          <span className="text-[11px] font-extrabold tracking-[0.15em] uppercase">{col.label}</span>
                          {cards.length > 0 && (
                            <span className="bg-slate-200 text-slate-600 text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{cards.length}</span>
                          )}
                        </div>

                        {/* Column body */}
                        <div className={`min-h-[280px] rounded-2xl border border-slate-200/60 p-3 ${col.color} flex flex-col gap-3`}>
                          {cards.length === 0 ? (
                            /* Empty state matching LandlordStudio */
                            <div className="flex-1 flex flex-col items-center justify-center gap-3 py-8 text-center">
                              {col.key === 'In Progress' ? (
                                <>
                                  <svg width="80" height="72" viewBox="0 0 80 72" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <ellipse cx="40" cy="60" rx="32" ry="8" fill="#e2e8f0" />
                                    <rect x="12" y="20" width="56" height="36" rx="6" fill="#cbd5e1" />
                                    <rect x="18" y="26" width="44" height="24" rx="4" fill="#e2e8f0" />
                                    <circle cx="27" cy="14" r="7" fill="#93c5fd" />
                                    <circle cx="40" cy="11" r="7" fill="#60a5fa" />
                                    <circle cx="53" cy="14" r="7" fill="#3b82f6" />
                                    <path d="M30 38 Q40 30 50 38" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" fill="none" />
                                    <circle cx="36" cy="35" r="2" fill="#94a3b8" />
                                    <circle cx="44" cy="35" r="2" fill="#94a3b8" />
                                  </svg>
                                  <p className="text-xs text-slate-400 font-medium">You have no maintenance requests</p>
                                </>
                              ) : (
                                <p className="text-xs text-slate-400 font-medium">No {col.label.toLowerCase()} requests</p>
                              )}
                            </div>
                          ) : (
                            cards.map(req => (
                              <div
                                key={req.id}
                                className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-3 hover:shadow-md transition-all"
                              >
                                {/* Card Header */}
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-xs font-bold text-slate-700 leading-snug flex-1 truncate">{req.property}</p>
                                  <span className={`shrink-0 text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                    req.priority === 'high'   ? 'bg-rose-50 text-rose-700' :
                                    req.priority === 'medium' ? 'bg-amber-50 text-amber-700' :
                                    'bg-slate-100 text-slate-500'
                                  }`}>
                                    {req.priority}
                                  </span>
                                </div>

                                {/* Issue */}
                                <p className="text-xs text-slate-500 leading-relaxed">{req.issue}</p>

                                {/* Reporter */}
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                  <User className="h-3 w-3" />
                                  <span>{req.guest}</span>
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                  <span className="text-[10px] text-slate-400">{req.updatedAt}</span>
                                  <select
                                    value={req.status}
                                    onChange={e => handleMaintenanceStatusChange(req.id, e.target.value)}
                                    className="text-[10px] font-semibold border border-slate-200 bg-slate-50 rounded-lg px-2 py-1 outline-none cursor-pointer text-slate-600 hover:border-blue-400 transition"
                                  >
                                    <option value="Open">New</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                  </select>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* New Request Modal */}
                {showNewRequestModal && (
                  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 space-y-5 relative">
                      <button
                        onClick={() => setShowNewRequestModal(false)}
                        className="absolute top-5 right-5 text-slate-400 hover:text-slate-800 cursor-pointer p-1"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                      <div>
                        <h3 className="text-xl font-extrabold text-slate-900">New Maintenance Request</h3>
                        <p className="text-xs text-slate-400 mt-1">Report an issue with one of your properties</p>
                      </div>
                      <form onSubmit={handleNewRequestSubmit} className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-600">Property *</label>
                          <input
                            type="text"
                            required
                            value={newRequestForm.property}
                            onChange={e => setNewRequestForm(f => ({ ...f, property: e.target.value }))}
                            placeholder="e.g. Luxury Villa - Malibu"
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-600">Issue Description *</label>
                          <textarea
                            required
                            rows={3}
                            value={newRequestForm.issue}
                            onChange={e => setNewRequestForm(f => ({ ...f, issue: e.target.value }))}
                            placeholder="Describe the maintenance problem…"
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition resize-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-600">Reported By</label>
                          <input
                            type="text"
                            value={newRequestForm.guest}
                            onChange={e => setNewRequestForm(f => ({ ...f, guest: e.target.value }))}
                            placeholder="e.g. Tenant Name (optional)"
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-600">Priority</label>
                          <select
                            value={newRequestForm.priority}
                            onChange={e => setNewRequestForm(f => ({ ...f, priority: e.target.value }))}
                            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 transition bg-white cursor-pointer"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        </div>
                        <button
                          type="submit"
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-3 rounded-xl cursor-pointer transition shadow-md"
                        >
                          Submit Request
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}



          {/* TAB 8: CONTACTS */}
          {activeTab === 'contacts' && (
            <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xs overflow-hidden animate-fadeIn">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-800">Leasing Contact Directory</h3>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">Keep phone numbers, emails, and address logs of clients and contractors synced.</p>
              </div>

              <div className="divide-y divide-slate-100 text-sm">
                {/* Contact list mapping */}
                <div className="p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-sky-50 text-sky-700 w-10 h-10 rounded-full flex items-center justify-center font-bold">YM</div>
                    <div>
                      <p className="font-bold text-slate-800">Yosef Melaku</p>
                      <p className="text-xs text-slate-400">Renter/Tenant • yosefmelaku9876@gmail.com</p>
                    </div>
                  </div>
                  <span className="text-xs bg-sky-50 text-sky-700 px-2.5 py-1 rounded-full border border-sky-100 font-bold uppercase tracking-wider scale-90">Tenant</span>
                </div>

                <div className="p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-50 text-emerald-700 w-10 h-10 rounded-full flex items-center justify-center font-bold">PH</div>
                    <div>
                      <p className="font-bold text-slate-800">Premium Host Inc</p>
                      <p className="text-xs text-slate-400">Real Estate Partner • partner@renthub.app</p>
                    </div>
                  </div>
                  <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-100 font-bold uppercase tracking-wider scale-90">Contractor</span>
                </div>

                <div className="p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-50 text-amber-700 w-10 h-10 rounded-full flex items-center justify-center font-bold">AK</div>
                    <div>
                      <p className="font-bold text-slate-800">Abebe Kebede</p>
                      <p className="text-xs text-slate-400">Office Tenant • abebe@techcorp.com</p>
                    </div>
                  </div>
                  <span className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-100 font-bold uppercase tracking-wider scale-90">Tenant</span>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* POPUP MODAL: ADD PROPERTY WIZARD */}
      {showAddPropertyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-fadeIn">
            <div className="border-b border-slate-100 p-5 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-base">New Rental Asset Wizard</h3>
                <p className="text-xs text-slate-500 mt-0.5">Publish your villa, office space, or commercial unit instantly.</p>
              </div>
              <button 
                onClick={() => setShowAddPropertyModal(false)}
                className="text-slate-400 hover:text-slate-900 text-xl font-bold p-1 bg-white hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
              {formSuccess && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-4 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  <span>Property listing uploaded successfully!</span>
                </div>
              )}

              {formError && (
                <div className="bg-rose-50 border border-rose-100 text-rose-850 p-4 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-2">
                  <XCircle className="h-5 w-5 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="publish-title" className="text-xs font-bold text-slate-600 block">Property Title *</label>
                  <input
                    id="publish-title"
                    type="text"
                    required
                    placeholder="e.g. Executive Corporate Center"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full mt-1.5 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label htmlFor="publish-type" className="text-xs font-bold text-slate-600 block">Asset Type</label>
                  <select
                    id="publish-type"
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full mt-1.5 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500 focus:bg-white capitalize"
                  >
                    <option value="villa">House / Villa</option>
                    <option value="office">Office Space</option>
                    <option value="realestate">Commercial Real Estate</option>
                    <option value="apartment">Apartment</option>
                    <option value="studio">Studio Room</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="publish-description" className="text-xs font-bold text-slate-600 block">Property Description *</label>
                  <textarea
                    id="publish-description"
                    required
                    rows={3}
                    placeholder="Provide details about features, lease conditions, and occupancy details."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full mt-1.5 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label htmlFor="publish-location" className="text-xs font-bold text-slate-600 block">Address Location *</label>
                  <input
                    id="publish-location"
                    type="text"
                    required
                    placeholder="e.g. Manhattan, New York"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full mt-1.5 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label htmlFor="publish-price" className="text-xs font-bold text-slate-600 block">Rent Rate (USD / night) *</label>
                  <input
                    id="publish-price"
                    type="number"
                    required
                    min="10"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full mt-1.5 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label htmlFor="publish-beds" className="text-xs font-bold text-slate-600 block">Capacity / Rooms count</label>
                  <input
                    id="publish-beds"
                    type="number"
                    min="1"
                    value={beds}
                    onChange={(e) => setBeds(Number(e.target.value))}
                    className="w-full mt-1.5 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label htmlFor="publish-baths" className="text-xs font-bold text-slate-600 block">Bathrooms count</label>
                  <input
                    id="publish-baths"
                    type="number"
                    min="1"
                    step="0.5"
                    value={baths}
                    onChange={(e) => setBaths(Number(e.target.value))}
                    className="w-full mt-1.5 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Cover Image */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-600 block">Cover Image URL *</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    required
                    placeholder="https://images.unsplash.com/photo-... or select below"
                    value={imageUrl.startsWith('data:image/') ? '[Local Image Loaded]' : imageUrl}
                    onChange={(e) => {
                      if (!e.target.value.startsWith('[Local')) setImageUrl(e.target.value);
                    }}
                    className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                  <label className="flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl font-bold text-xs cursor-pointer transition">
                    <Upload className="h-4 w-4" />
                    <span>Upload file</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (typeof reader.result === 'string') setImageUrl(reader.result);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Or select preset image:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {PRESET_IMAGES.map((img) => (
                      <button
                        key={img.name}
                        type="button"
                        onClick={() => setImageUrl(img.url)}
                        className={`p-2 rounded-xl border text-[10px] font-bold truncate text-left cursor-pointer transition ${
                          imageUrl === img.url 
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-800' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {img.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-600 block">List of Amenities</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Conference Room, Secure Parking"
                    value={customAmenity}
                    onChange={(e) => setCustomAmenity(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddAmenity(); } }}
                    className="flex-grow px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddAmenity}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1">
                  {amenities.map((amenity, idx) => (
                    <span key={idx} className="bg-slate-50 text-slate-600 border border-slate-200 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                      <span>{amenity}</span>
                      <button type="button" onClick={() => handleRemoveAmenity(amenity)} className="hover:text-rose-600 text-slate-400 font-bold">&times;</button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddPropertyModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-5 py-3 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md cursor-pointer"
                >
                  Publish Asset Listing
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL: REPORT DETAILS DIALOG (Shows high-fidelity bookkeeping details) */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-4xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-fadeIn">
            
            {/* Header */}
            <div className="border-b border-slate-100 p-6 flex justify-between items-center bg-slate-50">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 px-3 py-1 rounded-full">
                  Real Estate Report Ledger
                </span>
                <h3 className="font-bold text-slate-900 text-lg mt-2 capitalize">
                  {selectedReport.replace('-', ' ')} Statement
                </h3>
              </div>
              <button 
                onClick={() => setSelectedReport(null)}
                className="text-slate-400 hover:text-slate-900 text-xl font-bold p-1 bg-white hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Content splits by report types */}
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              
              {/* Report 1: P&L Summary */}
              {selectedReport === 'p&l' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4 text-center border-b border-slate-100 pb-6">
                    <div>
                      <span className="text-xs text-slate-400 font-bold block uppercase">Total Revenue</span>
                      <span className="text-2xl font-black text-slate-800 block mt-1">${stats.totalEarnings.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 font-bold block uppercase">Operating Costs</span>
                      <span className="text-2xl font-black text-rose-500 block mt-1">$450.00</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 font-bold block uppercase">Net Profit</span>
                      <span className="text-2xl font-black text-emerald-600 block mt-1">${(stats.totalEarnings - 450).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold text-slate-800 text-sm">Income Details</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold">
                            <th className="py-2">Source / Property</th>
                            <th className="py-2">Category</th>
                            <th className="py-2">Gross Income</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {ownerListings.map(l => {
                            const listingBookings = ownerBookings.filter(b => b.listingId === l.id && b.paymentStatus === 'paid');
                            const sum = listingBookings.reduce((s, b) => s + b.totalPrice, 0);
                            return (
                              <tr key={l.id}>
                                <td className="py-3 font-semibold text-slate-800">{l.title}</td>
                                <td className="py-3 uppercase text-[10px] text-slate-500 font-bold">{l.type}</td>
                                <td className="py-3 text-slate-850 font-bold">${sum.toFixed(2)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Report 2: Rent Ledger Statement */}
              {selectedReport === 'rent-ledger' && (
                <div className="space-y-4 animate-fadeIn">
                  <h4 className="font-bold text-slate-800 text-sm">Accrual-based booking transactions ledger</h4>
                  
                  <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                          <th className="p-3">Transaction ID</th>
                          <th className="p-3">Tenant Name</th>
                          <th className="p-3">Property Space</th>
                          <th className="p-3">Billing Dates</th>
                          <th className="p-3">Payment Status</th>
                          <th className="p-3">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {ownerBookings.map(b => (
                          <tr key={b.id} className="hover:bg-slate-50/40">
                            <td className="p-3 font-mono font-bold text-slate-400">{b.id}</td>
                            <td className="p-3 text-slate-800">{b.renterName}</td>
                            <td className="p-3 text-slate-850 font-semibold">{b.listingTitle}</td>
                            <td className="p-3 text-slate-400 font-mono">{b.startDate} &rarr; {b.endDate}</td>
                            <td className="p-3">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                b.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                              }`}>
                                {b.paymentStatus}
                              </span>
                            </td>
                            <td className="p-3 text-slate-900 font-extrabold">${b.totalPrice.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Report 3: Overdue Rent Payments */}
              {selectedReport === 'overdue-payments' && (
                <div className="space-y-4">
                  <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-rose-800 font-bold text-sm">Overdue Payment Action Required</h4>
                      <p className="text-rose-600 text-xs mt-1 leading-relaxed">
                        The following bookings have been approved but remain unpaid. Send payment link notifications to the renters.
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                          <th className="p-3">Tenant Name</th>
                          <th className="p-3">Property Unit</th>
                          <th className="p-3">Lease Period</th>
                          <th className="p-3">Due Total</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {ownerBookings.filter(b => b.paymentStatus === 'unpaid' && b.status === 'approved').map(b => (
                          <tr key={b.id} className="hover:bg-slate-50/40">
                            <td className="p-3 text-slate-800">{b.renterName}</td>
                            <td className="p-3 text-slate-850 font-semibold">{b.listingTitle}</td>
                            <td className="p-3 text-slate-400 font-mono">{b.startDate} &rarr; {b.endDate}</td>
                            <td className="p-3 text-rose-600 font-extrabold">${b.totalPrice.toFixed(2)}</td>
                            <td className="p-3 text-right">
                              <button className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1.5 rounded-lg text-[10px]">
                                Send Reminder
                              </button>
                            </td>
                          </tr>
                        ))}
                        {ownerBookings.filter(b => b.paymentStatus === 'unpaid' && b.status === 'approved').length === 0 && (
                          <tr>
                            <td colSpan={5} className="p-6 text-center text-slate-400 italic">No overdue rent payments logged for active leases.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Other reports placeholder fallbacks */}
              {['income-expense', 'breakdown', 'schedule-e', 'rent-diff', 'rent-changes'].includes(selectedReport) && (
                <div className="py-12 text-center space-y-3">
                  <PieChart className="h-10 w-10 text-slate-300 mx-auto" />
                  <h4 className="font-bold text-slate-800 text-sm">Simulated Statement Log</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                    This module is active. Real-time {selectedReport.replace('-', ' ')} logging splits require a connected QuickBooks or Stripe database to pull historical logs.
                  </p>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
