import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useLocation } from '../../context/LocationContext';
import {
  Package,
  MapPin,
  Bike,
  ShieldCheck,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function ParcelDeliveryPage() {
  const navigate = useNavigate();
  const { selectedLocality, currentCity } = useLocation();

  const [senderName, setSenderName] = useState('Ravi Kumar');
  const [senderPhone, setSenderPhone] = useState('9876543210');
  const [pickupAddress, setPickupAddress] = useState(`Flat 402, Sri Sai Towers, ${selectedLocality}`);
  
  const [recipientName, setRecipientName] = useState('Praveen Varma');
  const [recipientPhone, setRecipientPhone] = useState('9848011223');
  const [dropAddress, setDropAddress] = useState(`Cyber Gateway, Hitech City, ${currentCity}`);
  
  const [packageType, setPackageType] = useState('Documents & Keys');
  const [weightKg, setWeightKg] = useState('1');
  const [instructions, setInstructions] = useState('');

  const [loading, setLoading] = useState(false);

  const estimatedFee = Number(weightKg) > 3 ? 75 : 45;

  const handleBookParcel = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        senderName,
        senderPhone,
        pickupAddress,
        recipientName,
        recipientPhone,
        dropAddress,
        packageType,
        weightKg: Number(weightKg),
        instructions,
      };

      const res = await api.post('/orders/parcel', payload);
      if (res.data.success) {
        navigate(`/orders/${res.data.parcel.id}`);
      }
    } catch (err) {
      console.error('Parcel booking error:', err);
      alert('Failed to register parcel delivery request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-12 space-y-6">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-1.5 bg-amber-50 text-amber-800 text-xs font-bold px-3 py-1 rounded-full border border-amber-200 mb-2">
          <Bike className="w-3.5 h-3.5 text-amber-600" />
          <span>LocalLoop Express 30-Minute Courier</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
          <span>Hyperlocal Parcel Delivery</span>
          <Package className="w-5 h-5 text-amber-500" />
        </h1>
        <p className="text-xs text-slate-500">
          Send packages, forgotten keys, hot tiffin boxes, documents, or gifts anywhere in {currentCity}.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleBookParcel} className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-100 shadow-soft space-y-5">
        
        {/* Pickup Address */}
        <div className="space-y-3 p-4 bg-orange-50/50 rounded-2xl border border-orange-100">
          <div className="flex items-center space-x-2 text-xs font-bold text-orange-950">
            <div className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px]">1</div>
            <span>Pickup Point (Sender)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Sender Name</label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-orange-500"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Sender Phone</label>
              <input
                type="tel"
                value={senderPhone}
                onChange={(e) => setSenderPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-orange-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1 text-xs">Pickup Street Address</label>
            <input
              type="text"
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-orange-500"
              required
            />
          </div>
        </div>

        {/* Drop-off Address */}
        <div className="space-y-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-950">
            <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">2</div>
            <span>Drop-off Point (Recipient)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Recipient Name</label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Recipient Phone</label>
              <input
                type="tel"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1 text-xs">Drop-off Street Address</label>
            <input
              type="text"
              value={dropAddress}
              onChange={(e) => setDropAddress(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-blue-500"
              required
            />
          </div>
        </div>

        {/* Package Specifications */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Package Category</label>
            <select
              value={packageType}
              onChange={(e) => setPackageType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none font-medium"
            >
              <option value="Documents & Keys">Documents & Keys</option>
              <option value="Home Cooked Food / Tiffin">Home Cooked Food / Tiffin</option>
              <option value="Clothes & Laundry">Clothes & Laundry</option>
              <option value="Medicines & Health">Medicines & Health</option>
              <option value="Electronics & Charger">Electronics & Charger</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Approximate Weight</label>
            <select
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none font-medium"
            >
              <option value="1">Up to 1 kg (₹45)</option>
              <option value="3">1 to 3 kg (₹45)</option>
              <option value="5">3 to 7 kg (₹75)</option>
            </select>
          </div>
        </div>

        {/* Pricing Summary & Submit */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Estimated Delivery Fare</span>
            <span className="text-xl font-black text-slate-900">₹{estimatedFee}</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 text-white font-extrabold text-xs shadow-md flex items-center space-x-2 transition-all"
          >
            {loading ? (
              <span>Dispatching Rider...</span>
            ) : (
              <>
                <span>Book Rider Now</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

    </div>
  );
}

