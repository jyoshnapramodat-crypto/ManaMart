import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useLocation } from '../../context/LocationContext';
import { useAuth } from '../../context/AuthContext';
import {
  Package,
  MapPin,
  Bike,
  ShieldCheck,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  Phone,
} from 'lucide-react';

export default function ParcelDeliveryPage() {
  const navigate = useNavigate();
  const { selectedLocality, currentCity } = useLocation();
  const { user, isLoggedIn } = useAuth();

  // Initialize with logged in user's real credentials, or empty if visitor
  const [senderName, setSenderName] = useState(user?.name || '');
  const [senderPhone, setSenderPhone] = useState(user?.phone || '');
  const [pickupAddress, setPickupAddress] = useState(
    user?.addresses?.[0]?.street
      ? `${user.addresses[0].street}, ${selectedLocality}`
      : ''
  );

  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [dropAddress, setDropAddress] = useState('');

  const [packageType, setPackageType] = useState('Documents & Keys');
  const [weightKg, setWeightKg] = useState('1');
  const [instructions, setInstructions] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const estimatedFee = Number(weightKg) > 3 ? 75 : 45;

  const handleBookParcel = async (e) => {
    e.preventDefault();
    setError(null);

    if (!isLoggedIn) {
      navigate('/login', { state: { from: { pathname: '/parcel' } } });
      return;
    }

    if (!senderName.trim() || !senderPhone.trim() || !pickupAddress.trim()) {
      setError('Please provide complete sender pickup details.');
      return;
    }

    if (!recipientName.trim() || !recipientPhone.trim() || !dropAddress.trim()) {
      setError('Please provide complete recipient delivery details.');
      return;
    }

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
      setError(err.response?.data?.message || 'Failed to register parcel delivery request.');
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

      {/* Error Alert */}
      {error && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

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
                placeholder="Your Full Name"
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
                placeholder="10-digit mobile number"
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
              placeholder="e.g. Flat 201, Green Meadows, Kavuri Hills"
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
                placeholder="Receiver's Full Name"
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
                placeholder="Receiver's mobile number"
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
              placeholder="e.g. Plot 15, Hitech City Road, Cyber Gateway"
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

