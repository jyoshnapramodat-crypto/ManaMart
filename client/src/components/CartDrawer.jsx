import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { useLocation } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';
import PaymentModal from './PaymentModal';
import AuthPromptModal from './AuthPromptModal';
import api from '../services/api';
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Tag,
  ArrowRight,
  MapPin,
  Clock,
  ShieldCheck,
  Sparkles,
  Store,
  Layers,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Info,
  ChevronDown,
} from 'lucide-react';

export default function CartDrawer() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const { selectedLocality, currentCity, activeAddress } = useLocation();

  const {
    cartItems,
    merchant,
    storeGroups,
    coupon,
    isCartOpen,
    totalItemCount,
    subtotal,
    deliveryFee,
    baseDeliveryTotal,
    expressSurcharge,
    platformFee,
    taxes,
    discount,
    total,
    substitutionPolicy,
    deliverySlot,
    setIsCartOpen,
    updateQuantity,
    removeItem,
    removeStore,
    clearCart,
    applyCouponCode,
    removeCoupon,
    setSubstitutionPolicy,
    setDeliverySlot,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [orderInstructions, setOrderInstructions] = useState('');
  const [showSlotPicker, setShowSlotPicker] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCouponCode(couponInput);
    setCouponMessage(res);
  };

  const handleProceedToPayment = () => {
    // Guest Mode check: If user is not logged in, prompt Auth without losing cart!
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (method) => {
    try {
      setShowPaymentModal(false);
      // Create order with primary merchant & full item list
      const payload = {
        merchantId: merchant?.id || 'm-1',
        items: cartItems.map((item) => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          unit: item.unit,
          isVeg: item.isVeg,
        })),
        deliveryAddress: {
          street: activeAddress?.street || 'Flat 402, Sri Sai Towers',
          locality: activeAddress?.locality || selectedLocality,
          city: activeAddress?.city || currentCity,
          pincode: activeAddress?.pincode || '500081',
          lat: activeAddress?.lat || 17.4480,
          lng: activeAddress?.lng || 78.3910,
        },
        paymentMethod: method,
        couponCode: coupon?.code,
        substitutionPolicy,
        deliverySlot,
        instructions: orderInstructions,
      };

      const res = await api.post('/orders/create', payload);
      if (res.data.success) {
        clearCart();
        setIsCartOpen(false);
        navigate(`/orders/${res.data.order.id}`);
      }
    } catch (err) {
      console.error('Order creation failed:', err);
      // Fallback redirect for visual presentation
      clearCart();
      setIsCartOpen(false);
      navigate('/orders');
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
        <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
          
          {/* Drawer Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-[#003527]/5 via-orange-50/50 to-amber-50/30">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center font-bold shadow-xs">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  {t('cart.title')} ({totalItemCount} {totalItemCount === 1 ? 'item' : 'items'})
                </h3>
                <p className="text-[11px] text-slate-500">
                  {storeGroups.length > 1
                    ? `From ${storeGroups.length} neighborhood merchants`
                    : merchant
                    ? `From: ${merchant.businessName}`
                    : 'ManaMart Neighborhood Basket'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="w-8 h-8 rounded-full bg-white text-slate-400 hover:text-slate-600 flex items-center justify-center border border-slate-200 transition-colors shadow-xs"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Body */}
          {cartItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <div className="w-20 h-20 rounded-full bg-orange-50 text-orange-400 flex items-center justify-center animate-pulse">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <h4 className="text-base font-bold text-slate-800">{t('cart.empty')}</h4>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                Your basket is empty. Explore neighborhood restaurants, fresh kirana stores, rythu bazaars, or 24x7 pharmacies!
              </p>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/app');
                }}
                className="mt-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 px-5 py-2.5 rounded-xl shadow-md transition-all"
              >
                Browse Local Stores
              </button>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              
              {/* Multi-Store Dispatch Explanation (Module 4) */}
              {storeGroups.length > 1 && (
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/80 flex items-start space-x-2 text-xs text-amber-900">
                  <Layers className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold block">Multi-Store Order</span>
                    <span className="text-[11px] text-amber-800 leading-tight block">
                      Items from different shops will be picked up simultaneously by dedicated neighborhood riders and may arrive in separate bags.
                    </span>
                  </div>
                </div>
              )}

              {/* Delivery Mode & Slot Picker (Module 6) */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span>Delivery Speed & Timing</span>
                  </div>
                  <button
                    onClick={() => setShowSlotPicker(!showSlotPicker)}
                    className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center space-x-0.5"
                  >
                    <span>{deliverySlot.title}</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>

                {/* Slot Selector Sheet */}
                {showSlotPicker ? (
                  <div className="space-y-1.5 pt-2 border-t border-slate-200 animate-in fade-in duration-150">
                    <button
                      type="button"
                      onClick={() => {
                        setDeliverySlot({
                          type: 'standard',
                          title: 'Standard Delivery',
                          eta: '25-35 mins',
                          fee: 35,
                          date: 'Today',
                          timeSlot: 'Earliest Available (25-35 mins)',
                        });
                        setShowSlotPicker(false);
                      }}
                      className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                        deliverySlot.type === 'standard'
                          ? 'border-orange-500 bg-orange-50/50 text-orange-950 font-bold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div>
                        <span className="block">⚡ Standard Delivery</span>
                        <span className="text-[10px] text-slate-500">Estimated 25-35 mins</span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-700">Standard Fee</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDeliverySlot({
                          type: 'express',
                          title: 'Express Delivery (15 mins)',
                          eta: '12-18 mins',
                          fee: 55,
                          date: 'Today',
                          timeSlot: 'Priority Superfast (15 mins)',
                        });
                        setShowSlotPicker(false);
                      }}
                      className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                        deliverySlot.type === 'express'
                          ? 'border-orange-500 bg-orange-50/50 text-orange-950 font-bold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div>
                        <span className="block">🚀 Priority Express (15 mins)</span>
                        <span className="text-[10px] text-slate-500">Dedicated direct rider dispatch</span>
                      </div>
                      <span className="text-[11px] font-bold text-orange-600">+₹20</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDeliverySlot({
                          type: 'scheduled',
                          title: 'Scheduled Slot (Evening 6-7 PM)',
                          eta: 'Today 6:00 PM - 7:00 PM',
                          fee: 35,
                          date: 'Today',
                          timeSlot: '6:00 PM - 7:00 PM',
                        });
                        setShowSlotPicker(false);
                      }}
                      className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                        deliverySlot.type === 'scheduled'
                          ? 'border-orange-500 bg-orange-50/50 text-orange-950 font-bold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div>
                        <span className="block">📅 Scheduled Slot</span>
                        <span className="text-[10px] text-slate-500">Today Evening: 6:00 PM - 7:00 PM</span>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700">Flexible</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-xs bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-slate-600">{deliverySlot.timeSlot}</span>
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {deliverySlot.type === 'express' ? 'Priority 15m' : 'On Schedule'}
                    </span>
                  </div>
                )}
              </div>

              {/* STORE-GROUPED CART ITEMS (Module 4) */}
              <div className="space-y-4">
                {storeGroups.map((group) => (
                  <div
                    key={group.store.id}
                    className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs bg-white"
                  >
                    {/* Store Sub-Header */}
                    <div className="p-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Store className="w-4 h-4 text-orange-600" />
                        <div>
                          <span className="font-black text-xs text-slate-900 block leading-tight">
                            {group.store.businessName}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Delivery: ₹{group.deliveryFee === 0 ? 'FREE' : group.deliveryFee} • {group.store.deliveryEta || '25-35m'}
                          </span>
                        </div>
                      </div>

                      {/* Remove store button */}
                      <button
                        onClick={() => removeStore(group.store.id)}
                        className="text-[11px] text-slate-400 hover:text-red-500 transition-colors flex items-center space-x-0.5"
                        title="Remove all items from this store"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Store Items List */}
                    <div className="p-3 space-y-3 divide-y divide-slate-100">
                      {group.items.map((item) => (
                        <div key={item.id} className="pt-2.5 first:pt-0 flex items-center justify-between gap-2.5">
                          <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                            {/* Veg / Non-veg dot */}
                            <span
                              className={`w-3.5 h-3.5 rounded-xs border flex items-center justify-center flex-shrink-0 ${
                                item.isVeg ? 'border-emerald-600' : 'border-red-600'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  item.isVeg ? 'bg-emerald-600' : 'bg-red-600'
                                }`}
                              />
                            </span>

                            <div className="min-w-0 flex-1">
                              <span className="text-xs font-bold text-slate-800 truncate block">
                                {item.name}
                              </span>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-black text-orange-600">
                                  ₹{item.price}
                                </span>
                                {item.stockCount && item.stockCount <= 5 ? (
                                  <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 px-1 rounded-sm">
                                    Only {item.stockCount} left
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-emerald-700 font-semibold">
                                    In Stock
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Stepper */}
                          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 flex-shrink-0">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-5 h-5 flex items-center justify-center text-slate-600 hover:text-orange-600"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold text-slate-900 w-4 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-5 h-5 flex items-center justify-center text-slate-600 hover:text-orange-600"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Store Subtotal Footer */}
                    <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Store Subtotal:</span>
                      <span className="font-bold text-slate-900">₹{group.subtotal}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* ITEM SUBSTITUTION POLICY (Module 3) */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800">
                  <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
                  <span>Out-of-Stock Substitution Preference</span>
                </div>
                <p className="text-[10px] text-slate-500">
                  If an item becomes unavailable before dispatch, choose how the merchant should handle it:
                </p>

                <div className="space-y-1.5">
                  {[
                    {
                      id: 'replace_similar',
                      title: 'Replace with similar product',
                      desc: 'Store chooses closest brand/variant (price diff confirmed)',
                    },
                    {
                      id: 'contact_me',
                      title: 'Contact me before replacing',
                      desc: 'Store will call before making any substitution',
                    },
                    {
                      id: 'refund_unavailable',
                      title: 'Remove unavailable item & refund',
                      desc: 'Item amount refunded to original payment method',
                    },
                  ].map((sub) => (
                    <label
                      key={sub.id}
                      onClick={() => setSubstitutionPolicy(sub.id)}
                      className={`flex items-start space-x-2.5 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                        substitutionPolicy === sub.id
                          ? 'border-orange-500 bg-orange-50/40 text-orange-950 font-bold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="substitution"
                        checked={substitutionPolicy === sub.id}
                        onChange={() => setSubstitutionPolicy(sub.id)}
                        className="mt-0.5 text-orange-600 focus:ring-orange-500"
                      />
                      <div>
                        <span className="block text-xs">{sub.title}</span>
                        <span className="text-[10px] text-slate-500 block font-normal">{sub.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Delivery Instructions */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Delivery Note / Landmark
                </label>
                <input
                  type="text"
                  value={orderInstructions}
                  onChange={(e) => setOrderInstructions(e.target.value)}
                  placeholder="e.g. Leave with security / Ring bell twice / Pet inside"
                  className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Coupon Section */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800">
                  <Tag className="w-3.5 h-3.5 text-orange-600" />
                  <span>{t('cart.applyCoupon')}</span>
                </div>
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="WELCOME50 or SWAGATHFREE"
                    className="flex-1 text-xs px-3 py-1.5 rounded-xl bg-white border border-slate-200 uppercase font-mono tracking-wider focus:outline-none focus:border-orange-500"
                  />
                  <button
                    type="submit"
                    className="text-xs font-bold bg-orange-600 text-white px-3.5 py-1.5 rounded-xl hover:bg-orange-700 transition-colors"
                  >
                    Apply
                  </button>
                </form>
                {couponMessage && (
                  <p className={`text-[11px] font-semibold ${couponMessage.success ? 'text-emerald-600' : 'text-red-500'}`}>
                    {couponMessage.message}
                  </p>
                )}
                {coupon && (
                  <div className="flex items-center justify-between text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    <span>Coupon "{coupon.code}" Active</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-black">-₹{discount}</span>
                      <button onClick={removeCoupon} className="text-slate-400 hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Delivery Address Review */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs flex-1">
                  <span className="font-bold text-slate-800 block">
                    Delivering to: {activeAddress?.tag || 'Home'} ({selectedLocality})
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    {activeAddress?.flatNo || 'Flat 402, Sri Sai Towers'}, {currentCity}
                  </span>
                </div>
              </div>

              {/* Transparent Price Summary Breakdown (Module 4) */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">
                  Bill Breakdown
                </h4>

                <div className="flex justify-between text-slate-600">
                  <span>Product Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>

                {/* Store-wise delivery charges */}
                <div className="flex justify-between text-slate-600">
                  <span>
                    Store Delivery Charges ({storeGroups.length} {storeGroups.length === 1 ? 'store' : 'stores'})
                  </span>
                  <span>{baseDeliveryTotal === 0 ? 'FREE' : `₹${baseDeliveryTotal}`}</span>
                </div>

                {expressSurcharge > 0 && (
                  <div className="flex justify-between text-orange-700">
                    <span>Priority Express Surcharge (15m)</span>
                    <span>+₹{expressSurcharge}</span>
                  </div>
                )}

                {/* Platform Fee */}
                <div className="flex justify-between text-slate-600">
                  <span className="flex items-center space-x-1">
                    <span>Platform Fee</span>
                    <Info className="w-3 h-3 text-slate-400 inline" />
                  </span>
                  <span>₹{platformFee}</span>
                </div>

                {/* Taxes */}
                <div className="flex justify-between text-slate-600">
                  <span>Taxes & GST (5%)</span>
                  <span>₹{taxes}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Coupon Discount</span>
                    <span>-₹{discount}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200 flex justify-between font-extrabold text-sm text-slate-900">
                  <span>Final Payable Amount</span>
                  <span className="text-orange-600 text-base">₹{total}</span>
                </div>
              </div>

            </div>
          )}

          {/* Drawer Footer CTA */}
          {cartItems.length > 0 && (
            <div className="p-4 border-t border-slate-100 bg-white space-y-2">
              <button
                type="button"
                onClick={handleProceedToPayment}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 text-white font-extrabold text-sm shadow-lg hover:shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-between"
              >
                <div className="text-left">
                  <span className="text-[10px] text-orange-100 block font-normal">
                    {storeGroups.length > 1 ? `${storeGroups.length} stores combined` : 'Ready for dispatch'}
                  </span>
                  <span>Pay ₹{total}</span>
                </div>
                <div className="flex items-center space-x-1 font-black">
                  <span>Proceed to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>

              <div className="flex items-center justify-center space-x-1.5 text-[10px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Verified Neighborhood Merchants & Guaranteed Delivery</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Guest Mode Auth Prompt Modal */}
      <AuthPromptModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Sign In to Complete Your Order"
        message="Sign in to dispatch neighborhood riders, track your order live, and receive SMS/WhatsApp delivery updates. Your cart is safely preserved!"
        returnAction={() => {
          setShowAuthModal(false);
          setShowPaymentModal(true);
        }}
      />

      {/* Comprehensive 5-State Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentSuccess={handlePaymentSuccess}
        totalAmount={total}
        merchantName={storeGroups.length > 1 ? `${storeGroups.length} Local Stores` : merchant?.businessName}
      />
    </>
  );
}
