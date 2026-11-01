import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import notificationService from '../services/notificationService';
import api from '../services/api';
import confetti from 'canvas-confetti';
import {
  CalendarDays,
  Clock,
  Users,
  CheckCircle2,
  Sparkles,
  MapPin,
  X,
  QrCode,
  Share2,
  Phone,
  Utensils,
  ChevronRight,
  Download,
  PartyPopper,
  Mail,
  KeyRound,
  Zap,
  RotateCcw,
  Store,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

// Default Curated Hyperlocal Restaurants for Selection
export const AVAILABLE_RESTAURANTS = [
  {
    id: 'm-1',
    name: 'Swagath Grand Authentic Kitchen',
    businessName: 'Swagath Grand Authentic Kitchen',
    cuisine: 'Hyderabadi Dum Biryani, South Indian & Tandoor',
    locality: 'Madhapur',
    city: 'Hyderabad',
    rating: 4.8,
    priceForTwo: '₹600 for two',
    address: 'Plot 42, Hitec City Main Road, Madhapur, Hyderabad',
  },
  {
    id: 'm-3',
    name: 'Annapurna Sweets & Bakery',
    businessName: 'Annapurna Sweets & Bakery',
    cuisine: 'Pure Ghee Sweets, Chaat & Cafe Snacks',
    locality: 'Banjara Hills',
    city: 'Hyderabad',
    rating: 4.9,
    priceForTwo: '₹350 for two',
    address: 'Road No. 2, Near Sagar Society, Banjara Hills, Hyderabad',
  },
  {
    id: 'm-8',
    name: 'Paradise Nizami Biryani & Royal Dining',
    businessName: 'Paradise Nizami Biryani & Royal Dining',
    cuisine: 'World Famous Nizami Biryani, Mughlai & Kebabs',
    locality: 'Secunderabad / Hitec City',
    city: 'Hyderabad',
    rating: 4.9,
    priceForTwo: '₹750 for two',
    address: 'Cyber Towers Junction, Madhapur, Hyderabad',
  },
  {
    id: 'm-10',
    name: 'Rayalaseema Ruchulu Heritage Kitchen',
    businessName: 'Rayalaseema Ruchulu Heritage Kitchen',
    cuisine: 'Rayalaseema Natukodi, Ragi Mudda & Andhra Meals',
    locality: 'Jubilee Hills',
    city: 'Hyderabad',
    rating: 4.7,
    priceForTwo: '₹700 for two',
    address: 'Road No. 36, Near Peddamma Temple, Jubilee Hills, Hyderabad',
  },
  {
    id: 'm-9',
    name: 'Niloufer Cafe & Rooftop Heritage Lounge',
    businessName: 'Niloufer Cafe & Rooftop Heritage Lounge',
    cuisine: 'Irani Dum Chai, Osmania Biscuits & Cafe Dining',
    locality: 'Banjara Hills',
    city: 'Hyderabad',
    rating: 4.9,
    priceForTwo: '₹350 for two',
    address: 'Road No. 12, Banjara Hills, Hyderabad',
  },
];

export default function TableReservationModal({ isOpen, onClose, restaurant }) {
  const { user } = useAuth();

  // Wizard Steps:
  // 1: Restaurant, Date, Time & Guests
  // 2: BookMyShow Table & Seating Selector
  // 3: Guest Details (Name, Email, Phone, Dietary Requests)
  // 4: OTP Verification UI (5-min expiry + Dev Mailbox auto-fill)
  // 5: Confirmed E-Ticket Pass
  const [step, setStep] = useState(1);

  // Active Restaurant Selection
  const [activeRestaurant, setActiveRestaurant] = useState(
    restaurant || AVAILABLE_RESTAURANTS[0]
  );

  // Sync prop changes
  useEffect(() => {
    if (restaurant) {
      setActiveRestaurant(restaurant);
    }
  }, [restaurant]);

  // Form State
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedTime, setSelectedTime] = useState('07:30 PM');
  const [partySize, setPartySize] = useState(4);
  const [selectedZone, setSelectedZone] = useState('ac_hall'); // 'ac_hall' | 'rooftop' | 'cabin'
  const [selectedTable, setSelectedTable] = useState('T-04');
  const [occasion, setOccasion] = useState('Casual Dining');
  const [specialRequests, setSpecialRequests] = useState('');

  // Guest Details (Full Name, Email, Phone)
  const [guestName, setGuestName] = useState(user?.name || 'Sravan Kumar');
  const [guestEmail, setGuestEmail] = useState(user?.email || 'customer@gmail.com');
  const [guestPhone, setGuestPhone] = useState(user?.phone || '9876543210');

  // Pre-order items
  const [preOrderedDishes, setPreOrderedDishes] = useState([]);

  // OTP Verification State (Simulated Fake Email System)
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState(null);
  const [otpSending, setOtpSending] = useState(false);
  const [otpSecondsLeft, setOtpSecondsLeft] = useState(300); // 5 minutes
  const [otpSentNotice, setOtpSentNotice] = useState(null);

  // Confirmed Reservation
  const [confirmedReservation, setConfirmedReservation] = useState(null);

  // Auto-Fill Event Listener: Listens to 'manamart:autofill-otp' from Dev Mailbox
  useEffect(() => {
    const handleAutoFillEvent = (e) => {
      if (e.detail?.otp) {
        setEnteredOtp(e.detail.otp);
        setOtpError(null);
      }
    };

    window.addEventListener('manamart:autofill-otp', handleAutoFillEvent);
    return () => {
      window.removeEventListener('manamart:autofill-otp', handleAutoFillEvent);
    };
  }, []);

  // OTP Countdown Timer (Active during Step 4)
  useEffect(() => {
    if (step !== 4) return;
    setOtpSecondsLeft(300);

    const interval = setInterval(() => {
      setOtpSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step]);

  if (!isOpen) return null;

  // Available dates (Next 7 days)
  const dateOptions = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNumber = d.getDate();
    const month = d.toLocaleDateString('en-US', { month: 'short' });
    return { dateStr, dayName, dayNumber, month };
  });

  // Time Slots
  const timeSlots = [
    '12:30 PM',
    '01:15 PM',
    '02:00 PM',
    '05:30 PM',
    '07:00 PM',
    '07:30 PM',
    '08:00 PM',
    '08:45 PM',
    '09:30 PM',
  ];

  // Visual Interactive Tables for Floor Plan (BookMyShow-style seat grid)
  const floorTables = [
    { id: 'T-01', name: 'Window Booth 1', seats: 2, zone: 'ac_hall', status: 'available' },
    { id: 'T-02', name: 'Window Booth 2', seats: 2, zone: 'ac_hall', status: 'occupied' },
    { id: 'T-03', name: 'Family Center 3', seats: 4, zone: 'ac_hall', status: 'available' },
    { id: 'T-04', name: 'Family Center 4', seats: 4, zone: 'ac_hall', status: 'available' },
    { id: 'T-05', name: 'Round Table 5', seats: 6, zone: 'ac_hall', status: 'available' },
    { id: 'T-06', name: 'Round Table 6', seats: 6, zone: 'ac_hall', status: 'occupied' },
    { id: 'R-01', name: 'Sunset Corner', seats: 2, zone: 'rooftop', status: 'available' },
    { id: 'R-02', name: 'Skyline Terrace', seats: 4, zone: 'rooftop', status: 'available' },
    { id: 'R-03', name: 'Star Deck', seats: 6, zone: 'rooftop', status: 'available' },
    { id: 'C-01', name: 'Nizami Majlis', seats: 8, zone: 'cabin', status: 'available' },
    { id: 'C-02', name: 'Royal Chamber', seats: 10, zone: 'cabin', status: 'available' },
  ];

  const currentZoneTables = floorTables.filter((t) => t.zone === selectedZone);

  // Sample dishes for pre-order
  const sampleDishes = [
    { name: 'Special Chicken Dum Biryani', price: 340, desc: 'Served with mirchi ka salan and dahi raita' },
    { name: 'Paneer Butter Masala', price: 280, desc: 'Rich cashew gravy with fresh cottage cheese' },
    { name: 'Butter Garlic Naan (2 pcs)', price: 90, desc: 'Fresh tandoor baked' },
    { name: 'Niloufer Special Irani Chai Pot', price: 120, desc: 'Hot aromatic chai serves 4' },
  ];

  const togglePreorderItem = (dish) => {
    setPreOrderedDishes((prev) => {
      const exists = prev.find((p) => p.name === dish.name);
      if (exists) return prev.filter((p) => p.name !== dish.name);
      return [...prev, dish];
    });
  };

  // STEP 3 -> STEP 4: Send OTP Email
  const handleRequestOtp = (e) => {
    if (e) e.preventDefault();
    if (!guestName.trim()) {
      alert('Please enter primary guest name.');
      return;
    }
    if (!guestEmail.trim() || !guestEmail.includes('@')) {
      alert('Please enter a valid guest email address to receive your OTP.');
      return;
    }
    if (!guestPhone.trim()) {
      alert('Please enter your mobile phone number.');
      return;
    }

    setOtpSending(true);
    setOtpError(null);

    const context = {
      restaurantName: activeRestaurant.businessName || activeRestaurant.name,
      guestName: guestName.trim(),
      date: selectedDate,
      time: selectedTime,
      guests: partySize,
      tableNumber: selectedTable,
    };

    const res = notificationService.sendOtpEmail(guestEmail, context);
    setOtpSending(false);

    if (res.success) {
      setOtpSentNotice(`6-Digit OTP sent to ${guestEmail}! Check the Dev Fake Mailbox at bottom-right.`);
      setStep(4);
    }
  };

  // Resend OTP
  const handleResendOtp = () => {
    const context = {
      restaurantName: activeRestaurant.businessName || activeRestaurant.name,
      guestName: guestName.trim(),
      date: selectedDate,
      time: selectedTime,
      guests: partySize,
      tableNumber: selectedTable,
    };
    notificationService.sendOtpEmail(guestEmail, context);
    setOtpSecondsLeft(300);
    setOtpSentNotice('Fresh 6-Digit OTP dispatched! Check Dev Fake Mailbox.');
  };

  // STEP 4 -> STEP 5: Verify OTP & Confirm Reservation
  const handleVerifyOtpAndConfirm = async (e) => {
    e.preventDefault();
    if (!enteredOtp || enteredOtp.trim().length !== 6) {
      setOtpError('Please enter the 6-digit numeric OTP code.');
      return;
    }

    setOtpSending(true);
    const verifyResult = notificationService.verifyOtp(guestEmail, enteredOtp);

    if (!verifyResult.success) {
      setOtpError(verifyResult.message);
      setOtpSending(false);
      return;
    }

    // OTP Verified! Mark reservation confirmed and send Post-Confirmation Email
    const bookingId = `MNM-RES-${Math.floor(100000 + Math.random() * 900000)}`;
    const seatingArea =
      selectedZone === 'ac_hall'
        ? 'AC Fine Dining Hall'
        : selectedZone === 'rooftop'
        ? 'Rooftop Sky Lounge'
        : 'Private Royal Cabin';

    const bookingPayload = {
      bookingId,
      bookingCode: bookingId,
      merchantId: activeRestaurant.id || 'm-1',
      merchantName: activeRestaurant.businessName || activeRestaurant.name,
      customerName: guestName.trim(),
      guestName: guestName.trim(),
      phone: guestPhone.trim(),
      email: guestEmail.trim(),
      partySize,
      reservationDate: selectedDate,
      date: selectedDate,
      reservationTime: selectedTime,
      time: selectedTime,
      tableNumber: selectedTable,
      seatingArea,
      occasion,
      specialRequests: specialRequests || 'None',
      preOrderedItems: preOrderedDishes,
      status: 'Confirmed',
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${bookingId}`,
    };

    // Trigger Post-Confirmation Email in Notification System
    notificationService.sendReservationConfirmation(guestEmail, bookingPayload);

    // Also attempt backend creation if server is up
    try {
      await api.post('/orders/reservation', bookingPayload);
    } catch (err) {
      // Offline fallback: already saved in localStorage via notificationService
    }

    setConfirmedReservation(bookingPayload);
    setOtpSending(false);
    setStep(5);

    // Confetti celebration
    confetti({
      particleCount: 130,
      spread: 75,
      origin: { y: 0.6 },
    });
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-100">
        
        {/* Modal Top Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-[#003527]/5 via-orange-50/50 to-amber-50/30 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-xs">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                {step === 5
                  ? 'Confirmed Dine-In Pass'
                  : `Book Table at ${activeRestaurant.businessName || activeRestaurant.name}`}
              </h2>
              <span className="text-[11px] font-medium text-slate-500">
                {step === 5
                  ? 'Show digital QR pass on arrival'
                  : 'Live BookMyShow-Style Seating & Verified Reservation'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors shadow-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Wizard Step Progress Indicator (Steps 1 to 4) */}
        {step < 5 && (
          <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs font-bold shrink-0 overflow-x-auto no-scrollbar gap-2">
            <button
              onClick={() => setStep(1)}
              className={`flex items-center space-x-1 transition-colors flex-shrink-0 ${
                step === 1 ? 'text-orange-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px]">1</span>
              <span>Details</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
            
            <button
              onClick={() => setStep(2)}
              className={`flex items-center space-x-1 transition-colors flex-shrink-0 ${
                step === 2 ? 'text-orange-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px]">2</span>
              <span>Table ({selectedTable})</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />

            <button
              onClick={() => setStep(3)}
              className={`flex items-center space-x-1 transition-colors flex-shrink-0 ${
                step === 3 ? 'text-orange-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px]">3</span>
              <span>Guest Info</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />

            <button
              disabled={step < 4}
              className={`flex items-center space-x-1 transition-colors flex-shrink-0 ${
                step === 4 ? 'text-orange-600' : 'text-slate-400 opacity-60'
              }`}
            >
              <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px]">4</span>
              <span>OTP Verify</span>
            </button>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {/* ============================================================== */}
          {/* STEP 1: RESTAURANT SELECTION, DATE, TIME & GUESTS */}
          {/* ============================================================== */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Restaurant Selector Dropdown / Switcher */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center justify-between">
                  <span className="flex items-center space-x-1">
                    <Store className="w-3.5 h-3.5 text-orange-600" />
                    <span>Selected Restaurant</span>
                  </span>
                  <span className="text-[11px] text-orange-600 font-semibold">Changeable</span>
                </label>

                <select
                  value={activeRestaurant.id}
                  onChange={(e) => {
                    const found = AVAILABLE_RESTAURANTS.find((r) => r.id === e.target.value);
                    if (found) setActiveRestaurant(found);
                  }}
                  className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-orange-500 shadow-xs"
                >
                  {AVAILABLE_RESTAURANTS.map((rest) => (
                    <option key={rest.id} value={rest.id}>
                      {rest.businessName} ({rest.locality}) — {rest.cuisine}
                    </option>
                  ))}
                </select>

                <p className="text-[11px] text-slate-500 mt-1">
                  📍 {activeRestaurant.address || 'Hitec City Main Road, Hyderabad'} • {activeRestaurant.priceForTwo || '₹600 for two'}
                </p>
              </div>

              {/* Party Size Stepper (1 to 10 guests) */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2 flex items-center justify-between">
                  <span>How many guests are dining?</span>
                  <span className="text-orange-600 font-extrabold">{partySize} Guests</span>
                </label>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setPartySize(num)}
                      className={`px-3 py-2 rounded-xl text-xs font-extrabold flex-shrink-0 transition-all ${
                        partySize === num
                          ? 'bg-gradient-to-r from-[#003527] to-[#055c24] text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {num} {num === 1 ? 'Guest' : 'Guests'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Selector Carousel */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">Select Dining Date</label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {dateOptions.map((item) => (
                    <button
                      key={item.dateStr}
                      type="button"
                      onClick={() => setSelectedDate(item.dateStr)}
                      className={`p-2.5 rounded-2xl flex flex-col items-center justify-center transition-all ${
                        selectedDate === item.dateStr
                          ? 'bg-gradient-to-b from-orange-600 to-amber-600 text-white shadow-md'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/70'
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase">{item.dayName}</span>
                      <span className="text-sm font-black mt-0.5">{item.dayNumber}</span>
                      <span className="text-[9px] opacity-80">{item.month}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slots Grid */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">Select Arrival Time Slot</label>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                        selectedTime === time
                          ? 'bg-orange-50 border-orange-500 text-orange-950 font-black ring-1 ring-orange-200'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 2: BOOKMYSHOW-STYLE VISUAL TABLE & SEAT GRID */}
          {/* ============================================================== */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Zone Filter Tabs */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">Choose Seating Ambience</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'ac_hall', label: 'AC Fine Dining' },
                    { id: 'rooftop', label: 'Rooftop Lounge' },
                    { id: 'cabin', label: 'Royal Cabin' },
                  ].map((z) => (
                    <button
                      key={z.id}
                      type="button"
                      onClick={() => setSelectedZone(z.id)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                        selectedZone === z.id
                          ? 'bg-[#003527] text-white border-[#003527] shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {z.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive Floor Plan Grid */}
              <div className="p-4 bg-slate-50/80 rounded-3xl border border-slate-200 space-y-3">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Tap Table to Select Your Spot
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {currentZoneTables.map((table) => {
                    const isOccupied = table.status === 'occupied';
                    const isSelected = selectedTable === table.id;

                    return (
                      <button
                        key={table.id}
                        type="button"
                        disabled={isOccupied}
                        onClick={() => setSelectedTable(table.id)}
                        className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-between transition-all cursor-pointer ${
                          isOccupied
                            ? 'bg-slate-200/60 border-slate-300 text-slate-400 cursor-not-allowed opacity-60'
                            : isSelected
                            ? 'bg-orange-50 border-orange-500 text-slate-900 shadow-md ring-2 ring-orange-200'
                            : 'bg-white border-slate-200 hover:border-emerald-400 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="font-mono font-extrabold text-xs">{table.id}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
                            {table.seats} Seats
                          </span>
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center my-1 text-slate-600">
                          <Users className="w-4 h-4 text-slate-500" />
                        </div>
                        <span className="text-xs font-bold truncate">{table.name}</span>
                        <span className="text-[9px] text-slate-400 mt-0.5">
                          {isOccupied ? 'Occupied' : isSelected ? 'Selected' : 'Available'}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-center space-x-6 text-[10px] font-bold text-slate-600">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-3.5 h-3.5 rounded-md bg-white border-2 border-slate-200"></div>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <div className="w-3.5 h-3.5 rounded-md bg-orange-500"></div>
                    <span>Your Table</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <div className="w-3.5 h-3.5 rounded-md bg-slate-300"></div>
                    <span>Occupied</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                <span>Selected: <strong>{selectedTable}</strong> in {selectedZone === 'ac_hall' ? 'AC Hall' : selectedZone === 'rooftop' ? 'Rooftop' : 'Royal Cabin'}</span>
                <span className="font-bold text-orange-600">Zero Booking Fee</span>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 3: GUEST DETAILS (NAME, EMAIL, PHONE, SPECIAL NOTES) */}
          {/* ============================================================== */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
                <span className="font-bold block flex items-center space-x-1">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  <span>Email Verification Required</span>
                </span>
                <p className="text-[11px] text-blue-800 leading-tight">
                  A 6-digit verification code will be sent to your email to prevent duplicate or prank reservations. In development mode, all emails are captured in the <strong>Dev Fake Mailbox</strong> at the bottom-right!
                </p>
              </div>

              {/* Guest Details Form */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Primary Guest Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g. Sravan Kumar"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium outline-none focus:border-orange-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Email Address (For OTP & Pass) *
                    </label>
                    <input
                      type="email"
                      required
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="e.g. customer@gmail.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium outline-none focus:border-orange-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium outline-none focus:border-orange-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Occasion
                  </label>
                  <select
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium outline-none"
                  >
                    <option value="Casual Dining">Casual Dining</option>
                    <option value="Birthday Celebration">Birthday Celebration</option>
                    <option value="Anniversary">Anniversary</option>
                    <option value="Business Meeting">Business Meeting</option>
                    <option value="Family Gathering">Family Gathering</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Special Requests / Dietary Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="e.g. High chair for toddler, Jain food, quiet window booth..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Optional Pre-Order Items */}
              <div className="pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 flex items-center space-x-1 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Optional Course Pre-Order (Ready upon table seating)</span>
                </label>

                <div className="space-y-2">
                  {sampleDishes.map((dish) => {
                    const isSelected = preOrderedDishes.some((d) => d.name === dish.name);
                    return (
                      <div
                        key={dish.name}
                        onClick={() => togglePreorderItem(dish)}
                        className={`p-2.5 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50/70 border-emerald-400 text-emerald-950 font-bold'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                        }`}
                      >
                        <div>
                          <p className="text-xs">{dish.name}</p>
                          <p className="text-[10px] text-slate-500 font-normal">{dish.desc}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-black text-slate-900">₹{dish.price}</span>
                          <span className={`w-5 h-5 rounded-lg text-xs font-bold flex items-center justify-center ${
                            isSelected ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-300'
                          }`}>
                            {isSelected ? '✓' : '+'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 4: OTP VERIFICATION UI (5-MIN EXPIRY & DEV MAILBOX) */}
          {/* ============================================================== */}
          {step === 4 && (
            <div className="space-y-4 max-w-md mx-auto py-2 text-center">
              <div className="w-14 h-14 rounded-3xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto shadow-inner">
                <KeyRound className="w-7 h-7" />
              </div>

              <div>
                <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider block">
                  Verify Table Reservation
                </span>
                <h3 className="text-base font-black text-slate-900">
                  Enter 6-Digit Verification OTP
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  We've simulated an email to <span className="font-bold text-slate-800">{guestEmail}</span>
                </p>
              </div>

              {/* Dev notice banner */}
              <div className="p-3 rounded-2xl bg-slate-900 text-white text-xs text-left space-y-1">
                <div className="flex items-center space-x-1.5 text-orange-400 font-bold text-[11px]">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Dev Fake Mailbox Active:</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Open the <strong>📬 Dev Fake Mailbox</strong> at the bottom-right corner and tap <strong>"Auto-fill OTP"</strong> to complete instantly!
                </p>
              </div>

              {/* 6-Digit OTP Form */}
              <form onSubmit={handleVerifyOtpAndConfirm} className="space-y-3">
                <div>
                  <input
                    type="text"
                    required
                    maxLength="6"
                    value={enteredOtp}
                    onChange={(e) => {
                      setEnteredOtp(e.target.value.replace(/\D/g, ''));
                      setOtpError(null);
                    }}
                    placeholder="• • • • • •"
                    className="w-full text-center text-3xl font-mono font-black tracking-[10px] py-3.5 rounded-2xl bg-slate-50 border-2 border-slate-300 focus:border-orange-500 focus:bg-white outline-none transition-all shadow-inner"
                    autoFocus
                  />
                  {otpError && (
                    <p className="text-xs font-bold text-red-600 mt-1.5 flex items-center justify-center space-x-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{otpError}</span>
                    </p>
                  )}
                </div>

                {/* Expiry Timer & Resend */}
                <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Expires in: <strong className="font-mono text-orange-600">{formatTimer(otpSecondsLeft)}</strong></span>
                  </span>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={otpSecondsLeft > 240}
                    className="text-orange-600 font-bold hover:underline disabled:text-slate-400 disabled:no-underline"
                  >
                    Resend Code
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={otpSending || enteredOtp.length !== 6}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#003527] to-[#055c24] text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {otpSending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>Verify Code & Confirm Table</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 5: CONFIRMED RESERVATION DIGITAL PASS */}
          {/* ============================================================== */}
          {step === 5 && confirmedReservation && (
            <div className="space-y-4 text-center">
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden text-left border border-slate-700">
                
                {/* Header Badge */}
                <div className="flex items-center justify-between border-b border-slate-700/80 pb-3 mb-4">
                  <div className="flex items-center space-x-2.5">
                    <span className="p-2 bg-orange-600 text-white rounded-xl shadow-xs">
                      <PartyPopper className="w-5 h-5" />
                    </span>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 block">
                        CONFIRMED DINE-IN PASS
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                        {confirmedReservation.merchantName}
                      </h3>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold bg-white/10 px-2.5 py-1 rounded-lg text-emerald-300 border border-emerald-400/30">
                    #{confirmedReservation.bookingCode}
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs mb-4">
                  <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                    <span className="text-[10px] text-slate-400 block">Date</span>
                    <span className="font-bold text-white text-xs">{confirmedReservation.reservationDate}</span>
                  </div>
                  <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                    <span className="text-[10px] text-slate-400 block">Time Slot</span>
                    <span className="font-bold text-amber-300 text-xs">{confirmedReservation.reservationTime}</span>
                  </div>
                  <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                    <span className="text-[10px] text-slate-400 block">Table</span>
                    <span className="font-bold text-orange-400 text-xs">{confirmedReservation.tableNumber}</span>
                  </div>
                  <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                    <span className="text-[10px] text-slate-400 block">Party Size</span>
                    <span className="font-bold text-emerald-400 text-xs">{confirmedReservation.partySize} Guests</span>
                  </div>
                </div>

                {/* QR Pass Box */}
                <div className="bg-white rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-900">
                  <div className="space-y-1 text-center sm:text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Digital Entry QR Pass
                    </span>
                    <p className="text-xs font-bold text-slate-900">
                      Guest: {confirmedReservation.customerName}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Area: {confirmedReservation.seatingArea}
                    </p>
                    <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Confirmation email dispatched to {confirmedReservation.email}</span>
                    </p>
                  </div>
                  <div className="p-1.5 bg-slate-50 rounded-xl border border-slate-200 shrink-0">
                    <img
                      src={confirmedReservation.qrCode}
                      alt="Reservation QR Code"
                      className="w-20 h-20 object-contain"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => alert(`Dine-In Pass #${confirmedReservation.bookingCode} saved. Show this QR code upon arrival!`)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Pass</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-[#003527] hover:bg-[#055c24] text-white text-xs font-bold flex items-center space-x-1.5 shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Done</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Actions Footer (Steps 1 to 3) */}
        {step < 4 && (
          <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                Back
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                Cancel
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold flex items-center space-x-1 shadow-md transition-all active:scale-95"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRequestOtp}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md transition-all active:scale-95"
              >
                <span>Request Verification OTP</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
