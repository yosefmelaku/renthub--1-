import { useState, useEffect } from 'react';
import { PropertyListing, Booking } from './types';
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
  createBooking, 
  createPaymentRecord, 
  updateBookingStatus 
} from './lib/firebase';
import { ShieldCheck, Heart } from 'lucide-react';

export default function App() {
  // Navigation & Simulation State
  const [currentTab, setCurrentTab] = useState<'explore' | 'renter-dashboard' | 'owner-dashboard'>('explore');
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; role: 'renter' | 'owner' } | null>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // DB Collections State
  const [listings, setListings] = useState<PropertyListing[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Active Interactive Modal States
  const [selectedProperty, setSelectedProperty] = useState<PropertyListing | null>(null);
  const [checkoutDetails, setCheckoutDetails] = useState<{
    property: PropertyListing;
    startDate: string;
    endDate: string;
    nights: number;
    totalPrice: number;
  } | null>(null);

  // Fetch Listings on Mount
  const fetchListings = async () => {
    setLoadingListings(true);
    try {
      const data = await getAllListings();
      setListings(data);
    } catch (err) {
      console.error("Failed to fetch property listings:", err);
    } finally {
      setLoadingListings(false);
    }
  };

  // Fetch Bookings based on persona
  const fetchBookings = async () => {
    if (!currentUser) return;
    setLoadingBookings(true);
    try {
      if (currentUser.role === 'renter') {
        const data = await getBookingsByRenter(currentUser.email);
        setBookings(data);
      } else {
        const data = await getBookingsByOwner('owner_default');
        setBookings(data);
      }
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
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
  }, [currentUser?.role, currentTab, currentUser]);

  // Handle Action: Add New Listing
  const handleCreateListing = async (listingData: Omit<PropertyListing, 'id' | 'rating' | 'reviewsCount'>) => {
    try {
      const newListing = await createListing(listingData);
      setListings(prev => [newListing, ...prev]);
      return newListing;
    } catch (err) {
      console.error("Error creating listing in App:", err);
      throw err;
    }
  };

  const handleLogin = (user: { name: string; email: string; role: 'renter' | 'owner' }) => {
    setCurrentUser(user);
    setLoginModalOpen(false);
    setCurrentTab(user.role === 'owner' ? 'owner-dashboard' : 'explore');
  };

  const openLoginModal = () => setLoginModalOpen(true);

  const handleTabChange = (nextTab: AppTab) => {
    if (nextTab === 'explore') {
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
    } else if (
      (nextTab === 'renter-dashboard' && currentUser.role !== 'renter') ||
      (nextTab === 'owner-dashboard' && currentUser.role !== 'owner') ||
      (nextTab === 'super-admin' && currentUser.role !== 'super-admin')
    ) {
      alert('This dashboard is reserved for the matching persona. Use the sign-in icon to switch roles if needed.');
      return;
    }

    setCurrentTab(nextTab);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoginModalOpen(false);
    setCurrentTab('explore');
  };

  // Handle Action: Delete Listing
  const handleDeleteListing = async (listingId: string) => {
    try {
      await deleteListing(listingId);
      setListings(prev => prev.filter(l => l.id !== listingId));
    } catch (err) {
      console.error("Error deleting listing in App:", err);
    }
  };

  // Handle Action: Click Book inside details modal, initiate checkout
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
    
    // Close the details modal and open checkout
    const propertyToBook = selectedProperty;
    setSelectedProperty(null);
    
    setCheckoutDetails({
      property: propertyToBook,
      ...bookingSchedule,
    });
  };

  // Handle Action: Complete payment, save booking & payment in DB
  const handlePaymentSuccess = async (paymentDetails: {
    cardholderName: string;
    cardNumberMasked: string;
  }) => {
    if (!checkoutDetails || !currentUser) return;

    try {
      // 1. Create booking (Starts as unpaid, pending, but checkout helper auto-resolves status!)
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

      // 2. Create official payment transaction record in Firestore
      await createPaymentRecord({
        bookingId: createdBooking.id,
        renterId: currentUser.email,
        amount: checkoutDetails.totalPrice,
        cardholderName: paymentDetails.cardholderName,
        cardNumberMasked: paymentDetails.cardNumberMasked,
      });

      // Reset modal and reload bookings
      setCheckoutDetails(null);
      await fetchBookings();
      // Shift tab to view bookings instantly!
      setCurrentTab('renter-dashboard');
    } catch (err) {
      console.error("Checkout transaction transaction failed:", err);
      alert("Transaction processing error. Please try again.");
    }
  };

  // Handle Action: Cancel Stay Booking
  const handleCancelBooking = async (bookingId: string) => {
    try {
      await updateBookingStatus(bookingId, 'cancelled');
      await fetchBookings();
    } catch (err) {
      console.error("Failed to cancel stay booking:", err);
    }
  };

  // Handle Action: Approve/Decline Guest Queue Request
  const handleUpdateBookingStatus = async (bookingId: string, status: Booking['status']) => {
    try {
      await updateBookingStatus(bookingId, status);
      await fetchBookings();
    } catch (err) {
      console.error("Failed to update booking status:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col justify-between" id="app-root-layout">
      
      {/* Top Navigation */}
      <div>
        <Navbar
          currentTab={currentTab}
          setCurrentTab={handleTabChange}
          currentUser={currentUser}
          onLoginClick={openLoginModal}
          onLogout={handleLogout}
        />

        {/* Primary Page Canvas */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
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
        </main>
        {loginModalOpen && <LoginPage onLogin={handleAuthSuccess} onClose={() => setLoginModalOpen(false)} />}
      </div>

      {/* FOOTER SECTION */}
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

      {/* MODAL OVERLAYS */}
      
      {/* 1. Property Detail Specs Modal */}
      {selectedProperty && (
        <PropertyDetailsModal
          property={selectedProperty}
          userRole={currentUser.role}
          onClose={() => setSelectedProperty(null)}
          onInitiateBooking={handleInitiateBooking}
        />
      )}

      {/* 2. Secure checkout & credit card payment modal */}
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
