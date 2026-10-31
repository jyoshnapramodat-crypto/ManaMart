import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { useLocation } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';
import PaymentModal from './PaymentModal';
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
} from 'lucide-react';

export default function CartDrawer() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedLocality, currentCity } = useLocation();

  const {
    cartItems,
    merchant,
    coupon,
    isCartOpen,
    totalItemCount,
    subtotal,
    deliveryFee,
    taxes,
    discount,
    total,
    setIsCartOpen,
    updateQuantity,
    removeItem,
    clearCart,
    applyCouponCode,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [orderInstructions, setOrderInstructions] = useState('');

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCouponCode(couponInput);
    setCouponMessage(res);
  };

  const handlePaymentSuccess = async (method) => {
    try {
      setShowPaymentModal(false);
      const payload = {
        merchantId: merchant?.id,
        items: cartItems.map((item) => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        deliveryAddress: {
          street: 'Flat 402, Sri Sai Towers',
          locality: selectedLocality,
          city: currentCity,
          lat: 17.4480,
          lng: 78.3910,
        },
        paymentMethod: method,
        couponCode: coupon?.code,
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
      alert('Failed to place order. Please try again.');
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
        <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
          
          {/* Drawer Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">{t('cart.title')}</h3>
                <p className="text-[11px] text-slate-500">
                  {merchant ? `From: ${merchant.businessName}` : 'Neighborhood essentials'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="w-8 h-8 rounded-full bg-white text-slate-400 hover:text-slate-600 flex items-center justify-center border border-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Body */}
          {cartItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <div className="w-20 h-20 rounded-full bg-orange-50 text-orange-400 flex items-center justify-center">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <h4 className="text-base font-bold text-slate-800">{t('cart.empty')}</h4>
              <p className="text-xs text-slate-500 max-w-xs">
                Explore popular neighborhood restaurants, fresh kirana stores, bakeries, or 24x7 pharmacies!
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-2 text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-xl transition-all"
              >
                Start Exploring
              </button>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              
              {/* Delivery ETA pill */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 text-xs">
                <div className="flex items-center space-x-2 text-orange-900 font-semibold">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span>Delivery in 20-30 mins</span>
                </div>
                <span className="text-[11px] font-bold text-orange-700 bg-white px-2 py-0.5 rounded-full border border-orange-200">
                  Hyperlocal Fast
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-3 divide-y divide-slate-100">
                {cartItems.map((item) => (
                  <div key={item.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-400">
                            {item.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 line-clamp-1">{item.name}</span>
                        <span className="text-xs font-extrabold text-orange-600 block">₹{item.price}</span>
                      </div>
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-5 h-5 flex items-center justify-center text-slate-600 hover:text-orange-600"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-slate-900 w-4 text-center">{item.quantity}</span>
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

              {/* Delivery Instructions */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Delivery Note / Landmark
                </label>
                <input
                  type="text"
                  value={orderInstructions}
                  onChange={(e) => setOrderInstructions(e.target.value)}
                  placeholder="e.g. Leave with security / Ring bell twice"
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
                    placeholder="Enter WELCOME50 or SWAGATHFREE"
                    className="flex-1 text-xs px-3 py-1.5 rounded-xl bg-white border border-slate-200 uppercase font-mono tracking-wider focus:outline-none focus:border-orange-500"
                  />
                  <button
                    type="submit"
                    className="text-xs font-bold bg-orange-600 text-white px-3 py-1.5 rounded-xl hover:bg-orange-700 transition-colors"
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
                  <div className="flex items-center justify-between text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
                    <span>Coupon "{coupon.code}" Active</span>
                    <span className="font-bold">-₹{discount}</span>
                  </div>
                )}
              </div>

              {/* Delivery Address Review */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-slate-800 block">Delivering to: {selectedLocality}</span>
                  <span className="text-slate-500 text-[11px]">Flat 402, Sri Sai Towers, {currentCity}</span>
                </div>
              </div>

              {/* Bill Details */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                <span className="font-bold text-slate-900 block mb-1">{t('cart.billDetails')}</span>
                <div className="flex justify-between text-slate-600">
                  <span>{t('cart.itemTotal')}</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>{t('cart.deliveryFee')}</span>
                  <span>{deliveryFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `₹${deliveryFee}`}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>{t('cart.taxes')}</span>
                  <span>₹{taxes}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>{t('cart.discount')}</span>
                    <span>-₹{discount}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 flex justify-between font-extrabold text-slate-900 text-sm">
                  <span>{t('cart.toPay')}</span>
                  <span className="text-orange-600">₹{total}</span>
                </div>
              </div>

            </div>
          )}

          {/* Drawer Footer */}
          {cartItems.length > 0 && (
            <div className="p-4 border-t border-slate-100 bg-white">
              <button
                onClick={() => setShowPaymentModal(true)}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-extrabold text-sm shadow-lg shadow-orange-500/25 flex items-center justify-between transition-all group"
              >
                <div className="flex flex-col text-left">
                  <span className="text-xs text-orange-100 font-medium">{totalItemCount} Items</span>
                  <span className="text-base font-black">₹{total}</span>
                </div>
                <div className="flex items-center space-x-1.5 font-bold">
                  <span>{t('cart.proceedToPay')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Payment Gateway Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentSuccess={handlePaymentSuccess}
        totalAmount={total}
        merchantName={merchant?.businessName}
      />
    </>
  );
}
