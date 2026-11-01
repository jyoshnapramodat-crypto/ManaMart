import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import notificationService from '../../services/notificationService';
import TableReservationModal from '../../components/TableReservationModal';
import {
  CalendarDays,
  Users,
  Clock,
  Sparkles,
  CheckCircle2,
  UtensilsCrossed,
  MapPin,
  Star,
  Search,
  ChevronRight,
  QrCode,
  Download,
  PartyPopper,
  Filter,
  ArrowRight,
} from 'lucide-react';

export default function ReservationsPage() {
  const navigate = useNavigate();

  // Active View Tab: 'explore' | 'my_tickets'
  const [activeView, setActiveView] = useState('explore');

  // Modal State
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocality, setSelectedLocality] = useState('All');

  // Customer's Existing Bookings
  const [myReservations, setMyReservations] = useState([]);
  const [loadingPasses, setLoadingPasses] = useState(false);

  // Featured Restaurants with Table Booking Capabilities
  const reservationRestaurants = [
    {
      id: 'm-1',
      name: 'Swagath Grand Authentic Kitchen',
      teluguName: 'స్వాగత్ గ్రాండ్',
      rating: 4.8,
      reviewsCount: 520,
      locality: 'Madhapur',
      city: 'Hyderabad',
      address: 'Plot 42, Hitec City Main Road, Madhapur, Hyderabad',
      avgPriceForTwo: 600,
      cuisines: ['Hyderabadi Biryani', 'South Indian', 'Tandoori'],
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
      ambienceTags: ['AC Fine Dining', 'Family Lounge', 'Live Tandoor'],
      availableTablesCount: 8,
      statusNote: 'Fast Filling for Dinner',
      tables: ['T-01 (Window Booth)', 'T-03 (Family 4-Seater)', 'T-05 (Round 6-Seater)'],
    },
    {
      id: 'm-8',
      name: 'Paradise Nizami Biryani & Royal Dining',
      teluguName: 'ప్యారడైజ్ బిర్యానీ',
      rating: 4.9,
      reviewsCount: 1420,
      locality: 'Secunderabad / Hitec City',
      city: 'Hyderabad',
      address: 'Cyber Towers Junction, Madhapur, Hyderabad',
      avgPriceForTwo: 750,
      cuisines: ['World Famous Dum Biryani', 'Mughlai', 'Kebabs'],
      image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&auto=format&fit=crop&q=80',
      ambienceTags: ['Royal Nizami Majlis', 'AC Dining', 'Private Cabins'],
      availableTablesCount: 6,
      statusNote: 'Popular for Weekend Dinners',
      tables: ['C-01 (Nizami Majlis 8-Seater)', 'T-04 (Center Booth)', 'R-01 (Sky Deck)'],
    },
    {
      id: 'm-10',
      name: 'Rayalaseema Ruchulu Heritage Kitchen',
      teluguName: 'రాయలసీమ రుచులు',
      rating: 4.7,
      reviewsCount: 480,
      locality: 'Jubilee Hills',
      city: 'Hyderabad',
      address: 'Road No. 36, Near Peddamma Temple, Jubilee Hills, Hyderabad',
      avgPriceForTwo: 700,
      cuisines: ['Ragi Mudda & Natukodi', 'Gongura Mutton', 'Andhra Meals'],
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
      ambienceTags: ['Traditional Heritage', 'AC Family Hall', 'Verandah Dining'],
      availableTablesCount: 5,
      statusNote: 'Authentic Traditional Ambiance',
      tables: ['T-02 (Window Family)', 'T-04 (4-Seater)', 'C-02 (Grand Table)'],
    },
    {
      id: 'm-9',
      name: 'Niloufer Cafe & Rooftop Heritage Lounge',
      teluguName: 'నిలోఫర్ కేఫ్',
      rating: 4.9,
      reviewsCount: 960,
      locality: 'Banjara Hills',
      city: 'Hyderabad',
      address: 'Road No. 12, Banjara Hills, Hyderabad',
      avgPriceForTwo: 350,
      cuisines: ['Irani Dum Chai', 'Osmania Biscuits', 'Bun Maska', 'Snacks'],
      image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=80',
      ambienceTags: ['Rooftop Skyview', 'Heritage Cafe', 'Open Air Seating'],
      availableTablesCount: 12,
      statusNote: 'Evening Slots Open (05:00 PM - 10:30 PM)',
      tables: ['R-01 (Sunset Deck)', 'R-02 (Sky Booth)', 'T-01 (Corner Table)'],
    },
  ];

  // Fetch user's existing reservation passes
  useEffect(() => {
    fetchPasses();
  }, []);

  const fetchPasses = async () => {
    setLoadingPasses(true);
    try {
      const localPasses = notificationService.getSavedReservations();
      try {
        const res = await api.get('/customers/reservations');
        if (res.data.success && res.data.reservations) {
          const combined = [...localPasses, ...res.data.reservations];
          const seen = new Set();
          const unique = combined.filter((r) => {
            const k = r.bookingId || r.bookingCode || r.id;
            return seen.has(k) ? false : seen.add(k);
          });
          setMyReservations(unique);
          return;
        }
      } catch (e) {}
      setMyReservations(localPasses);
    } catch (err) {
      console.error('Failed to load reservations:', err);
    } finally {
      setLoadingPasses(false);
    }
  };

  const openBookingModal = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setIsModalOpen(true);
  };

  const filteredRestaurants = reservationRestaurants.filter((rest) => {
    const matchesSearch =
      rest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rest.cuisines.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesLocality =
      selectedLocality === 'All' || rest.locality.toLowerCase().includes(selectedLocality.toLowerCase());
    return matchesSearch && matchesLocality;
  });

  return (
    <div className="bg-surface min-h-screen pb-24 md:pb-12 text-on-surface">
      
      {/* Top Hero Section */}
      <div className="bg-gradient-to-b from-surface-container-low via-surface to-surface-bright border-b border-outline-variant/30 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 bg-secondary-container/10 text-secondary-container text-xs font-bold px-3 py-1 rounded-full border border-secondary-container/20">
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>BookMyShow-Style Live Dine-In Network</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-primary">
                Restaurant Table Reservations
              </h1>
              <p className="text-xs sm:text-sm text-on-surface-variant max-w-xl mt-1">
                Select your table from live interactive floor plans, reserve without waiting queues, and receive instant digital QR entry passes.
              </p>
            </div>

            {/* View Switcher Pills */}
            <div className="flex bg-surface-container-lowest p-1 rounded-2xl shadow-level-1 border border-outline-variant/30 text-xs font-bold shrink-0">
              <button
                type="button"
                onClick={() => setActiveView('explore')}
                className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
                  activeView === 'explore'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Explore Restaurants</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveView('my_tickets');
                  fetchPasses();
                }}
                className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
                  activeView === 'my_tickets'
                    ? 'bg-secondary-container text-on-secondary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>My Dine-In Passes ({myReservations.length})</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* VIEW 1: EXPLORE & BOOK RESTAURANTS */}
        {activeView === 'explore' && (
          <div className="space-y-6">
            {/* Search & Locality Filter Row */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search biryani, tandoori, rooftop dining, or restaurant name..."
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest rounded-2xl border border-outline-variant text-xs sm:text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-xs"
                />
                <Search className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>

              {/* Locality Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                {['All', 'Madhapur', 'Jubilee Hills', 'Banjara Hills', 'Secunderabad'].map((loc) => (
                  <button
                    key={loc}
                    onClick={() => setSelectedLocality(loc)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                      selectedLocality === loc
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'bg-surface-container-lowest text-on-surface-variant hover:text-primary border border-outline-variant'
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>

            {/* Restaurant List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredRestaurants.map((restaurant) => (
                <div
                  key={restaurant.id}
                  className="bg-surface-container-lowest rounded-3xl border border-outline-variant/40 shadow-level-1 overflow-hidden hover:shadow-level-2 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Restaurant Banner */}
                    <div className="relative h-48 sm:h-52 overflow-hidden bg-slate-900">
                      <img
                        src={restaurant.image}
                        alt={restaurant.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                        <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-sm flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{restaurant.availableTablesCount} Tables Available</span>
                        </span>
                        <span className="bg-black/60 backdrop-blur-md text-amber-300 text-[10px] font-extrabold px-2.5 py-1 rounded-full">
                          {restaurant.statusNote}
                        </span>
                      </div>

                      {/* Locality & Cost on banner */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                        <span className="flex items-center space-x-1 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-lg">
                          <MapPin className="w-3.5 h-3.5 text-orange-400" />
                          <span>{restaurant.locality}, {restaurant.city}</span>
                        </span>
                        <span className="font-bold bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-lg">
                          ₹{restaurant.avgPriceForTwo} for two
                        </span>
                      </div>
                    </div>

                    {/* Card Content Details */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h2 className="text-base sm:text-lg font-black text-on-surface group-hover:text-primary transition-colors">
                            {restaurant.name}
                          </h2>
                          <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                            {restaurant.cuisines.join(' • ')}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1 bg-primary/10 text-primary px-2 py-1 rounded-xl font-bold text-xs shrink-0">
                          <Star className="w-3.5 h-3.5 fill-current text-primary" />
                          <span>{restaurant.rating}</span>
                          <span className="text-[10px] text-outline">({restaurant.reviewsCount})</span>
                        </div>
                      </div>

                      {/* Ambience & Seating Tags */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {restaurant.ambienceTags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-surface-container-low text-primary border border-outline-variant/30"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <p className="text-[11px] text-outline border-t border-outline-variant/30 pt-2 line-clamp-1">
                        📍 {restaurant.address}
                      </p>
                    </div>
                  </div>

                  {/* Dual Action Triggers: Order Online OR Book a Table */}
                  <div className="p-5 pt-0 grid grid-cols-2 gap-3 border-t border-outline-variant/20 pt-4 bg-surface-container-low/30">
                    <Link
                      to={`/store/${restaurant.id}`}
                      className="py-2.5 rounded-xl border border-primary text-primary hover:bg-surface-container font-bold text-xs flex items-center justify-center space-x-1 transition-colors"
                    >
                      <UtensilsCrossed className="w-3.5 h-3.5" />
                      <span>Order Food Online</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => openBookingModal(restaurant)}
                      className="py-2.5 rounded-xl bg-gradient-to-r from-secondary-container to-secondary text-on-secondary font-bold text-xs flex items-center justify-center space-x-1 shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      <CalendarDays className="w-3.5 h-3.5" />
                      <span>Book Table (Live)</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 2: MY DINE-IN PASSES & TICKETS (BOOKMYSHOW STYLE) */}
        {activeView === 'my_tickets' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-on-surface">Your Confirmed Dining Passes</h2>
                <p className="text-xs text-on-surface-variant">Present these digital passes at the host counter upon arrival.</p>
              </div>
              <button
                onClick={fetchPasses}
                className="text-xs font-bold text-primary hover:underline flex items-center space-x-1"
              >
                <span>Refresh Passes</span>
              </button>
            </div>

            {loadingPasses ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <span className="text-xs text-outline font-medium">Fetching your active tickets...</span>
              </div>
            ) : myReservations.length === 0 ? (
              <div className="bg-surface-container-lowest rounded-3xl p-8 sm:p-12 text-center border border-outline-variant/30 shadow-level-1 max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-secondary-container/10 text-secondary-container flex items-center justify-center mx-auto">
                  <CalendarDays className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-on-surface">No Active Table Reservations</h3>
                <p className="text-xs text-on-surface-variant">
                  You haven't reserved a dining table yet. Explore top restaurants in your area and get priority confirmed seating!
                </p>
                <button
                  onClick={() => setActiveView('explore')}
                  className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-level-1 hover:bg-primary-container transition-all"
                >
                  Explore Restaurants & Book
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myReservations.map((pass, idx) => (
                  <div
                    key={pass.bookingId || pass.bookingCode || pass.id || `res-${idx}`}
                    className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 shadow-xl border border-slate-700 relative overflow-hidden space-y-4 text-left"
                  >
                    {/* Top Notch with Pass Code */}
                    <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
                      <div className="flex items-center space-x-2">
                        <span className="p-1.5 bg-[#FF5A00] text-white rounded-lg">
                          <PartyPopper className="w-4 h-4" />
                        </span>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                            CONFIRMED DINING PASS
                          </span>
                          <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-xs">
                            {pass.merchantName}
                          </h3>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-bold bg-white/10 px-2 py-0.5 rounded text-emerald-300 border border-emerald-400/30">
                        {pass.bookingCode || pass.id}
                      </span>
                    </div>

                    {/* Pass Metrics */}
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="bg-white/5 p-2 rounded-xl">
                        <span className="text-[9px] text-slate-400 block">Date</span>
                        <span className="font-bold text-white text-xs">{pass.reservationDate}</span>
                      </div>
                      <div className="bg-white/5 p-2 rounded-xl">
                        <span className="text-[9px] text-slate-400 block">Slot</span>
                        <span className="font-bold text-amber-300 text-xs">{pass.reservationTime}</span>
                      </div>
                      <div className="bg-white/5 p-2 rounded-xl">
                        <span className="text-[9px] text-slate-400 block">Table</span>
                        <span className="font-bold text-orange-400 text-xs">{pass.tableNumber || 'Assigned'}</span>
                      </div>
                      <div className="bg-white/5 p-2 rounded-xl">
                        <span className="text-[9px] text-slate-400 block">Party</span>
                        <span className="font-bold text-emerald-400 text-xs">{pass.partySize} Guests</span>
                      </div>
                    </div>

                    {/* QR Code Block */}
                    <div className="bg-white rounded-2xl p-3 flex items-center justify-between text-slate-900">
                      <div className="space-y-0.5 text-left">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                          Digital Entry QR Pass
                        </span>
                        <p className="text-xs font-bold text-slate-900">
                          {pass.customerName}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {pass.seatingArea || 'AC Dining Hall'}
                        </p>
                        <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Priority table held for 15 mins
                        </p>
                      </div>
                      <div className="p-1 bg-slate-50 rounded-lg border border-slate-200 shrink-0">
                        <img
                          src={
                            pass.qrCode ||
                            `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
                              JSON.stringify({ code: pass.bookingCode, store: pass.merchantName })
                            )}`
                          }
                          alt="Reservation QR"
                          className="w-16 h-16 object-contain"
                        />
                      </div>
                    </div>

                    {/* Pre-ordered items if any */}
                    {pass.preOrderedItems?.length > 0 && (
                      <div className="pt-2 border-t border-slate-700/60 text-[11px] text-slate-300">
                        <span className="text-amber-300 font-bold">Pre-ordered: </span>
                        <span>{pass.preOrderedItems.map((p) => p.name).join(', ')}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* BookMyShow Style Modal */}
      {isModalOpen && (
        <TableReservationModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            fetchPasses();
          }}
          restaurant={selectedRestaurant}
        />
      )}

    </div>
  );
}
