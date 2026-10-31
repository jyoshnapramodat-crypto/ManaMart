import React, { useState } from 'react';
import api from '../../services/api';
import {
  Wrench,
  ShieldCheck,
  Star,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function ServicesPage() {
  const [selectedService, setSelectedService] = useState('AC Deep Cleaning & Foam Jet');
  const [serviceDate, setServiceDate] = useState('2026-11-02');
  const [timeSlot, setTimeSlot] = useState('11:00 AM - 01:00 PM');
  const [confirmed, setConfirmed] = useState(null);
  const [loading, setLoading] = useState(false);

  const services = [
    {
      id: 'srv-ac',
      name: 'Split AC Foam Jet Deep Cleaning Service',
      price: 549,
      mrp: 799,
      rating: 4.8,
      duration: '45 mins',
      desc: 'High-pressure foam jet wash of filters, coils, and outdoor condenser unit.',
    },
    {
      id: 'srv-elec',
      name: 'Electrician Home Inspection & Switchboard Fix',
      price: 199,
      mrp: 299,
      rating: 4.9,
      duration: '30 mins',
      desc: 'Certified technician for short circuit diagnosis, fan regulator, and MCB fixing.',
    },
    {
      id: 'srv-plumb',
      name: 'Plumbing Tap Leakage & Water Motor Repair',
      price: 249,
      mrp: 350,
      rating: 4.7,
      duration: '40 mins',
      desc: 'Expert plumber for fixing kitchen sink pipe blockages, taps, and cistern repair.',
    },
  ];

  const handleBook = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/orders/service', {
        merchantId: 'm-6', // Sai Ram Home Services
        serviceName: selectedService,
        serviceDate,
        timeSlot,
        address: 'Flat 402, Sri Sai Towers, Madhapur',
      });
      if (res.data.success) {
        setConfirmed(res.data.booking);
      }
    } catch (err) {
      console.error('Service booking error:', err);
      alert('Failed to book home service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-12 space-y-6">
      <div>
        <div className="inline-flex items-center space-x-1.5 bg-blue-50 text-blue-800 text-xs font-bold px-3 py-1 rounded-full border border-blue-200 mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>Verified Local Technicians</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
          <span>Doorstep Home Services & Repairs</span>
          <Wrench className="w-5 h-5 text-blue-600" />
        </h1>
        <p className="text-xs text-slate-500">
          Book trusted electricians, AC mechanics, and plumbers in your neighborhood with upfront transparent pricing.
        </p>
      </div>

      {confirmed ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-soft text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">Service Appointment Booked!</h2>
          <p className="text-xs text-slate-600 max-w-sm mx-auto">
            Technician from <span className="font-bold text-slate-900">Sai Ram Quick Home Services</span> will arrive on{' '}
            <span className="font-bold">{confirmed.serviceDate}</span> between{' '}
            <span className="font-bold">{confirmed.timeSlot}</span>.
          </p>
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs max-w-sm mx-auto">
            <p className="font-semibold text-slate-700">{confirmed.serviceName}</p>
            <p className="text-emerald-700 font-bold mt-1">₹{confirmed.price} (Pay post service)</p>
          </div>
          <button
            onClick={() => setConfirmed(null)}
            className="text-xs font-bold text-blue-600 hover:underline"
          >
            Book Another Service
          </button>
        </div>
      ) : (
        <form onSubmit={handleBook} className="space-y-4">
          {/* Service Cards */}
          <div className="space-y-3">
            {services.map((s) => {
              const isSelected = selectedService === s.name;
              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedService(s.name)}
                  className={`p-4 rounded-3xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-200'
                      : 'bg-white border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-sm text-slate-900">{s.name}</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded flex items-center space-x-0.5">
                        <Star className="w-2.5 h-2.5 fill-emerald-600" />
                        <span>{s.rating}</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 max-w-md">{s.desc}</p>
                    <span className="text-[11px] text-slate-400 font-medium block">Duration: {s.duration}</span>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-base font-black text-slate-900 block">₹{s.price}</span>
                    <span className="text-xs text-slate-400 line-through">₹{s.mrp}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Schedule Selectors */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-soft space-y-3 text-xs">
            <h3 className="font-bold text-slate-800">Select Date & Preferred Window</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Service Date</label>
                <input
                  type="date"
                  value={serviceDate}
                  onChange={(e) => setServiceDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Time Window</label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none font-medium"
                >
                  <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM (Morning)</option>
                  <option value="11:00 AM - 01:00 PM">11:00 AM - 01:00 PM (Noon)</option>
                  <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM (Afternoon)</option>
                  <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM (Evening)</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-all"
          >
            {loading ? 'Confirming Technician Booking...' : 'Book Technician at Doorstep'}
          </button>
        </form>
      )}

    </div>
  );
}

