import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
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
} from 'lucide-react';

export default function TableReservationModal({ isOpen, onClose, restaurant }) {
  const { user } = useAuth();

  // Reservation Wizard Steps: 1: Date & Time, 2: Visual Table Selector, 3: Pre-order & Guest Info, 4: Confirmed E-Ticket
  const [step, setStep] = useState(1);

  // Form State
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedTime, setSelectedTime] = useState('08:00 PM');
  const [partySize, setPartySize] = useState(4);
  const [selectedZone, setSelectedZone] = useState('ac_hall'); // 'ac_hall' | 'rooftop' | 'cabin' | 'lawn'
  const [selectedTable, setSelectedTable] = useState('T-04');
  const [occasion, setOccasion] = useState('Casual Dining');
  const [specialRequests, setSpecialRequests] = useState('');
  const [guestName, setGuestName] = useState(user?.name || '');
  const [guestPhone, setGuestPhone] = useState(user?.phone || '');

  // Pre-order items
  const [preOrderedDishes, setPreOrderedDishes] = useState([]);

  // Submission State
  const [loading, setLoading] = useState(false);
  const [confirmedReservation, setConfirmedReservation] = useState(null);

  if (!isOpen || !restaurant) return null;

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
    { label: 'Lunch (12:30 PM)', time: '12:30 PM' },
    { label: 'Lunch (01:15 PM)', time: '01:15 PM' },
    { label: 'Lunch (02:00 PM)', time: '02:00 PM' },
    { label: 'Evening (05:30 PM)', time: '05:30 PM' },
    { label: 'Dinner (07:30 PM)', time: '07:30 PM' },
    { label: 'Dinner (08:15 PM)', time: '08:15 PM' },
    { label: 'Dinner (09:00 PM)', time: '09:00 PM' },
    { label: 'Dinner (09:45 PM)', time: '09:45 PM' },
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

  // Quick pre-order sample items from restaurant
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

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/orders/reservation', {
        merchantId: restaurant.id,
        partySize,
        reservationDate: selectedDate,
        reservationTime: selectedTime,
        tableNumber: selectedTable,
        seatingArea:
          selectedZone === 'ac_hall'
            ? 'AC Fine Dining Hall'
            : selectedZone === 'rooftop'
            ? 'Rooftop Sky Lounge'
            : 'Private Royal Cabin',
        occasion,
        specialRequests,
        guestName: guestName.trim() || user?.name || 'Valued Guest',
        guestPhone: guestPhone.trim() || user?.phone || '9876543210',
        preOrderedItems: preOrderedDishes,
      });

      if (res.data.success) {
        setConfirmedReservation(res.data.reservation);
        setStep(4);
      }
    } catch (err) {
      console.error('Reservation error:', err);
      alert('Could not confirm reservation. Please check details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-100">
        
        {/* Modal Top Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-surface-container-lowest shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#FF5A00] flex items-center justify-center">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                {step === 4 ? 'Confirmed Reservation Pass' : `Book a Table at ${restaurant.businessName || restaurant.name}`}
              </h2>
              <span className="text-[11px] font-medium text-slate-500">
                {step === 4 ? 'Show this QR ticket upon arrival at the restaurant' : 'BookMyShow-Style Live Seat & Dine-In Selector'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Step Navigation Indicator (Steps 1-3) */}
        {step < 4 && (
          <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs font-bold shrink-0">
            <button
              onClick={() => setStep(1)}
              className={`flex items-center space-x-1.5 transition-colors ${
                step === 1 ? 'text-[#FF5A00]' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px]">1</span>
              <span>Date & Time</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <button
              onClick={() => setStep(2)}
              className={`flex items-center space-x-1.5 transition-colors ${
                step === 2 ? 'text-[#FF5A00]' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px]">2</span>
              <span>Select Table ({selectedTable})</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <button
              onClick={() => setStep(3)}
              className={`flex items-center space-x-1.5 transition-colors ${
                step === 3 ? 'text-[#FF5A00]' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px]">3</span>
              <span>Review & Pass</span>
            </button>
          </div>
        )}

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {/* STEP 1: DATE, GUESTS & TIME SLOT */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Party Size Stepper */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2 flex items-center justify-between">
                  <span>How many guests are dining?</span>
                  <span className="text-[#FF5A00] font-extrabold">{partySize} Guests</span>
                </label>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                  {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setPartySize(num)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex-shrink-0 transition-all ${
                        partySize === num
                          ? 'bg-[#006837] text-white shadow-sm ring-2 ring-emerald-200'
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
                          ? 'bg-gradient-to-b from-[#FF5A00] to-[#E65100] text-white shadow-md'
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
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.time}
                      type="button"
                      onClick={() => setSelectedTime(slot.time)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
                        selectedTime === slot.time
                          ? 'bg-[#006837] text-white shadow-sm ring-2 ring-emerald-200'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Occasion Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">Dining Occasion</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['Casual Dining', 'Birthday Party 🎂', 'Anniversary 💐', 'Family Feast 👨‍👩‍👦'].map((occ) => (
                    <button
                      key={occ}
                      type="button"
                      onClick={() => setOccasion(occ)}
                      className={`py-2 px-2.5 rounded-xl text-[11px] font-bold text-center transition-all ${
                        occasion === occ
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {occ}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: INTERACTIVE FLOOR PLAN & TABLE SEAT SELECTOR */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Zone Filter Tabs */}
              <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setSelectedZone('ac_hall')}
                  className={`flex-1 py-2 rounded-xl transition-all ${
                    selectedZone === 'ac_hall' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  AC Dining Hall
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedZone('rooftop')}
                  className={`flex-1 py-2 rounded-xl transition-all ${
                    selectedZone === 'rooftop' ? 'bg-white text-[#FF5A00] shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Rooftop Skyview
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedZone('cabin')}
                  className={`flex-1 py-2 rounded-xl transition-all ${
                    selectedZone === 'cabin' ? 'bg-white text-[#006837] shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Royal Cabins
                </button>
              </div>

              {/* BookMyShow Style Hall Stage / Live Kitchen Indicator */}
              <div className="py-2 px-4 rounded-xl bg-slate-900 text-white text-center text-[10px] font-bold tracking-widest uppercase flex items-center justify-center space-x-2 shadow-inner">
                <Utensils className="w-3.5 h-3.5 text-amber-400" />
                <span>RESTAURANT ENTRANCE & LIVE TANDOOR VIEW</span>
              </div>

              {/* Interactive Floor Plan Grid */}
              <div className="bg-slate-50 p-4 sm:p-6 rounded-3xl border border-slate-200 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {currentZoneTables.map((table) => {
                    const isSelected = selectedTable === table.id;
                    const isOccupied = table.status === 'occupied';

                    return (
                      <button
                        key={table.id}
                        type="button"
                        disabled={isOccupied}
                        onClick={() => setSelectedTable(table.id)}
                        className={`p-3.5 rounded-2xl border-2 flex flex-col items-center justify-between transition-all cursor-pointer ${
                          isOccupied
                            ? 'bg-slate-200/60 border-slate-300 text-slate-400 cursor-not-allowed opacity-60'
                            : isSelected
                            ? 'bg-orange-50 border-[#FF5A00] text-slate-900 shadow-md ring-2 ring-orange-200'
                            : 'bg-white border-slate-200 hover:border-emerald-400 text-slate-800 hover:bg-emerald-50/30'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="font-mono font-extrabold text-xs">{table.id}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {table.seats} Seats
                          </span>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center my-1 text-slate-600">
                          <Users className="w-5 h-5 text-slate-500" />
                        </div>
                        <span className="text-[11px] font-bold truncate">{table.name}</span>
                        <span className="text-[9px] text-slate-400">
                          {isOccupied ? 'Already Booked' : isSelected ? 'Selected Table' : 'Available'}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Legend Bar */}
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
                <span className="font-bold text-[#FF5A00]">₹0 Booking Fee</span>
              </div>
            </div>
          )}

          {/* STEP 3: PRE-ORDER DISHES & GUEST DETAILS */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Guest Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Primary Guest Name</label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g. Sravan Kumar"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs outline-none focus:border-emerald-600"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Mobile Number for SMS Pass</label>
                  <input
                    type="tel"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="e.g. 9848022338"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs outline-none focus:border-emerald-600"
                    required
                  />
                </div>
              </div>

              {/* Special Dining Request */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Special Table Requests (Optional)</label>
                <input
                  type="text"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="e.g. Candlelight setup, quiet booth, cake on arrival..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs outline-none focus:border-emerald-600"
                />
              </div>

              {/* Optional Pre-Order Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Pre-Order Dishes (Ready upon table seating)</span>
                  </label>
                  <span className="text-[11px] text-slate-400">Optional</span>
                </div>
                <div className="space-y-2">
                  {sampleDishes.map((dish) => {
                    const isSelected = preOrderedDishes.some((d) => d.name === dish.name);
                    return (
                      <div
                        key={dish.name}
                        onClick={() => togglePreorderItem(dish)}
                        className={`p-3 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50/70 border-emerald-400 text-emerald-950'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold">{dish.name}</p>
                          <p className="text-[10px] text-slate-500">{dish.desc}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-black text-slate-900">₹{dish.price}</span>
                          <button
                            type="button"
                            className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center ${
                              isSelected ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-300'
                            }`}
                          >
                            {isSelected ? '✓' : '+'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: DIGITAL DINE-IN E-TICKET PASS (BOOKMYSHOW STYLE) */}
          {step === 4 && confirmedReservation && (
            <div className="space-y-4 text-center">
              {/* Ticket Card Container */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-left border border-slate-700">
                {/* Gold Top Notch */}
                <div className="flex items-center justify-between border-b border-slate-700/80 pb-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="p-1.5 bg-[#FF5A00] text-white rounded-xl">
                      <PartyPopper className="w-5 h-5" />
                    </span>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                        CONFIRMED DINE-IN PASS
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                        {confirmedReservation.merchantName}
                      </h3>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold bg-white/10 px-2.5 py-1 rounded-lg text-emerald-300 border border-emerald-400/30">
                    {confirmedReservation.bookingCode}
                  </span>
                </div>

                {/* Ticket Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-5">
                  <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                    <span className="text-[10px] text-slate-400 block">Date</span>
                    <span className="font-bold text-white text-xs sm:text-sm">{confirmedReservation.reservationDate}</span>
                  </div>
                  <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                    <span className="text-[10px] text-slate-400 block">Time Slot</span>
                    <span className="font-bold text-amber-300 text-xs sm:text-sm">{confirmedReservation.reservationTime}</span>
                  </div>
                  <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                    <span className="text-[10px] text-slate-400 block">Table</span>
                    <span className="font-bold text-orange-400 text-xs sm:text-sm">{confirmedReservation.tableNumber}</span>
                  </div>
                  <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                    <span className="text-[10px] text-slate-400 block">Guests</span>
                    <span className="font-bold text-emerald-400 text-xs sm:text-sm">{confirmedReservation.partySize} People</span>
                  </div>
                </div>

                {/* QR Code & Verification Block */}
                <div className="bg-white rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-900">
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
                      Priority table held for 15 mins
                    </p>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 shrink-0">
                    <img
                      src={confirmedReservation.qrCode}
                      alt="Reservation QR Code"
                      className="w-24 h-24 object-contain"
                    />
                  </div>
                </div>

                {/* Pre-ordered food notice if any */}
                {confirmedReservation.preOrderedItems?.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-700 text-xs text-slate-300">
                    <span className="text-[11px] font-bold text-amber-300 block mb-1">Pre-Ordered Course:</span>
                    <p className="text-[11px] text-slate-400">
                      {confirmedReservation.preOrderedItems.map((p) => p.name).join(', ')}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => alert(`Ticket ${confirmedReservation.bookingCode} ready. You can present this QR on arrival.`)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>Save Pass</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-[#006837] hover:bg-emerald-800 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Done</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Actions Footer (Steps 1-3) */}
        {step < 4 && (
          <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
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
                className="px-6 py-2.5 rounded-xl bg-[#FF5A00] hover:bg-orange-600 text-white text-xs font-bold flex items-center space-x-1 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#006837] to-[#0A7A3E] hover:from-emerald-700 hover:to-emerald-800 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Reservation</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

