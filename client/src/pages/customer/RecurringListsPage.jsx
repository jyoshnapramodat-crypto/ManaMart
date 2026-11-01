import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLocation } from '../../context/LocationContext';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';
import {
  Repeat,
  Plus,
  Play,
  Pause,
  Trash2,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Store,
  Layers,
  MapPin,
  Lock,
  Minus,
} from 'lucide-react';

export default function RecurringListsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { savedAddresses, selectedLocality, currentCity } = useLocation();
  const { addItem, setIsCartOpen } = useCart();

  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [reviewModalList, setReviewModalList] = useState(null); // Active review for merchant confirmation
  const [reviewStep, setReviewStep] = useState(1); // 1: Merchant stock review | 2: Customer authorization

  // New list form state
  const [title, setTitle] = useState('Monthly Family Pantry & Staples');
  const [selectedMerchant, setSelectedMerchant] = useState('Sri Lakshmi Kirana Stores');
  const [frequency, setFrequency] = useState('monthly');
  const [scheduledDay, setScheduledDay] = useState(1);
  const [scheduledTime, setScheduledTime] = useState('9:00 AM - 10:00 AM');
  const [deliveryAddress, setDeliveryAddress] = useState(savedAddresses[0]?.flatNo || 'Flat 402, Sri Sai Towers');

  // Form items
  const [items, setItems] = useState([
    { id: 'p-1', name: 'Kurnool Sona Masoori Raw Rice (25 kg)', price: 1350, quantity: 1, unit: '25kg bag' },
    { id: 'p-2', name: 'Freedom Refined Sunflower Oil (5L)', price: 590, quantity: 2, unit: '5L can' },
    { id: 'p-3', name: 'Unpolished Toor Dal (1 kg)', price: 165, quantity: 2, unit: '1kg pack' },
  ]);

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    setLoading(true);
    try {
      const res = await api.get('/recurring-lists');
      if (res.data.success && res.data.lists?.length > 0) {
        setLists(res.data.lists);
      } else {
        // Sample default recurring list for initial test presentation
        setLists([
          {
            id: 'rec-1',
            title: 'Monthly Family Pantry & Staples',
            merchantName: 'Sri Lakshmi Kirana Stores',
            frequency: 'monthly',
            scheduledDay: 1,
            scheduledTime: '9:00 AM - 10:00 AM',
            status: 'active',
            deliveryAddress: 'Flat 402, Sri Sai Towers, Madhapur',
            items: [
              { id: 'p-1', name: 'Kurnool Sona Masoori Raw Rice (25 kg)', price: 1350, quantity: 1 },
              { id: 'p-2', name: 'Freedom Refined Sunflower Oil (5L)', price: 590, quantity: 2 },
              { id: 'p-3', name: 'Unpolished Toor Dal (1 kg)', price: 165, quantity: 2 },
            ],
            subtotal: 2860,
          },
        ]);
      }
    } catch (err) {
      console.error('Error fetching recurring lists:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePauseToggle = (listId) => {
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId
          ? { ...l, status: l.status === 'active' ? 'paused' : 'active' }
          : l
      )
    );
  };

  const handleDelete = (listId) => {
    if (!window.confirm('Delete this automated recurring shopping list?')) return;
    setLists((prev) => prev.filter((l) => l.id !== listId));
  };

  const handleCreateNewList = (e) => {
    e.preventDefault();
    const subtotal = items.reduce((acc, it) => acc + it.price * it.quantity, 0);

    const newList = {
      id: `rec-${Date.now()}`,
      title,
      merchantName: selectedMerchant,
      frequency,
      scheduledDay: Number(scheduledDay),
      scheduledTime,
      deliveryAddress,
      status: 'active',
      items: [...items],
      subtotal,
    };

    setLists((prev) => [newList, ...prev]);
    setIsCreating(false);
  };

  const handleItemQtyChange = (idx, delta) => {
    setItems((prev) =>
      prev
        .map((it, i) => {
          if (i === idx) {
            const newQty = it.quantity + delta;
            return newQty > 0 ? { ...it, quantity: newQty } : null;
          }
          return it;
        })
        .filter(Boolean)
    );
  };

  // Launch Merchant Availability & Explicit Authorization Review
  const handleStartReview = (list) => {
    setReviewModalList(list);
    setReviewStep(1);
  };

  const handleConfirmCustomerAuthorization = () => {
    alert(`Order for "${reviewModalList.title}" authorized! Neighborhood dispatch scheduled.`);
    setReviewModalList(null);
    navigate('/orders');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <span>{t('recurring.title')}</span>
            <Repeat className="w-5 h-5 text-emerald-600" />
          </h1>
          <p className="text-xs text-slate-500 max-w-xl">
            Automate monthly rice bags, cooking oil, dairy, and pantry essentials from local kirana merchants with strict customer authorization before charge.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center space-x-1.5 bg-gradient-to-r from-emerald-600 to-[#003527] hover:from-emerald-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-2xl shadow-md transition-all flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Recurring List</span>
        </button>
      </div>

      {/* Safety Guarantee Banner (Module 11) */}
      <div className="p-4 rounded-3xl bg-emerald-50 border border-emerald-200/80 flex items-start space-x-3 text-xs text-emerald-950">
        <ShieldCheck className="w-5 h-5 text-emerald-700 mt-0.5 flex-shrink-0" />
        <div>
          <span className="font-extrabold block">ManaMart Zero-Surprise Billing Protection</span>
          <p className="text-[11px] text-emerald-800 leading-relaxed mt-0.5">
            We <strong>never automatically charge your account or wallet</strong> without explicit authorization. Prior to scheduled dispatch, the merchant verifies stock, suggests substitutes for any unavailable items, and asks you to confirm the final order and payment.
          </p>
        </div>
      </div>

      {/* CREATE NEW LIST FORM MODAL */}
      {isCreating && (
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-lg space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-extrabold text-sm text-slate-900">Configure Recurring Essentials List</h3>
            <button
              onClick={() => setIsCreating(false)}
              className="text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleCreateNewList} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                  List Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                  Preferred Local Merchant
                </label>
                <select
                  value={selectedMerchant}
                  onChange={(e) => setSelectedMerchant(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-emerald-600"
                >
                  <option value="Sri Lakshmi Kirana Stores">Sri Lakshmi Kirana Stores (Madhapur)</option>
                  <option value="Rythu Bazaar Fresh Produce">Rythu Bazaar Fresh Produce</option>
                  <option value="Vijaya Dairy & Organic Hub">Vijaya Dairy & Organic Hub</option>
                </select>
              </div>
            </div>

            {/* Recurrence Schedule & Time Slot */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                  Frequency
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                >
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                  Delivery Day (Day of Month)
                </label>
                <input
                  type="number"
                  min="1"
                  max="28"
                  value={scheduledDay}
                  onChange={(e) => setScheduledDay(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                  Preferred Time Slot
                </label>
                <select
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                >
                  <option value="8:00 AM - 9:00 AM">8:00 AM - 9:00 AM</option>
                  <option value="9:00 AM - 10:00 AM">9:00 AM - 10:00 AM</option>
                  <option value="6:00 PM - 7:00 PM">6:00 PM - 7:00 PM</option>
                </select>
              </div>
            </div>

            {/* Delivery Address */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                Destination Address
              </label>
              <input
                type="text"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
              />
            </div>

            {/* Items Editor */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Products in this Recurring List
              </span>

              <div className="space-y-2 divide-y divide-slate-100 border border-slate-200 rounded-2xl p-3 bg-slate-50/50">
                {items.map((it, idx) => (
                  <div key={it.id} className="pt-2 first:pt-0 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">{it.name}</span>
                      <span className="text-[11px] font-black text-orange-600">₹{it.price}</span>
                    </div>

                    <div className="flex items-center space-x-2 bg-white border border-slate-200 rounded-xl px-2 py-1">
                      <button
                        type="button"
                        onClick={() => handleItemQtyChange(idx, -1)}
                        className="w-5 h-5 flex items-center justify-center text-slate-600 hover:text-red-500"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-slate-900 w-4 text-center">{it.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleItemQtyChange(idx, 1)}
                        className="w-5 h-5 flex items-center justify-center text-slate-600 hover:text-emerald-600"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-[#003527] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
              >
                Save Recurring Schedule
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ACTIVE LISTS */}
      <div className="space-y-4">
        {lists.map((list) => {
          const isPaused = list.status === 'paused';

          return (
            <div
              key={list.id}
              className={`p-5 rounded-3xl border transition-all space-y-4 ${
                isPaused
                  ? 'bg-slate-50 border-slate-200 opacity-80'
                  : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                    isPaused ? 'bg-slate-200 text-slate-500' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    <Repeat className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-extrabold text-sm text-slate-900">{list.title}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        isPaused ? 'bg-slate-200 text-slate-600' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {list.status}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Merchant: {list.merchantName} • Every {list.frequency} on day {list.scheduledDay} ({list.scheduledTime})
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base font-black text-slate-900 block">
                    ₹{list.subtotal || list.items.reduce((acc, it) => acc + it.price * it.quantity, 0)}
                  </span>
                  <span className="text-[10px] text-slate-400">Estimated Total</span>
                </div>
              </div>

              {/* Items summary */}
              <div className="space-y-1.5 divide-y divide-slate-100 text-xs">
                {list.items.map((it, i) => (
                  <div key={i} className="pt-1.5 first:pt-0 flex justify-between">
                    <span className="text-slate-700">{it.name} (x{it.quantity})</span>
                    <span className="font-bold text-slate-900">₹{it.price * it.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePauseToggle(list.id)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all flex items-center space-x-1 ${
                      isPaused
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                        : 'border-slate-300 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                    <span>{isPaused ? 'Resume Schedule' : 'Pause'}</span>
                  </button>

                  <button
                    onClick={() => handleDelete(list.id)}
                    className="text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-xl transition-colors"
                    title="Delete recurring list"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Review & Authorize Next Month's Dispatch */}
                <button
                  onClick={() => handleStartReview(list)}
                  className="text-xs font-bold text-white bg-gradient-to-r from-emerald-700 to-[#003527] hover:from-emerald-800 px-4 py-2 rounded-xl shadow-xs transition-all flex items-center space-x-1.5"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  <span>Review Availability & Authorize</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MERCHANT AVAILABILITY CONFIRMATION MODAL (Module 11) */}
      {reviewModalList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  {reviewStep === 1 ? 'Merchant Stock Availability Confirmation' : 'Explicit Customer Authorization'}
                </h3>
                <span className="text-[11px] text-slate-500">
                  {reviewModalList.merchantName} • {reviewModalList.title}
                </span>
              </div>
            </div>

            {/* STEP 1: MERCHANT REPORT */}
            {reviewStep === 1 && (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 space-y-1">
                  <span className="font-bold block">✓ Merchant Checked 3 of 3 Items</span>
                  <p className="text-[11px] text-emerald-800">
                    Sri Lakshmi Kirana has confirmed stock readiness for your upcoming scheduled cycle. No replacements needed.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-700 block">Confirmed Itemized Breakdown:</span>
                  {reviewModalList.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-slate-800">
                      <span>{it.name} (x{it.quantity})</span>
                      <span className="font-black">₹{it.price * it.quantity}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t flex justify-between font-extrabold text-sm text-slate-900">
                    <span>Total Authorized Amount</span>
                    <span className="text-orange-600">₹{reviewModalList.subtotal}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReviewModalList(null)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewStep(2)}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-700 text-white text-xs font-bold shadow-md hover:bg-emerald-800"
                  >
                    Review & Authorize Payment →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: CUSTOMER AUTHORIZATION */}
            {reviewStep === 2 && (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-950 space-y-1">
                  <span className="font-bold block flex items-center space-x-1">
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Customer Explicit Authorization Required</span>
                  </span>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    By clicking below, you authorize ManaMart to dispatch this recurring order to {reviewModalList.deliveryAddress} and charge ₹{reviewModalList.subtotal} via your default payment method.
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReviewStep(1)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmCustomerAuthorization}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-700 to-[#003527] text-white text-xs font-bold shadow-md hover:shadow-lg"
                  >
                    Authorize Order & Dispatch
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
