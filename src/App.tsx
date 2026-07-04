import { useState, useEffect } from 'react';
import { PropertyListing, Booking, AppUser } from './types';
import { Navbar } from './components/Navbar';
import { ListingExplorer } from './components/ListingExplorer';
import { PropertyDetailsModal } from './components/PropertyDetailsModal';
import { CheckoutPaymentModal } from './components/CheckoutPaymentModal';
import { RenterDashboard } from './components/RenterDashboard';
import { OwnerDashboard } from './components/OwnerDashboard';
import { LoginPage } from './components/LoginPage';
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
import { ShieldCheck, Heart, Users, Building2, DollarSign, Clock3, Database, ReceiptText, Palette, ArrowUpRight, BadgeCheck } from 'lucide-react';

type AppTab = 'explore' | 'renter-dashboard' | 'owner-dashboard' | 'super-admin';

export default function App() {
  const [currentTab, setCurrentTab] = useState<AppTab>('explore');
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
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
    setLoginModalOpen(false);
    setAccessNotice(null);
    setCurrentTab(user.role === 'owner' ? 'owner-dashboard' : user.role === 'super-admin' ? 'super-admin' : 'explore');
  };

  const openLoginModal = () => setLoginModalOpen(true);

  const handleTabChange = (nextTab: AppTab) => {
    if (nextTab === 'explore') {
      setAccessNotice(null);
      setCurrentTab('explore');
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
    setLoginModalOpen(false);
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
    if (!currentUser || currentUser.role !== 'renter') {
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
      console.error('Checkout transaction transaction failed:', err);
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

  const brandPresets = [
    { name: 'Luxora', status: 'Live', accent: 'Emerald' },
    { name: 'Harbor', status: 'Review', accent: 'Slate' },
    { name: 'Northstar', status: 'Live', accent: 'Indigo' },
  ];

  const auditTrail = [
    { event: 'Booking authorized', actor: 'Tenant Admin', time: '08:22', result: 'Approved' },
    { event: 'Listing published', actor: 'Host Ops', time: '09:05', result: 'Synced' },
    { event: 'Refund request', actor: 'Compliance', time: '11:40', result: 'Pending' },
  ];

  const databaseRows = [
    { table: 'bookings', rows: '1,248', latency: '12ms', health: 'Healthy' },
    { table: 'listings', rows: '386', latency: '8ms', health: 'Healthy' },
    { table: 'payments', rows: '742', latency: '15ms', health: 'Monitoring' },
  ];

  const ledgerRows = [
    { entry: 'Reservation Clearing', debit: '$4,200', credit: '$0', balance: '$4,200' },
    { entry: 'Service Commission', debit: '$0', credit: '$315', balance: '$3,885' },
    { entry: 'Payout Batch', debit: '$2,100', credit: '$0', balance: '$1,785' },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col justify-between" id="app-root-layout">
      <div>
        <Navbar
          currentTab={currentTab}
          setCurrentTab={handleTabChange}
          currentUser={currentUser}
          globalSearchTerm={globalSearchTerm}
          setGlobalSearchTerm={setGlobalSearchTerm}
          onLoginClick={openLoginModal}
          onLogout={handleLogout}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {accessNotice && (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 shadow-sm" role="alert">
              {accessNotice}
            </div>
          )}

          {currentTab === 'explore' && (
            <div className="animate-fadeIn">
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
                    <h2 className="text-3xl font-bold">System-wide oversight for listings, bookings, and revenue</h2>
                    <p className="text-sm text-slate-400">Monitor platform activity, approve pending requests, and keep the marketplace moving from one command center.</p>
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

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <Palette className="h-5 w-5" />
                    <h3 className="text-lg font-semibold text-gray-900">Brand Provisioning</h3>
                  </div>
                  <p className="text-sm text-gray-500">Deploy tenant-facing themes and brand surfaces from a single control point.</p>
                  <div className="space-y-3">
                    {brandPresets.map((brand) => (
                      <div key={brand.name} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{brand.name}</p>
                          <p className="text-xs text-gray-500">{brand.accent} theme</p>
                        </div>
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">{brand.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 text-sky-600">
                    <ReceiptText className="h-5 w-5" />
                    <h3 className="text-lg font-semibold text-gray-900">SOC-2 Audit Trail</h3>
                  </div>
                  <div className="space-y-3">
                    {auditTrail.map((entry) => (
                      <div key={entry.event} className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-gray-800">{entry.event}</p>
                          <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">{entry.result}</span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">{entry.actor} • {entry.time}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 text-violet-600">
                    <Database className="h-5 w-5" />
                    <h3 className="text-lg font-semibold text-gray-900">PostgreSQL Explorer</h3>
                  </div>
                  <div className="space-y-3">
                    {databaseRows.map((row) => (
                      <div key={row.table} className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-gray-800">{row.table}</p>
                          <span className="rounded-full bg-sky-50 px-2 py-1 text-[10px] font-semibold text-sky-700">{row.health}</span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">{row.rows} rows • {row.latency}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Double-Entry Accounting Ledger</h3>
                    <p className="text-sm text-gray-500">Track debits, credits, and balances for every platform transaction.</p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-600">
                    <BadgeCheck className="h-4 w-4 text-emerald-600" /> Balanced
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100 text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-[0.2em] text-gray-400">
                        <th className="px-3 py-2">Entry</th>
                        <th className="px-3 py-2">Debit</th>
                        <th className="px-3 py-2">Credit</th>
                        <th className="px-3 py-2">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {ledgerRows.map((row) => (
                        <tr key={row.entry} className="hover:bg-gray-50/70">
                          <td className="px-3 py-3 font-medium text-gray-800">{row.entry}</td>
                          <td className="px-3 py-3 text-gray-600">{row.debit}</td>
                          <td className="px-3 py-3 text-gray-600">{row.credit}</td>
                          <td className="px-3 py-3 font-semibold text-gray-900">{row.balance}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
<<<<<<< HEAD
=======

>>>>>>> 97550ecc69837981a0af58df376d0eb50552e42e
        {loginModalOpen && <LoginPage onLogin={handleAuthSuccess} onClose={() => setLoginModalOpen(false)} />}
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
    </div>
  );
}
