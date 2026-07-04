import React, { useState } from 'react';
import { Booking, PropertyListing } from '../types';
import { Calendar, CreditCard, Receipt, FileText, Compass, AlertCircle, RefreshCw, Star, MapPin, ChevronDown, ChevronUp, Bed, Bath, Sparkles, Building2, Wrench, MessageSquareText } from 'lucide-react';


interface RenterDashboardProps {
  bookings: Booking[];
  listings: PropertyListing[];
  onCancelBooking: (bookingId: string) => Promise<void>;
  loading: boolean;
  onRefresh: () => void;
  onBrowseMore: () => void;
}

export const RenterDashboard: React.FC<RenterDashboardProps> = ({
  bookings,
  listings,
  onCancelBooking,
  loading,
  onRefresh,
  onBrowseMore,
}) => {
  const [selectedReceipt, setSelectedReceipt] = useState<Booking | null>(null);
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);
  const [maintenanceIssue, setMaintenanceIssue] = useState<Record<string, string>>({});

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'declined':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'cancelled':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const handleCancelClick = async (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this booking? This will immediately free up the property vacancy.')) {
      await onCancelBooking(bookingId);
    }
  };

  return (
    <div className="space-y-6" id="renter-dashboard-container">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-sans font-extrabold text-gray-900">My Stay Bookings</h2>
          <p className="text-xs text-gray-500 font-sans mt-0.5">Manage stays, check validation records, and generate secure transaction receipts.</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            id="renter-refresh-btn"
            onClick={onRefresh}
            disabled={loading}
            className="p-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-gray-600 disabled:opacity-50 cursor-pointer transition-all"
            title="Refresh bookings"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            id="renter-browse-more-btn"
            onClick={onBrowseMore}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-xs font-semibold px-4 py-2 rounded-xl shadow-xs cursor-pointer transition-colors"
          >
            Browse More Homes
          </button>
        </div>
      </div>

      {/* Main Grid / Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Bookings List (Col 1-8) */}
        <div className="lg:col-span-8 space-y-4">
          {loading ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center" id="renter-loading-state">
              <RefreshCw className="h-8 w-8 text-emerald-600 animate-spin mx-auto mb-3" />
              <p className="text-sm font-sans text-gray-500 font-medium">Fetching secure reservations database...</p>
            </div>
          ) : bookings.length > 0 ? (
            bookings.map((booking) => {
              const property = listings.find((l) => l.id === booking.listingId);
              const isExpanded = expandedBookingId === booking.id;

              return (
                <div 
                  key={booking.id} 
                  id={`renter-booking-card-${booking.id}`}
                  className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs hover:shadow-sm transition-all flex flex-col space-y-4"
                >
                  {/* Upper Main Info Block */}
                  <div className="flex flex-col md:flex-row gap-4 justify-between">
                    {/* Stay Info */}
                    <div className="flex gap-4">
                      {booking.listingImage && (
                        <img 
                          src={booking.listingImage} 
                          alt={booking.listingTitle || 'Listing'} 
                          referrerPolicy="no-referrer"
                          className="h-20 w-28 object-cover rounded-xl border border-gray-100 shrink-0"
                        />
                      )}
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className={`text-[10px] font-sans font-bold tracking-wider uppercase px-2 py-0.5 rounded-md border ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                          <span className={`text-[10px] font-sans font-bold tracking-wider uppercase px-2 py-0.5 rounded-md border ${
                            booking.paymentStatus === 'paid' 
                              ? 'bg-emerald-50/70 text-emerald-800 border-emerald-100' 
                              : 'bg-rose-50/70 text-rose-800 border-rose-100'
                          }`}>
                            {booking.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                          </span>
                        </div>

                        <h3 className="font-sans font-bold text-gray-900 text-base leading-snug truncate">
                          {booking.listingTitle || 'Premium Residence'}
                        </h3>

                        <div className="flex items-center text-xs text-gray-500 font-sans gap-3">
                          {booking.listingLocation && (
                            <div className="flex items-center shrink-0">
                              <MapPin className="h-3.5 w-3.5 mr-0.5 text-gray-400" />
                              <span>{booking.listingLocation}</span>
                            </div>
                          )}
                          <div className="flex items-center">
                            <Calendar className="h-3.5 w-3.5 mr-1 text-gray-400" />
                            <span>{booking.startDate} &rarr; {booking.endDate}</span>
                          </div>
                        </div>

                        <p className="text-xs font-mono text-gray-400">Booking ID: {booking.id.toUpperCase()}</p>
                      </div>
                    </div>

                    {/* Pricing & Control Actions */}
                    <div className="md:text-right flex flex-col justify-between items-start md:items-end border-t md:border-t-0 pt-3 md:pt-0 border-gray-100 gap-3">
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase tracking-widest font-sans font-semibold block">Total Amount</span>
                        <span className="text-lg font-extrabold text-gray-900 font-sans">${booking.totalPrice}</span>
                        <span className="text-xs text-gray-500 font-sans block mt-0.5">({booking.nights} nights)</span>
                      </div>

                      <div className="flex items-center space-x-2 w-full md:w-auto">
                        {/* Invoice Receipt option */}
                        {booking.paymentStatus === 'paid' && (
                          <button
                            id={`btn-receipt-${booking.id}`}
                            onClick={() => setSelectedReceipt(booking)}
                            className="flex-1 md:flex-initial px-3.5 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/50 rounded-xl text-xs font-semibold font-sans flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                          >
                            <Receipt className="h-4 w-4" />
                            <span>Receipt</span>
                          </button>
                        )}

                        {/* Cancel action */}
                        {(booking.status === 'pending' || booking.status === 'approved') && (
                          <button
                            id={`btn-cancel-${booking.id}`}
                            onClick={() => handleCancelClick(booking.id)}
                            className="flex-1 md:flex-initial px-3.5 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/50 rounded-xl text-xs font-semibold font-sans flex items-center justify-center cursor-pointer transition-all"
                          >
                            Cancel Stay
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expandable Specifications Area */}
                  {property && (
                    <div className="border-t border-gray-100 pt-3">
                      <div className="flex justify-between items-center">
                        <button
                          id={`toggle-specs-${booking.id}`}
                          onClick={() => setExpandedBookingId(isExpanded ? null : booking.id)}
                          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="h-3.5 w-3.5" />
                              <span>Hide Property Specifications</span>
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-3.5 w-3.5" />
                              <span>View Property Specifications</span>
                            </>
                          )}
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="mt-3 bg-gray-50/70 border border-gray-100/50 rounded-xl p-4 space-y-4 animate-fadeIn">
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                            <div className="flex items-center gap-1.5 text-gray-700 font-sans">
                              <Building2 className="h-4 w-4 text-emerald-600 shrink-0" />
                              <span className="font-semibold capitalize">{property.type} Space</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-700 font-sans">
                              <Bed className="h-4 w-4 text-emerald-600 shrink-0" />
                              <span><strong className="font-bold">{property.beds}</strong> Beds count</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-700 font-sans">
                              <Bath className="h-4 w-4 text-emerald-600 shrink-0" />
                              <span><strong className="font-bold">{property.baths}</strong> Bathrooms</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <h5 className="text-[10px] uppercase font-sans font-bold tracking-wider text-gray-400">About this property</h5>
                              <p className="text-xs text-gray-600 leading-relaxed font-sans">{property.description}</p>
                            </div>
                            <div className="space-y-1">
                              <h5 className="text-[10px] uppercase font-sans font-bold tracking-wider text-gray-400">Stay Snapshot</h5>
                              <div className="rounded-lg border border-gray-200 bg-white p-3 text-xs text-gray-600 space-y-1">
                                <p><span className="font-semibold text-gray-800">Check-in:</span> {booking.startDate}</p>
                                <p><span className="font-semibold text-gray-800">Check-out:</span> {booking.endDate}</p>
                                <p><span className="font-semibold text-gray-800">Stay length:</span> {booking.nights} nights</p>
                                <p><span className="font-semibold text-gray-800">Booking status:</span> {booking.status}</p>
                              </div>
                            </div>
                          </div>

                          {property.amenities && property.amenities.length > 0 && (
                            <div className="space-y-1">
                              <h5 className="text-[10px] uppercase font-sans font-bold tracking-wider text-gray-400">Reserved Highlights & Amenities</h5>
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {property.amenities.map((amenity, idx) => (
                                  <span key={idx} className="bg-white text-gray-700 border border-gray-200/60 text-[10px] font-sans px-2.5 py-1 rounded-md flex items-center gap-1">
                                    <Sparkles className="h-3 w-3 text-emerald-600 shrink-0" />
                                    <span>{amenity}</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3 space-y-2">
                            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                              <Wrench className="h-4 w-4" />
                              <span>AI Maintenance Desk</span>
                            </div>
                            <p className="text-xs text-emerald-800">Need help with a device, lock, or appliance? Submit a smart service request and our dispatch system will route it instantly.</p>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <input
                                type="text"
                                value={maintenanceIssue[booking.id] ?? ''}
                                onChange={(event) => setMaintenanceIssue((prev) => ({ ...prev, [booking.id]: event.target.value }))}
                                placeholder="Describe the issue"
                                className="flex-1 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-emerald-400"
                              />
                              <button
                                type="button"
                                className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
                                onClick={() => {
                                  const issue = (maintenanceIssue[booking.id] ?? '').trim();
                                  if (!issue) {
                                    alert('Please describe the maintenance issue before submitting.');
                                    return;
                                  }
                                  alert(`Maintenance request submitted for ${booking.listingTitle || 'your stay'}: ${issue}`);
                                  setMaintenanceIssue((prev) => ({ ...prev, [booking.id]: '' }));
                                }}
                              >
                                Request Help
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center space-y-4 max-w-md mx-auto" id="no-bookings-state">
              <div className="bg-gray-50 p-4 rounded-full inline-block text-gray-400">
                <Compass className="h-8 w-8" />
              </div>
              <h3 className="font-sans font-bold text-gray-800 text-lg">No Active Bookings</h3>
              <p className="text-gray-500 text-sm">
                You haven't booked any premium real estate yet. Browse our selection of luxury rentals and complete your first secure booking.
              </p>
              <button
                id="empty-bookings-browse-btn"
                onClick={onBrowseMore}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs cursor-pointer transition-colors"
              >
                Start Exploring Properties
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Interactive Invoice Receipt Panel (Col 9-12) */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs sticky top-20 space-y-4" id="receipt-preview-panel">
            <h4 className="font-sans font-bold text-gray-900 text-sm uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-emerald-600" /> Invoice Drawer
            </h4>

            {selectedReceipt ? (
              <div className="space-y-4 animate-scaleUp">
                {/* Official Invoice Graphic representation */}
                <div className="border border-gray-200 rounded-xl p-4 font-sans space-y-3 bg-gray-50 shadow-inner">
                  <div className="flex justify-between items-baseline border-b border-gray-200 pb-2">
                    <span className="text-xs font-bold text-emerald-700">RentHub Receipt</span>
                    <span className="text-[9px] text-gray-400 font-mono">STATION: ONLINE</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-400 uppercase">Guest / Customer</span>
                    <span className="text-xs font-bold text-gray-800 block">{selectedReceipt.renterName}</span>
                    <span className="text-[10px] text-gray-400 font-mono">ID: {selectedReceipt.renterId}</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-400 uppercase">Property Reserved</span>
                    <span className="text-xs font-bold text-gray-800 block truncate">{selectedReceipt.listingTitle}</span>
                    <span className="text-[10px] text-gray-500 block truncate">{selectedReceipt.listingLocation}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] border-t border-b border-gray-200/60 py-2">
                    <div>
                      <span className="text-gray-400 uppercase block">Check-in</span>
                      <span className="font-bold text-gray-700">{selectedReceipt.startDate}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 uppercase block">Check-out</span>
                      <span className="font-bold text-gray-700">{selectedReceipt.endDate}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-400 uppercase">Transaction ID</span>
                    <span className="font-mono text-[10px] font-bold text-gray-700">TXN-RES-{selectedReceipt.id.substring(8).toUpperCase()}</span>
                  </div>

                  <div className="pt-2 flex justify-between items-baseline border-t border-gray-200/60 font-sans">
                    <span className="text-xs font-bold uppercase text-gray-500">Total Charged</span>
                    <span className="text-base font-extrabold text-emerald-600">${selectedReceipt.totalPrice} USD</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-mono px-1">
                  <AlertCircle className="h-4 w-4 text-emerald-600" />
                  <span>Verified via PCI-DSS Secure Vault Core</span>
                </div>

                <button
                  id="receipt-print-btn"
                  onClick={() => window.print()}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white font-sans text-xs font-semibold py-2.5 rounded-xl cursor-pointer transition-colors text-center block"
                >
                  Print Official Receipt
                </button>
              </div>
            ) : (
              <div className="text-center py-10 px-4 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl space-y-2">
                <Receipt className="h-8 w-8 mx-auto text-gray-300" />
                <p className="text-xs font-medium font-sans">Select a paid booking from your history list to view the dynamic invoice receipt.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
