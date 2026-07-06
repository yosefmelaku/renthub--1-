import React, { useState, useMemo } from 'react';
import { PropertyListing, Booking } from '../types';
import { 
  Building2, LayoutGrid, Users, PieChart, Wrench, Sparkles, MapPin, RefreshCw, Upload, 
  Image, Trash2, CalendarCheck2, XCircle, CheckCircle, Clock3, AlertTriangle, 
  ChevronDown, ChevronRight, DollarSign, Calendar, Search, ArrowLeft, ArrowUpRight, 
  TrendingUp, Info, User, HelpCircle, FileText, Bell, Lightbulb, Menu, Plus, Home
} from 'lucide-react';

interface OwnerDashboardProps {
  listings: PropertyListing[];
  bookings: Booking[];
  onCreateListing: (listingData: Omit<PropertyListing, 'id' | 'rating' | 'reviewsCount'>) => Promise<PropertyListing>;
  onDeleteListing: (listingId: string) => Promise<void>;
  onUpdateBookingStatus: (bookingId: string, status: Booking['status']) => Promise<void>;
  loading: boolean;
  onRefresh: () => void;
  onUpgradeClick: () => void;
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
  onUpgradeClick,
}) => {
  const [activeTab, setActiveTab] = useState<SidebarTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [propertyFilter, setPropertyFilter] = useState<string>('all');
  const [showAddPropertyForm, setShowAddPropertyForm] = useState(false);

  // Add Property Form State
  const [propAddress, setPropAddress] = useState('');
  const [propAddress2, setPropAddress2] = useState('');
  const [propSuburb, setPropSuburb] = useState('');
  const [propCity, setPropCity] = useState('');
  const [propState, setPropState] = useState('');
  const [propZip, setPropZip] = useState('');
  const [propCountry, setPropCountry] = useState('');
  const [propInsuranceProvider, setPropInsuranceProvider] = useState('');
  const [propAnnualPremium, setPropAnnualPremium] = useState('1,000.00');
  const [propRenewalDate, setPropRenewalDate] = useState('');
  const [propType, setPropType] = useState<'house' | 'apartment'>('house');
  const [propTotalArea, setPropTotalArea] = useState('');
  const [propBedrooms, setPropBedrooms] = useState('');
  const [propBathrooms, setPropBathrooms] = useState('');
  const [propTitle, setPropTitle] = useState('');
  const [propDescription, setPropDescription] = useState('');
  const [propPrice, setPropPrice] = useState('150');
  const [propImageUrl, setPropImageUrl] = useState('');
  const [propFormError, setPropFormError] = useState('');
  const [propFormSaving, setPropFormSaving] = useState(false);
  const [propFormSuccess, setPropFormSuccess] = useState(false);

  // Legacy form state (kept for backward compat)
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
  const [showMaintenanceFilterPanel, setShowMaintenanceFilterPanel] = useState(false);
  const [maintenancePriorityFilters, setMaintenancePriorityFilters] = useState<string[]>([]);
  const [maintenanceCompletedIn, setMaintenanceCompletedIn] = useState('Last 60 days');

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
        setActiveTab('properties');
      }, 1200);
    } catch (err) {
      setFormError('Failed to publish listing. Please try again.');
    }
  };

  const resetAddPropertyForm = () => {
    setPropAddress(''); setPropAddress2(''); setPropSuburb(''); setPropCity('');
    setPropState(''); setPropZip(''); setPropCountry('');
    setPropInsuranceProvider(''); setPropAnnualPremium('1,000.00'); setPropRenewalDate('');
    setPropType('house'); setPropTotalArea(''); setPropBedrooms(''); setPropBathrooms('');
    setPropTitle(''); setPropDescription(''); setPropPrice('150'); setPropImageUrl('');
    setPropFormError(''); setPropFormSaving(false); setPropFormSuccess(false);
  };

  const handleAddPropertySave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propAddress.trim()) {
      setPropFormError('Property address is required.');
      return;
    }
    setPropFormError('');
    setPropFormSaving(true);
    try {
      const resolvedImage = propImageUrl || PRESET_IMAGES[1].url;
      const resolvedTitle = propTitle || propAddress;
      const resolvedDesc = propDescription || `${propType === 'house' ? 'Single Family Home' : 'Multi-unit'} at ${propAddress}`;
      const resolvedLocation = [propAddress, propCity, propState, propCountry].filter(Boolean).join(', ');
      await onCreateListing({
        title: resolvedTitle,
        description: resolvedDesc,
        type: propType,
        location: resolvedLocation || propAddress,
        price: Number(propPrice) || 150,
        beds: Number(propBedrooms) || 0,
        baths: Number(propBathrooms) || 0,
        image: resolvedImage,
        amenities: ['Fast Wi-Fi'],
        ownerId: 'owner_default',
      });
      setPropFormSuccess(true);
      setTimeout(() => {
        resetAddPropertyForm();
        setShowAddPropertyForm(false);
        setActiveTab('properties');
      }, 1000);
    } catch {
      setPropFormError('Failed to save property. Please try again.');
    } finally {
      setPropFormSaving(false);
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
          <span>Trial ends in 14 days. <span className="underline cursor-pointer hover:text-amber-50" onClick={onUpgradeClick}>Upgrade Now</span></span>
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
          {activeTab === 'dashboard' && (() => {
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth();
            const monthName = now.toLocaleString('default', { month: 'long' });
            const firstDayOfMonth = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const today = now.getDate();
            const dayHeaders = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

            return (
              <div className="space-y-5 animate-fadeIn">

                {/* Greeting row + filters */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    Hello yosef,
                  </h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <select className="appearance-none bg-white border border-slate-200 text-slate-700 text-xs font-semibold px-3.5 py-2 pr-7 rounded-lg outline-none cursor-pointer hover:border-slate-300 transition shadow-xs">
                        <option>Portfolio</option>
                        <option>All Properties</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
                    </div>
                    <div className="relative">
                      <select className="appearance-none bg-white border border-slate-200 text-slate-700 text-xs font-semibold px-3.5 py-2 pr-7 rounded-lg outline-none cursor-pointer hover:border-slate-300 transition shadow-xs">
                        <option>Properties</option>
                        <option>Houses & Villas</option>
                        <option>Office Spaces</option>
                        <option>Commercial Real Estate</option>
                        <option>Apartments</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
                    </div>
                    <button className="bg-white border border-slate-200 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-lg hover:border-slate-300 transition shadow-xs cursor-pointer">
                      Categories
                    </button>
                  </div>
                </div>

                {/* 3 Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  {/* Rent Received */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                    <p className="text-sm font-semibold text-slate-600 mb-3">Rent received</p>
                    <div className="flex items-center gap-3">
                      <div className="bg-emerald-100 text-emerald-600 p-2.5 rounded-xl">
                        <Home className="h-5 w-5" />
                      </div>
                      <span className="text-2xl font-extrabold text-slate-900">
                        USD{stats.totalEarnings.toFixed(2)}
                      </span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-bold text-slate-700">USD{stats.totalEarnings.toFixed(0)}</span>
                      <span>Received last month</span>
                    </div>
                  </div>

                  {/* Upcoming Payments */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                    <p className="text-sm font-semibold text-slate-600 mb-3">Upcoming payments</p>
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 text-blue-600 p-2.5 rounded-xl">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <span className="text-2xl font-extrabold text-slate-900">USD0.00</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                      0 payment
                    </div>
                  </div>

                  {/* Rent Overdue */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                    <p className="text-sm font-semibold text-slate-600 mb-3">Rent overdue</p>
                    <div className="flex items-center gap-3">
                      <div className="bg-rose-100 text-rose-600 p-2.5 rounded-xl">
                        <Clock3 className="h-5 w-5" />
                      </div>
                      <span className="text-2xl font-extrabold text-slate-900">USD0.00</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                      0 overdue
                    </div>
                  </div>
                </div>

                {/* Cashflow + Calendar row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                  {/* Cashflow — 2/3 width */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs lg:col-span-2 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <h3 className="text-base font-bold text-slate-800">Cashflow</h3>
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <span className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md">1 Jan 2026</span>
                        <span className="text-slate-300">—</span>
                        <span className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md">31 Dec 2026</span>
                      </div>
                    </div>

                    {/* INCOME / EXPENSES / NET dots */}
                    <div className="flex items-center gap-5 text-xs font-semibold text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                        <span className="text-slate-900 font-bold">USD{stats.totalEarnings.toFixed(0)}</span>
                        <span className="text-slate-400 font-normal">INCOME</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" />
                        <span className="text-slate-900 font-bold">USD0</span>
                        <span className="text-slate-400 font-normal">EXPENSES</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-800 inline-block" />
                        <span className="text-slate-900 font-bold">USD{stats.totalEarnings.toFixed(0)}</span>
                        <span className="text-slate-400 font-normal">NET</span>
                      </div>
                    </div>

                    {/* Bar chart */}
                    <div className="flex items-end justify-between gap-1.5 h-28 pt-2">
                      {['J','F','M','A','M','J','J','A','S','O','N','D'].map((m, i) => {
                        const isCurrentMonth = i === now.getMonth();
                        const hasData = stats.totalEarnings > 0 && isCurrentMonth;
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                            <div className="w-full rounded-t-md bg-slate-100 flex items-end h-20 overflow-hidden">
                              <div
                                className={`w-full transition-all duration-700 rounded-t-md ${hasData ? 'bg-slate-700' : 'bg-slate-200'}`}
                                style={{ height: hasData ? '60%' : '8px' }}
                              />
                            </div>
                            <span className={`text-[9px] font-bold ${isCurrentMonth ? 'text-slate-800' : 'text-slate-400'}`}>{m}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Calendar Widget — 1/3 width */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-bold text-slate-800">Calendar</h3>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-slate-700">{monthName} {year}</span>
                      <div className="flex gap-1">
                        <button className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer rounded-md hover:bg-slate-100 transition">
                          <ChevronDown className="h-4 w-4 rotate-90" />
                        </button>
                        <button className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer rounded-md hover:bg-slate-100 transition">
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Day headers */}
                    <div className="grid grid-cols-7 mb-1">
                      {dayHeaders.map((d, i) => (
                        <div key={i} className="text-center text-[10px] font-bold text-slate-400 py-1">{d}</div>
                      ))}
                    </div>

                    {/* Calendar days */}
                    <div className="grid grid-cols-7 gap-y-0.5">
                      {/* Empty cells before first day */}
                      {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                        <div key={`e-${i}`} />
                      ))}
                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const isToday = day === today;
                        return (
                          <div
                            key={day}
                            className={`flex items-center justify-center text-[11px] font-semibold h-7 w-7 mx-auto rounded-full cursor-pointer transition-all ${
                              isToday
                                ? 'bg-blue-600 text-white font-bold'
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {day}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Leasing Splits — bottom row */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                  <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <PieChart className="h-4 w-4 text-indigo-500" />
                    Leasing Splits by Category
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: 'Houses & Villas', value: typeEarnings.villa, color: 'bg-emerald-500' },
                      { label: 'Office Spaces',   value: typeEarnings.office, color: 'bg-blue-500' },
                      { label: 'Commercial Real Estate', value: typeEarnings.realestate, color: 'bg-amber-500' },
                      { label: 'Apartments & Studios',   value: typeEarnings.apartment, color: 'bg-indigo-500' },
                    ].map(item => (
                      <div key={item.label} className="flex items-center gap-2.5">
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.color}`} />
                        <div>
                          <p className="text-[10px] text-slate-400 font-medium leading-none">{item.label}</p>
                          <p className="text-sm font-extrabold text-slate-800 mt-0.5">USD{item.value.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            );
          })()}



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

          {/* TAB 3: PROPERTIES */}
          {activeTab === 'properties' && (
            showAddPropertyForm ? (
              <form onSubmit={handleAddPropertySave} className="space-y-6 animate-fadeIn">
                {/* Page header */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <button
                      type="button"
                      onClick={() => { resetAddPropertyForm(); setShowAddPropertyForm(false); }}
                      className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-3 cursor-pointer"
                    >
                      <ArrowLeft className="h-4 w-4" /> Back
                    </button>
                    <h2 className="text-2xl font-bold text-slate-900">Add a property</h2>
                    <p className="text-sm text-slate-500 mt-1">Get started by adding your property's address and details below.</p>
                  </div>
                  <button
                    type="submit"
                    disabled={propFormSaving}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold text-sm px-6 py-2.5 rounded-lg cursor-pointer transition-colors shrink-0"
                  >
                    {propFormSaving ? 'Saving...' : 'Save'}
                  </button>
                </div>

                {propFormError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-lg">{propFormError}</div>
                )}
                {propFormSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" /> Property saved successfully!
                  </div>
                )}

                {/* Two-column: General Info + Insurance */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* LEFT: General Information (2/3 width) */}
                  <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">General Information</p>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Property address</label>
                      <input
                        type="text"
                        placeholder="212 Kent Road"
                        value={propAddress}
                        onChange={e => setPropAddress(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Address line 2</label>
                      <input
                        type="text"
                        value={propAddress2}
                        onChange={e => setPropAddress2(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Suburb</label>
                        <input type="text" value={propSuburb} onChange={e => setPropSuburb(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                        <input type="text" value={propCity} onChange={e => setPropCity(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">State / Province</label>
                        <input type="text" value={propState} onChange={e => setPropState(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">ZIP / Postcode</label>
                        <input type="text" value={propZip} onChange={e => setPropZip(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
                      <input type="text" value={propCountry} onChange={e => setPropCountry(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                    </div>
                  </div>

                  {/* RIGHT: Insurance (1/3 width) */}
                  <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Insurance</p>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Current insurance provider</label>
                      <input
                        type="text"
                        placeholder="Enter insurance provider"
                        value={propInsuranceProvider}
                        onChange={e => setPropInsuranceProvider(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm placeholder-slate-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Annual premium</label>
                      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                        <span className="bg-slate-50 border-r border-slate-200 px-3 py-2 text-sm text-slate-500 font-medium">USD</span>
                        <input
                          type="text"
                          value={propAnnualPremium}
                          onChange={e => setPropAnnualPremium(e.target.value)}
                          className="flex-1 px-3 py-2 text-sm focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Renewal date</label>
                      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                        <input
                          type="date"
                          value={propRenewalDate}
                          onChange={e => setPropRenewalDate(e.target.value)}
                          className="flex-1 px-3 py-2 text-sm focus:outline-none text-slate-500"
                        />
                        <Calendar className="h-4 w-4 text-slate-400 mr-3" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Property Type */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Property Type</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      {
                        value: 'house' as const,
                        title: 'Single Family Home',
                        desc: 'A single family home is a standalone property like a town house with only one lease.',
                      },
                      {
                        value: 'apartment' as const,
                        title: 'Multi-unit',
                        desc: 'A multi-unit or HMO is a single building with multiple units and leases such as a duplex or apartment block.',
                      },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setPropType(opt.value)}
                        className={`text-left p-5 rounded-xl border-2 transition-all cursor-pointer ${
                          propType === opt.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            propType === opt.value ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                          }`}>
                            {propType === opt.value && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                          </div>
                          <span className={`font-semibold text-sm ${propType === opt.value ? 'text-blue-700' : 'text-slate-800'}`}>
                            {opt.title}
                          </span>
                        </div>
                        <p className={`text-xs leading-relaxed ml-7 ${propType === opt.value ? 'text-blue-600' : 'text-slate-500'}`}>
                          {opt.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Features</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Total area (m²)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={propTotalArea}
                        onChange={e => setPropTotalArea(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Bedrooms</label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        placeholder="0.0"
                        value={propBedrooms}
                        onChange={e => setPropBedrooms(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Bathrooms</label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        placeholder="0.0"
                        value={propBathrooms}
                        onChange={e => setPropBathrooms(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Property Image */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Property Image</p>
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        placeholder="https://images.unsplash.com/... (optional)"
                        value={propImageUrl.startsWith('data:') ? '[Local image loaded]' : propImageUrl}
                        onChange={e => { if (!e.target.value.startsWith('[Local')) setPropImageUrl(e.target.value); }}
                        className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                      <label className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 cursor-pointer">
                        <Upload className="h-4 w-4" /> Upload
                        <input type="file" accept="image/*" className="hidden" onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) { const r = new FileReader(); r.onloadend = () => { if (typeof r.result === 'string') setPropImageUrl(r.result); }; r.readAsDataURL(file); }
                        }} />
                      </label>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {PRESET_IMAGES.map(img => (
                        <button key={img.name} type="button" onClick={() => setPropImageUrl(img.url)}
                          className={`p-2 rounded-lg border text-xs font-medium text-left cursor-pointer transition ${propImageUrl === img.url ? 'bg-blue-50 border-blue-400 text-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                          {img.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </form>
            ) : (
            <div className="space-y-6 animate-fadeIn">
              {/* Header row */}
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">Properties</h2>
                <button
                  onClick={() => setShowAddPropertyForm(true)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add property
                </button>
              </div>

              {/* Filter tabs */}
              <div className="flex items-center gap-0 border-b border-slate-200 overflow-x-auto">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'overdue', label: 'Rent overdue', count: 0 },
                  { id: 'due-soon', label: 'Rent due soon', count: 0 },
                  { id: 'due-later', label: 'Rent due later', count: 0 },
                  { id: 'vacant', label: 'Vacant', count: 0 },
                  { id: 'multi-unit', label: 'Multi-Unit' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setPropertyFilter(tab.id)}
                    className={`px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer border-b-2 -mb-px ${
                      propertyFilter === tab.id
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {tab.label}
                    {'count' in tab && tab.count !== undefined && (
                      <span className={`ml-1.5 text-xs font-bold px-1.5 py-0.5 rounded-full ${
                        propertyFilter === tab.id ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Empty state or property list */}
              {ownerListings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <svg width="200" height="160" viewBox="0 0 200 160" fill="none" className="mb-6 opacity-80">
                    <ellipse cx="100" cy="145" rx="60" ry="8" fill="#e2e8f0"/>
                    <rect x="130" y="60" width="28" height="70" rx="3" fill="#cbd5e1"/>
                    <rect x="135" y="70" width="7" height="10" rx="1" fill="#94a3b8"/>
                    <rect x="146" y="70" width="7" height="10" rx="1" fill="#94a3b8"/>
                    <rect x="135" y="85" width="7" height="10" rx="1" fill="#94a3b8"/>
                    <rect x="146" y="85" width="7" height="10" rx="1" fill="#94a3b8"/>
                    <rect x="135" y="100" width="7" height="10" rx="1" fill="#94a3b8"/>
                    <rect x="146" y="100" width="7" height="10" rx="1" fill="#94a3b8"/>
                    <rect x="158" y="80" width="22" height="50" rx="3" fill="#dde3ed"/>
                    <rect x="162" y="88" width="5" height="8" rx="1" fill="#94a3b8"/>
                    <rect x="170" y="88" width="5" height="8" rx="1" fill="#94a3b8"/>
                    <rect x="162" y="100" width="5" height="8" rx="1" fill="#94a3b8"/>
                    <rect x="170" y="100" width="5" height="8" rx="1" fill="#94a3b8"/>
                    <rect x="55" y="75" width="70" height="55" rx="4" fill="#dbeafe"/>
                    <polygon points="55,75 90,45 125,75" fill="#bfdbfe"/>
                    <rect x="80" y="100" width="20" height="30" rx="2" fill="#93c5fd"/>
                    <rect x="60" y="82" width="14" height="14" rx="2" fill="#93c5fd"/>
                    <rect x="106" y="82" width="14" height="14" rx="2" fill="#93c5fd"/>
                    <circle cx="52" cy="88" r="10" fill="#1e293b"/>
                    <rect x="44" y="98" width="16" height="28" rx="4" fill="#334155"/>
                    <line x1="44" y1="110" x2="30" y2="125" stroke="#334155" strokeWidth="5" strokeLinecap="round"/>
                    <line x1="60" y1="110" x2="68" y2="120" stroke="#334155" strokeWidth="5" strokeLinecap="round"/>
                    <line x1="44" y1="126" x2="40" y2="145" stroke="#334155" strokeWidth="5" strokeLinecap="round"/>
                    <line x1="60" y1="126" x2="64" y2="145" stroke="#334155" strokeWidth="5" strokeLinecap="round"/>
                    <circle cx="72" cy="100" r="14" stroke="#3b82f6" strokeWidth="3" fill="white" fillOpacity="0.6"/>
                    <line x1="82" y1="110" x2="92" y2="122" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  <p className="text-sm text-slate-500 max-w-xs">
                    You haven't added any properties yet. Start by clicking + Add Property to add your first one!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ownerListings.map((property) => (
                    <div key={property.id} className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col">
                      <div className="relative aspect-video bg-slate-100">
                        <img src={property.image} alt={property.title} className="w-full h-full object-cover" />
                        <button
                          onClick={async () => {
                            if (window.confirm('Remove this property?')) await onDeleteListing(property.id);
                          }}
                          className="absolute top-3 right-3 bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 p-1.5 rounded-lg shadow-sm border border-slate-100 transition cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="p-4 space-y-2">
                        <h4 className="font-semibold text-slate-800 truncate">{property.title}</h4>
                        <div className="flex items-center text-xs text-slate-400">
                          <MapPin className="h-3 w-3 mr-1" />{property.location}
                        </div>
                        <div className="flex justify-between text-xs pt-2 border-t border-slate-100">
                          <span className="font-bold text-slate-800">${property.price}/night</span>
                          <span className="text-slate-400">{property.beds}bd · {property.baths}ba</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            )
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
              const priOk = maintenancePriorityFilters.length === 0 || maintenancePriorityFilters.includes(r.priority);
              return propOk && priOk;
            });

            const togglePriority = (p: string) => {
              setMaintenancePriorityFilters(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
            };

            const columns: { key: string; label: string }[] = [
              { key: 'Open',        label: 'NEW'         },
              { key: 'In Progress', label: 'IN PROGRESS' },
              { key: 'Completed',   label: 'COMPLETED'   },
            ];

            return (
              <div className="space-y-5 animate-fadeIn">

                {/* Page title + toolbar */}
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-bold text-slate-900 mr-2">Maintenance</h2>
                  <div className="flex-1" />

                  {/* Properties dropdown */}
                  <div className="relative">
                    <select
                      value={maintenancePropFilter}
                      onChange={e => setMaintenancePropFilter(e.target.value)}
                      className="appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-medium px-4 py-2 pr-8 rounded-lg outline-none cursor-pointer hover:border-slate-300 transition"
                    >
                      {allProps.map(p => <option key={p}>{p}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  </div>

                  {/* Filter button + panel */}
                  <div className="relative">
                    <button
                      onClick={() => setShowMaintenanceFilterPanel(v => !v)}
                      className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium px-4 py-2 rounded-lg hover:border-slate-300 transition cursor-pointer"
                    >
                      Filter
                      <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                    </button>

                    {showMaintenanceFilterPanel && (
                      <div className="absolute right-0 top-11 z-50 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl p-5 space-y-5">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-slate-800">Filter</span>
                          <button
                            onClick={() => { setMaintenancePriorityFilters([]); setMaintenanceCompletedIn('Last 60 days'); }}
                            className="text-xs text-blue-600 hover:underline cursor-pointer font-semibold"
                          >
                            Clear all
                          </button>
                        </div>

                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Search"
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 pr-8"
                          />
                          <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-1.5">
                              <ChevronDown className="h-4 w-4 text-slate-500" />
                              <span className="text-sm font-semibold text-slate-700">Priorities</span>
                            </div>
                            <button
                              onClick={() => setMaintenancePriorityFilters(['low','medium','high','urgent'])}
                              className="text-xs text-blue-600 hover:underline cursor-pointer font-semibold"
                            >
                              Select all
                            </button>
                          </div>
                          <div className="space-y-2.5">
                            {['Low','Medium','High','Urgent'].map(p => (
                              <label key={p} className="flex items-center gap-2.5 cursor-pointer">
                                <input
                                  type="radio"
                                  name="priority-filter"
                                  checked={maintenancePriorityFilters.includes(p.toLowerCase())}
                                  onChange={() => togglePriority(p.toLowerCase())}
                                  className="w-4 h-4 accent-blue-600 cursor-pointer"
                                />
                                <span className="text-sm text-slate-700">{p}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5 mb-3">
                            <ChevronDown className="h-4 w-4 text-slate-500" />
                            <span className="text-sm font-semibold text-slate-700">Completed in</span>
                          </div>
                          <div className="space-y-2.5">
                            {['Last 60 days','Last 90 days','Last 12 months','Last 2 years','All time'].map(opt => (
                              <label key={opt} className="flex items-center gap-2.5 cursor-pointer">
                                <input
                                  type="radio"
                                  name="completed-in"
                                  checked={maintenanceCompletedIn === opt}
                                  onChange={() => setMaintenanceCompletedIn(opt)}
                                  className="w-4 h-4 accent-blue-600 cursor-pointer"
                                />
                                <span className="text-sm text-slate-700">{opt}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* New Request button */}
                  <button
                    onClick={() => setShowNewRequestModal(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm transition cursor-pointer"
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
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold tracking-widest uppercase text-slate-500">{col.label}</span>
                          {cards.length > 0 && (
                            <span className="bg-slate-200 text-slate-600 text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{cards.length}</span>
                          )}
                        </div>

                        {/* Column body */}
                        <div className="min-h-[300px] rounded-xl border border-slate-200 bg-[#f1f3f6] p-3 flex flex-col gap-3">
                          {cards.length === 0 ? (
                            /* Empty state matching LandlordStudio screenshot */
                            <div className="flex-1 flex flex-col items-center justify-center gap-3 py-10 text-center">
                              {col.key === 'In Progress' ? (
                                <>
                                  {/* Houses + trees illustration */}
                                  <svg width="100" height="80" viewBox="0 0 100 80" fill="none">
                                    <ellipse cx="50" cy="72" rx="38" ry="6" fill="#dde3ed"/>
                                    {/* Left tree */}
                                    <rect x="10" y="50" width="4" height="16" rx="1" fill="#94a3b8"/>
                                    <ellipse cx="12" cy="44" rx="7" ry="10" fill="#6366f1"/>
                                    <ellipse cx="9" cy="48" rx="5" ry="7" fill="#818cf8"/>
                                    {/* Right tree */}
                                    <rect x="84" y="50" width="4" height="16" rx="1" fill="#94a3b8"/>
                                    <ellipse cx="86" cy="44" rx="7" ry="10" fill="#6366f1"/>
                                    <ellipse cx="89" cy="48" rx="5" ry="7" fill="#818cf8"/>
                                    {/* Left house */}
                                    <rect x="22" y="42" width="24" height="24" rx="2" fill="#cbd5e1"/>
                                    <polygon points="22,42 34,28 46,42" fill="#94a3b8"/>
                                    <rect x="29" y="54" width="10" height="12" rx="1" fill="#64748b"/>
                                    <rect x="24" y="46" width="7" height="7" rx="1" fill="#e2e8f0"/>
                                    <rect x="38" y="46" width="7" height="7" rx="1" fill="#e2e8f0"/>
                                    {/* Right house */}
                                    <rect x="54" y="45" width="22" height="21" rx="2" fill="#dde3ed"/>
                                    <polygon points="54,45 65,33 76,45" fill="#b6c2d4"/>
                                    <rect x="60" y="55" width="9" height="11" rx="1" fill="#64748b"/>
                                    <rect x="56" y="48" width="6" height="6" rx="1" fill="#e2e8f0"/>
                                    <rect x="69" y="48" width="6" height="6" rx="1" fill="#e2e8f0"/>
                                  </svg>
                                  <p className="text-xs text-slate-500 font-medium">You have no maintenance requests</p>
                                </>
                              ) : (
                                <p className="text-xs text-slate-400 font-medium mt-8">No requests</p>
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


            {/* POPUP MODAL: REPORT DETAILS DIALOG */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-4xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-fadeIn">
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
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
              <p className="text-sm text-slate-500">Report data for: <span className="font-bold text-slate-800 capitalize">{selectedReport.replace(/-/g, ' ')}</span></p>
              <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="p-3">Property</th>
                      <th className="p-3">Tenant</th>
                      <th className="p-3">Period</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ownerBookings.map(b => (
                      <tr key={b.id} className="hover:bg-slate-50/40">
                        <td className="p-3 font-semibold text-slate-800">{b.listingTitle}</td>
                        <td className="p-3 text-slate-700">{b.renterName}</td>
                        <td className="p-3 text-slate-400 font-mono">{b.startDate} &rarr; {b.endDate}</td>
                        <td className="p-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${b.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{b.paymentStatus}</span>
                        </td>
                        <td className="p-3 font-extrabold text-slate-900">${b.totalPrice.toFixed(2)}</td>
                      </tr>
                    ))}
                    {ownerBookings.length === 0 && (
                      <tr><td colSpan={5} className="p-6 text-center text-slate-400 italic">No transactions found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};