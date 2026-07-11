import { useState, useEffect } from 'react';
import { PropertyListing, Booking, AppUser } from './types';
import { Navbar } from './components/Navbar';
import { ListingExplorer } from './components/ListingExplorer';
import { PropertyDetailsModal } from './components/PropertyDetailsModal';
import { CheckoutPaymentModal } from './components/CheckoutPaymentModal';
import { RenterDashboard } from './components/RenterDashboard';
import { PortalLoginPage } from './components/PortalLoginPage';
import { UpgradePage } from './components/UpgradePage';
import { OwnerDashboard } from './components/OwnerDashboard';
import { AuthPage } from './components/AuthPage';



import {
  getAllListings,
  createListing,
  deleteListing,
  getBookingsByRenter,
  getBookingsByOwner,
  getAllBookings,
  createBooking,
  createPaymentRecord,
  updateBookingStatus
} from './lib/firebase';
import { ShieldCheck, Heart, Users, Building2, DollarSign, Clock3, Database, ReceiptText, Palette, ArrowUpRight, BadgeCheck, LayoutGrid, FileText } from 'lucide-react';

type AppTab = 'explore' | 'renter-dashboard' | 'owner-dashboard' | 'super-admin' | 'auth';

export default function App() {
  const [currentTab, setCurrentTab] = useState<AppTab>('explore');
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [showUpgradePage, setShowUpgradePage] = useState(false);

  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [accessNotice, setAccessNotice] = useState<string | null>(null);

  const [listings, setListings] = useState<PropertyListing[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const [selectedProperty, setSelectedProperty] = useState<PropertyListing | null>(null);
  const [checkoutDetails, setCheckoutDetails] = useState<{
    property: PropertyListing;
    startDate: string;
    endDate: string;
    nights: number;
    totalPrice: number;
  } | null>(null);

  const fetchListings = async () => {
    setLoadingListings(true);
    try {
      const data = await getAllListings();
      setListings(data);
    } catch (err) {
      console.error('Failed to fetch property listings:', err);
    } finally {
      setLoadingListings(false);
    }
  };

  const fetchBookings = async () => {
    if (!currentUser) return;
    setLoadingBookings(true);
    try {
      if (currentUser.role === 'renter') {
        const data = await getBookingsByRenter(currentUser.email);
        setBookings(data);
      } else if (currentUser.role === 'super-admin') {
        const data = await getAllBookings();
        setBookings(data);
      } else {
        const data = await getBookingsByOwner('owner_default');
        setBookings(data);
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    fetchBookings();
  }, [currentUser?.role, currentTab, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role === 'renter' && currentTab === 'owner-dashboard') {
      setCurrentTab('explore');
    }
    if (currentUser.role === 'owner' && currentTab === 'renter-dashboard') {
      setCurrentTab('owner-dashboard');
    }
    if (currentUser.role === 'super-admin' && currentTab !== 'super-admin') {
      setCurrentTab('super-admin');
    }
  }, [currentUser?.role, currentTab, currentUser]);

  const handleCreateListing = async (listingData: Omit<PropertyListing, 'id' | 'rating' | 'reviewsCount'>) => {
    try {
      const newListing = await createListing(listingData);
      setListings(prev => [newListing, ...prev]);
      return newListing;
    } catch (err) {
      console.error('Error creating listing in App:', err);
      throw err;
    }
  };

  const handleAuthSuccess = (user: AppUser) => {
    setCurrentUser(user);
    setAccessNotice(null);
    setCurrentTab(user.role === 'owner' ? 'owner-dashboard' : user.role === 'super-admin' ? 'super-admin' : 'explore');
  };

  const handleTabChange = (nextTab: AppTab) => {
    if (nextTab === 'explore') {
      setAccessNotice(null);
      setCurrentTab('explore');
      return;
    }

    if (nextTab === 'auth') {
      setAccessNotice(null);
      setCurrentTab('auth');
      return;
    }

    if (!currentUser) {
      const demoUser: AppUser =
        nextTab === 'owner-dashboard'
          ? { name: 'Demo Host', email: 'owner_default', role: 'owner' }
          : nextTab === 'super-admin'
            ? { name: 'System Admin', email: 'admin@renthub.app', role: 'super-admin' }
            : { name: 'Demo Renter', email: 'demo.renter@renthub.app', role: 'renter' };
      setCurrentUser(demoUser);
      setAccessNotice(null);
      setCurrentTab(nextTab);
      return;
    }

    if (nextTab === 'owner-dashboard' && currentUser.role !== 'owner') {
      setCurrentUser({ name: 'Demo Host', email: 'owner_default', role: 'owner' });
      setAccessNotice('This dashboard is reserved for the matching persona. Use the sign-in icon to switch roles if needed.');
      setCurrentTab('owner-dashboard');
      return;
    }

    if (nextTab === 'renter-dashboard' && currentUser.role !== 'renter') {
      setCurrentUser({ name: 'Demo Renter', email: 'demo.renter@renthub.app', role: 'renter' });
      setAccessNotice('This dashboard is reserved for the matching persona. Use the sign-in icon to switch roles if needed.');
      setCurrentTab('renter-dashboard');
      return;
    }

    if (nextTab === 'super-admin' && currentUser.role !== 'super-admin') {
      setCurrentUser({ name: 'System Admin', email: 'admin@renthub.app', role: 'super-admin' });
      setAccessNotice('This dashboard is reserved for the matching persona. Use the sign-in icon to switch roles if needed.');
      setCurrentTab('super-admin');
      return;
    }

    setAccessNotice(null);
    setCurrentTab(nextTab);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAccessNotice(null);
    setCurrentTab('explore');
  };

  const handleDeleteListing = async (listingId: string) => {
    try {
      await deleteListing(listingId);
      setListings(prev => prev.filter(l => l.id !== listingId));
    } catch (err) {
      console.error('Error deleting listing in App:', err);
    }
  };

  const handleInitiateBooking = (bookingSchedule: {
    startDate: string;
    endDate: string;
    nights: number;
    totalPrice: number;
  }) => {
    let activeUser = currentUser;
    if (!activeUser) {
      const demoUser: AppUser = { name: 'Demo Renter', email: 'demo.renter@renthub.app', role: 'renter' };
      setCurrentUser(demoUser);
      activeUser = demoUser;
    }
    if (activeUser.role !== 'renter') {
      alert('Only renters can book stays. Please switch to renter mode to book.');
      return;
    }
    if (!selectedProperty) return;

    const propertyToBook = selectedProperty;
    setSelectedProperty(null);

    setCheckoutDetails({
      property: propertyToBook,
      ...bookingSchedule,
    });
  };

  const handlePaymentSuccess = async (paymentDetails: {
    cardholderName: string;
    cardNumberMasked: string;
  }) => {
    if (!checkoutDetails || !currentUser) return;

    try {
      const createdBooking = await createBooking({
        listingId: checkoutDetails.property.id,
        listingTitle: checkoutDetails.property.title,
        listingImage: checkoutDetails.property.image,
        listingLocation: checkoutDetails.property.location,
        renterId: currentUser.email,
        renterName: currentUser.name,
        startDate: checkoutDetails.startDate,
        endDate: checkoutDetails.endDate,
        totalPrice: checkoutDetails.totalPrice,
        nights: checkoutDetails.nights,
      });

      await createPaymentRecord({
        bookingId: createdBooking.id,
        renterId: currentUser.email,
        amount: checkoutDetails.totalPrice,
        cardholderName: paymentDetails.cardholderName,
        cardNumberMasked: paymentDetails.cardNumberMasked,
      });

      setCheckoutDetails(null);
      await fetchBookings();
      setCurrentTab('renter-dashboard');
    } catch (err) {
      console.error('Checkout transaction failed:', err);
      alert('Transaction processing error. Please try again.');
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await updateBookingStatus(bookingId, 'cancelled');
      await fetchBookings();
    } catch (err) {
      console.error('Failed to cancel stay booking:', err);
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, status: Booking['status']) => {
    try {
      await updateBookingStatus(bookingId, status);
      await fetchBookings();
    } catch (err) {
      console.error('Failed to update booking status:', err);
    }
  };

  const pendingBookings = bookings.filter(booking => booking.status === 'pending').length;
  const paidBookings = bookings.filter(booking => booking.paymentStatus === 'paid').length;
  const activeListingsCount = listings.length;

  const superAdminMetrics = [
    { label: 'Active Listings', value: activeListingsCount, tone: 'emerald' },
    { label: 'Pending Bookings', value: pendingBookings, tone: 'amber' },
    { label: 'Paid Transactions', value: paidBookings, tone: 'sky' },
    { label: 'Revenue Pulse', value: '$128.4k', tone: 'violet' },
  ];

  if (!currentUser) {
    return <PortalLoginPage onLogin={handleAuthSuccess} />;
  }

  const isOwner = currentTab === 'owner-dashboard';

  return (
    <div className={isOwner ? "min-h-screen flex flex-col" : "min-h-screen bg-slate-50/50 flex flex-col justify-between"} id="app-root-layout">
      <div className={isOwner ? "flex-1 flex flex-col" : ""}>
        {!isOwner && (
          <Navbar
            currentTab={currentTab === 'auth' ? 'explore' : currentTab}
            setCurrentTab={handleTabChange}
            currentUser={currentUser}
            globalSearchTerm={globalSearchTerm}
            setGlobalSearchTerm={setGlobalSearchTerm}
            onLoginClick={() => handleTabChange('auth')}
            onLogout={handleLogout}
          />
        )}

        <main className={isOwner ? "flex-1 flex flex-col" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"}>
          {accessNotice && (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 shadow-sm" role="alert">
              {accessNotice}
            </div>
          )}

          {currentTab === 'explore' && (
            <div className="animate-fadeIn space-y-12">
              
              {/* BRAND REDESIGN HERO SECTION */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-6 pb-12">
                
                {/* Left Column Text & CTAs */}
                <div className="lg:col-span-5 space-y-6">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0f172a] leading-none">
                    Simple <br />
                    <span className="text-[#ff6a42]">management</span> <br />
                    software for <br />
                    landlords<span className="text-[#ff445a]">.</span>
                  </h1>
                  
                  <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-md font-sans">
                    Covering all the bases from listings to rent collection to bookings. RentHub helps you create a more profitable rental portfolio directly from your desktop or mobile.
                  </p>
                  
                  <div className="flex flex-wrap gap-4 pt-2">
                    <button
                      onClick={() => handleTabChange('auth')}
                      className="bg-[#ff445a] hover:bg-[#e63046] text-white font-semibold py-3 px-6 rounded-xl shadow-md transition duration-200 flex items-center justify-center gap-2 text-sm"
                    >
                      Get Started
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        const exploreSection = document.getElementById('explore-listings-section');
                        if (exploreSection) exploreSection.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-3 px-6 rounded-xl transition duration-200 text-sm"
                    >
                      Watch a Demo
                    </button>
                  </div>
                </div>

                {/* Right Column Custom Rebranded CSS Mockup Device */}
                <div className="lg:col-span-7 relative hidden md:block">
                  <div className="bg-[#122846] rounded-3xl p-4 shadow-2xl relative border border-slate-800 max-w-2xl ml-auto w-full aspect-[16/10] overflow-hidden">
                    <div className="bg-white rounded-2xl w-full h-full overflow-hidden flex flex-row text-[9px] text-slate-600 select-none">
                      
                      {/* Rebranded Mock Sidebar */}
                      <div className="w-[115px] bg-[#0c162b] text-slate-400 p-2.5 flex flex-col justify-between flex-shrink-0">
                        <div>
                          {/* Generic abstract logo representation */}
                          <div className="flex items-center gap-1.5 mb-5 px-1">
                            <div className="h-3 w-3 bg-emerald-400 rounded-sm rotate-45 flex items-center justify-center">
                              <div className="h-1.5 w-1.5 bg-[#0c162b] rounded-sm"></div>
                            </div>
                            <span className="font-extrabold text-white text-[10px]">RentHub</span>
                          </div>
                          
                          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-2 rounded-md text-[8px] mb-3">
                            + Create new
                          </button>
                          
                          {/* Menu options mirroring the screenshot structure */}
                          <div className="space-y-1">
                            <div className="bg-blue-900/40 text-blue-400 font-semibold px-2 py-1 rounded flex items-center gap-1.5">
                              <div className="h-1.5 w-1.5 bg-blue-400 rounded-full"></div>
                              Dashboard
                            </div>
                            <div className="px-2 py-1 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5">
                              <div className="h-1.5 w-1.5 bg-slate-500 rounded-full"></div>
                              Properties
                            </div>
                            <div className="px-2 py-1 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5">
                              <div className="h-1.5 w-1.5 bg-slate-500 rounded-full"></div>
                              Transactions
                            </div>
                            <div className="px-2 py-1 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5">
                              <div className="h-1.5 w-1.5 bg-slate-500 rounded-full"></div>
                              Reports
                            </div>
                            <div className="px-2 py-1 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5">
                              <div className="h-1.5 w-1.5 bg-slate-500 rounded-full"></div>
                              Listings
                            </div>
                            <div className="px-2 py-1 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5">
                              <div className="h-1.5 w-1.5 bg-slate-500 rounded-full"></div>
                              Maintenance
                            </div>
                          </div>
                        </div>
                        <div className="text-[7px] text-slate-500 px-1">v1.2 Cloud Active</div>
                      </div>

                      {/* Mock Main Panel Area */}
                      <div className="flex-1 bg-slate-50 flex flex-col overflow-hidden">
                        
                        {/* Mock Header Search/Profile bar */}
                        <div className="h-8 border-b border-slate-100 bg-white px-3 flex items-center justify-between">
                          <div className="bg-slate-100 rounded-full px-2 py-1 w-32 text-slate-400 text-[8px] flex items-center gap-1">
                            <span>🔍</span> Search everything...
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 bg-rose-500 rounded-full animate-pulse"></span>
                            <span className="font-semibold text-slate-700">Jane Cooper</span>
                            <div className="h-4 w-4 bg-slate-200 rounded-full"></div>
                          </div>
                        </div>

                        {/* Mock Dashboard Widgets */}
                        <div className="flex-1 p-3 overflow-y-auto space-y-3">
                          <div>
                            <h2 className="text-xs font-bold text-slate-800">Hello Jane,</h2>
                            <p className="text-[7px] text-slate-400">Here is your portfolio overview overview.</p>
                          </div>

                          {/* Quick Summary Cards */}
                          <div className="grid grid-cols-4 gap-2">
                            <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                              <p className="text-[7px] text-slate-400 uppercase">Rent received</p>
                              <p className="text-[10px] font-bold text-slate-800 mt-1">$6,876.00</p>
                              <div className="h-1 bg-emerald-500/20 rounded-full mt-1.5 overflow-hidden">
                                <div className="h-full bg-emerald-500 w-[80%] rounded-full"></div>
                              </div>
                            </div>
                            <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                              <p className="text-[7px] text-slate-400 uppercase">In progress</p>
                              <p className="text-[10px] font-bold text-slate-800 mt-1">$2,500.00</p>
                              <div className="h-1 bg-amber-500/20 rounded-full mt-1.5 overflow-hidden">
                                <div className="h-full bg-amber-500 w-[45%] rounded-full"></div>
                              </div>
                            </div>
                            <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                              <p className="text-[7px] text-slate-400 uppercase">Upcoming</p>
                              <p className="text-[10px] font-bold text-slate-800 mt-1">$758.82</p>
                              <div className="h-1 bg-sky-500/20 rounded-full mt-1.5 overflow-hidden">
                                <div className="h-full bg-sky-500 w-[20%] rounded-full"></div>
                              </div>
                            </div>
                            <div className="bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                              <p className="text-[7px] text-slate-400 uppercase">Overdue</p>
                              <p className="text-[10px] font-bold text-rose-600 mt-1">$1,200.00</p>
                              <div className="h-1 bg-rose-500/20 rounded-full mt-1.5 overflow-hidden">
                                <div className="h-full bg-rose-500 w-[60%] rounded-full"></div>
                              </div>
                            </div>
                          </div>

                          {/* Cashflow Chart Represented in Custom CSS */}
                          <div className="grid grid-cols-12 gap-2">
                            <div className="col-span-8 bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm flex flex-col justify-between">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-slate-800 text-[8px]">Cashflow Pulse</span>
                                <span className="text-[6px] text-slate-400 bg-slate-100 px-1 py-0.5 rounded">Jan 2026 - Jun 2026</span>
                              </div>
                              <div className="flex items-end justify-between h-14 pt-2 border-b border-slate-100">
                                <div className="flex flex-col items-center gap-1 w-6">
                                  <div className="w-1.5 bg-blue-600 h-6 rounded-t-sm"></div>
                                  <span className="text-[5px] text-slate-400">Jan</span>
                                </div>
                                <div className="flex flex-col items-center gap-1 w-6">
                                  <div className="w-1.5 bg-blue-600 h-8 rounded-t-sm"></div>
                                  <span className="text-[5px] text-slate-400">Feb</span>
                                </div>
                                <div className="flex flex-col items-center gap-1 w-6">
                                  <div className="w-1.5 bg-blue-600 h-10 rounded-t-sm"></div>
                                  <span className="text-[5px] text-slate-400">Mar</span>
                                </div>
                                <div className="flex flex-col items-center gap-1 w-6">
                                  <div className="w-1.5 bg-[#ff7a59] h-5 rounded-t-sm"></div>
                                  <span className="text-[5px] text-slate-400">Apr</span>
                                </div>
                                <div className="flex flex-col items-center gap-1 w-6">
                                  <div className="w-1.5 bg-blue-600 h-11 rounded-t-sm"></div>
                                  <span className="text-[5px] text-slate-400">May</span>
                                </div>
                                <div className="flex flex-col items-center gap-1 w-6">
                                  <div className="w-1.5 bg-blue-600 h-12 rounded-t-sm"></div>
                                  <span className="text-[5px] text-slate-400">Jun</span>
                                </div>
                              </div>
                            </div>

                            {/* Upgrade Promo Widget */}
                            <div className="col-span-4 bg-gradient-to-br from-indigo-600 to-blue-700 text-white p-2 rounded-lg flex flex-col justify-between shadow-sm">
                              <div>
                                <p className="font-bold text-[8px]">Upgrade Stay</p>
                                <p className="text-[6px] text-indigo-100 leading-tight mt-1">Unlock seamless check-outs & verified stays.</p>
                              </div>
                              <button className="bg-white text-indigo-600 hover:bg-indigo-50 transition-colors font-bold text-[7px] py-1 px-1.5 rounded text-center mt-2">
                                Upgrade Now
                              </button>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Browse Listings Header Title */}
              <div id="explore-listings-section" className="border-t border-slate-100 pt-8">
                <h3 className="text-xl font-bold text-slate-900">Explore Available Spaces</h3>
                <p className="text-slate-500 text-xs">Curated boutique residences and stays open for bookings.</p>
              </div>

              {loadingListings ? (
                <div className="py-20 text-center" id="listings-loading">
                  <div className="h-10 w-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500 font-sans text-sm font-semibold">Loading luxury spaces...</p>
                </div>
              ) : (
                <ListingExplorer
                  listings={listings}
                  searchTerm={globalSearchTerm}
                  onSearchTermChange={setGlobalSearchTerm}
                  onSelectProperty={(property) => setSelectedProperty(property)}
                />
              )}
            </div>
          )}

          {currentTab === 'auth' && (
            <div className="animate-fadeIn">
              <AuthPage onLogin={handleAuthSuccess} onCancel={() => setCurrentTab('explore')} />
            </div>
          )}

          {currentTab === 'renter-dashboard' && (
            <div className="animate-fadeIn">
              <RenterDashboard
                bookings={bookings}
                listings={listings}
                onCancelBooking={handleCancelBooking}
                loading={loadingBookings}
                onRefresh={fetchBookings}
                onBrowseMore={() => setCurrentTab('explore')}
              />
            </div>
          )}

          {currentTab === 'owner-dashboard' && (
            <div className="animate-fadeIn">
              <OwnerDashboard
                listings={listings}
                bookings={bookings}
                onCreateListing={handleCreateListing}
                onDeleteListing={handleDeleteListing}
                onUpdateBookingStatus={handleUpdateBookingStatus}
                loading={loadingBookings || loadingListings}
                onRefresh={async () => {
                  await fetchListings();
                  await fetchBookings();
                }}
                currentUser={currentUser}
                onLogout={handleLogout}
                onSwitchToTenant={() => handleTabChange('renter-dashboard')}
              />
            </div>
          )}

          {currentTab === 'super-admin' && (
            <div className="animate-fadeIn space-y-6">
              <div className="rounded-3xl bg-slate-950 text-white p-8 shadow-sm border border-slate-800">
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
                  <div className="max-w-2xl space-y-3">
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">
                      <ShieldCheck className="h-3.5 w-3.5" /> Super Admin Control
                    </div>
                    <h2 className="text-3xl font-bold">The Rental Property Section (Website Admin)</h2>
                    <p className="text-sm text-slate-400">In this backend area, you manage the public-facing platform where tenants browse properties and landlords list them.</p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Signed in as</p>
                    <p className="font-semibold text-white">{currentUser?.name ?? 'System Administrator'}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {superAdminMetrics.map((metric, index) => (
                  <div key={metric.label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <p className="text-xs uppercase tracking-[0.2em] text-gray-400">{metric.label}</p>
                      <div className={`rounded-xl p-2 ${metric.tone === 'emerald' ? 'bg-emerald-50 text-emerald-600' : metric.tone === 'amber' ? 'bg-amber-50 text-amber-600' : metric.tone === 'sky' ? 'bg-sky-50 text-sky-600' : 'bg-violet-50 text-violet-600'}`}>
                        {index === 0 ? <Building2 className="h-5 w-5" /> : index === 1 ? <Clock3 className="h-5 w-5" /> : index === 2 ? <DollarSign className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                      </div>
                    </div>
                    <p className="mt-4 text-2xl font-bold text-gray-900">{metric.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <Building2 className="h-5 w-5" />
                    <h3 className="text-lg font-semibold text-gray-900">Approve or Reject Listings</h3>
                  </div>
                  <p className="text-sm text-gray-500">Verify property photos, descriptions, and amenities to ensure they meet your website's quality standards.</p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 text-sky-600">
                    <LayoutGrid className="h-5 w-5" />
                    <h3 className="text-lg font-semibold text-gray-900">Manage Categories &amp; Tags</h3>
                  </div>
                  <p className="text-sm text-gray-500">Update tags like "Furnished," "Pet-Friendly," or location-based filters so users can easily browse your database.</p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 text-violet-600">
                    <FileText className="h-5 w-5" />
                    <h3 className="text-lg font-semibold text-gray-900">Handle Website Content</h3>
                  </div>
                  <p className="text-sm text-gray-500">Update FAQs, the homepage, pricing pages, and terms of service.</p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 text-amber-600">
                    <Users className="h-5 w-5" />
                    <h3 className="text-lg font-semibold text-gray-900">User Moderation</h3>
                  </div>
                  <p className="text-sm text-gray-500">Manage user accounts, enforce account suspensions for fraudulent listings, and review reported complaints.</p>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Booking queue</h3>
                    <p className="text-sm text-gray-500">Approve or decline requests across the platform in one place.</p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-600">
                    <Users className="h-4 w-4" /> {bookings.length} total requests
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100 text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-[0.2em] text-gray-400">
                        <th className="px-3 py-2">Guest</th>
                        <th className="px-3 py-2">Property</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2">Payment</th>
                        <th className="px-3 py-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {bookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-gray-50/70">
                          <td className="px-3 py-3 font-medium text-gray-800">{booking.renterName}</td>
                          <td className="px-3 py-3 text-gray-600">{booking.listingTitle ?? booking.listingId}</td>
                          <td className="px-3 py-3">
                            <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${booking.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : booking.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-gray-600">{booking.paymentStatus}</td>
                          <td className="px-3 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleUpdateBookingStatus(booking.id, 'approved')}
                                className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleUpdateBookingStatus(booking.id, 'declined')}
                                className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                              >
                                Decline
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <footer className="bg-white border-t border-gray-100 py-6 mt-12" id="app-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-sans font-extrabold text-gray-900">RentHub</span>
            <span className="text-xs text-gray-400 font-sans">&bull; Cloud Managed Rental Suite</span>
          </div>
          <div className="flex items-center space-x-4 text-xs font-sans text-gray-500">
            <span className="flex items-center gap-1"><ShieldCheck className="h-4 w-4 text-emerald-600" /> PCI-DSS Compliant</span>
            <span className="flex items-center gap-1">Made with <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" /> for real estate</span>
          </div>
        </div>
      </footer>

      {selectedProperty && (
        <PropertyDetailsModal
          property={selectedProperty}
          userRole={currentUser?.role ?? 'renter'}
          onClose={() => setSelectedProperty(null)}
          onInitiateBooking={handleInitiateBooking}
        />
      )}

      {checkoutDetails && (
        <CheckoutPaymentModal
          property={checkoutDetails.property}
          bookingDetails={{
            startDate: checkoutDetails.startDate,
            endDate: checkoutDetails.endDate,
            nights: checkoutDetails.nights,
            totalPrice: checkoutDetails.totalPrice,
          }}
          onClose={() => setCheckoutDetails(null)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {showUpgradePage && (
        <UpgradePage onClose={() => setShowUpgradePage(false)} />
      )}
    </div>
  );
}