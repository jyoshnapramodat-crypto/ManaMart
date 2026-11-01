import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { socket } from '../../services/socket';
import {
  Clock,
  MapPin,
  Bike,
  ShieldCheck,
  Phone,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Navigation,
  KeyRound,
  Store,
  ChevronRight,
} from 'lucide-react';

export default function OrderTrackingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [riderPosition, setRiderPosition] = useState({ lat: 17.4450, lng: 78.3930 });

  useEffect(() => {
    fetchOrder();

    // Join socket room
    socket.emit('join:order', id);

    // Listen to real-time status progression from merchant/rider
    socket.on('order:status_changed', ({ status, note }) => {
      setOrder((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          orderStatus: status,
          timeline: [...prev.timeline, { status: status.toUpperCase(), time: 'Just now', note }],
        };
      });
    });

    // Listen to rider GPS movement
    socket.on('order:rider_moved', ({ lat, lng }) => {
      setRiderPosition({ lat, lng });
    });

    return () => {
      socket.off('order:status_changed');
      socket.off('order:rider_moved');
    };
  }, [id]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/orders/${id}`);
      if (res.data.success) {
        setOrder(res.data.order);
        if (res.data.order.riderCoordinates) {
          setRiderPosition(res.data.order.riderCoordinates);
        }
      }
    } catch (err) {
      console.error('Failed to fetch order:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center space-y-4 animate-pulse">
        <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto"></div>
        <div className="h-6 bg-slate-200 rounded w-1/3 mx-auto"></div>
        <div className="h-4 bg-slate-200 rounded w-1/2 mx-auto"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-3">
        <h3 className="text-base font-bold text-slate-800">Order not found</h3>
        <button
          onClick={() => navigate('/orders')}
          className="text-xs font-bold bg-orange-600 text-white px-4 py-2 rounded-xl"
        >
          View All Orders
        </button>
      </div>
    );
  }

  const isDelivered = order.orderStatus === 'delivered';

  const stages = [
    { key: 'confirmed', label: 'Order Confirmed', done: true },
    { key: 'preparing', label: 'Store Preparing', done: ['preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered'].includes(order.orderStatus) },
    { key: 'out_for_delivery', label: 'Out for Delivery', done: ['out_for_delivery', 'delivered'].includes(order.orderStatus) },
    { key: 'delivered', label: 'Delivered', done: order.orderStatus === 'delivered' },
  ];

  return (
    <div className="min-h-screen pb-24 md:pb-12 bg-[#F8F9FA]">
      
      {/* Top back navigation */}
      <div className="max-w-3xl mx-auto px-4 pt-3 pb-2 flex items-center justify-between">
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-orange-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>My Orders</span>
        </button>
        <span className="text-xs font-mono font-bold text-slate-500">
          Order #{order.orderNumber}
        </span>
      </div>

      <div className="max-w-3xl mx-auto px-4 space-y-4">
        
        {/* OTP Highlight Banner (Critical for Hand-off Verification) */}
        {!isDelivered && (
          <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 rounded-3xl p-5 text-white shadow-lg shadow-orange-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-1.5 text-orange-200 text-xs font-bold">
                <KeyRound className="w-4 h-4" />
                <span>Delivery Verification Code</span>
              </div>
              <p className="text-xs text-orange-100 max-w-sm">
                Share this secure 4-digit code with your rider upon arrival to receive your package:
              </p>
            </div>
            
            <div className="bg-white text-orange-600 px-6 py-2.5 rounded-2xl font-black text-2xl tracking-widest text-center shadow-md border-2 border-orange-200">
              {order.deliveryOtp || '4892'}
            </div>
          </div>
        )}

        {/* Live Map Visualization Card */}
        <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-soft">
          <div className="relative h-64 sm:h-80 bg-slate-900 overflow-hidden">
            {/* Map Canvas Background (Simulated Vector Map) */}
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#475569_1px,transparent_1px)] [background-size:16px_16px]"></div>
            
            {/* Road path svg */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <path
                d="M 60 220 Q 180 120 320 180 T 520 80"
                fill="none"
                stroke="#FF5E1E"
                strokeWidth="5"
                strokeDasharray="8 6"
                className="animate-pulse"
              />
            </svg>

            {/* Merchant Pin */}
            <div className="absolute left-10 sm:left-14 bottom-10 flex flex-col items-center">
              <div className="w-10 h-10 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-lg border-2 border-white">
                <Store className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-extrabold text-white bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md mt-1">
                {order.merchantName ? order.merchantName.split(' ')[0] : 'Store'}
              </span>
            </div>

            {/* Animated Moving Rider Pin */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-bounce duration-1000">
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xl border-3 border-white ring-4 ring-emerald-400/40">
                <Bike className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black text-emerald-950 bg-emerald-300 px-2 py-0.5 rounded-md mt-1 shadow-sm">
                Rider {order.riderName?.split(' ')[0] || 'Partner'}
              </span>
            </div>

            {/* Customer Drop Pin */}
            <div className="absolute right-10 sm:right-16 top-12 flex flex-col items-center">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg border-2 border-white">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-extrabold text-white bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md mt-1">
                Your Doorstep
              </span>
            </div>

            {/* Live Status Overlay Pill */}
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-2xl shadow-md border border-slate-100 flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-xs font-bold text-slate-800">
                {isDelivered ? 'Delivered' : 'Arriving in ~12 mins'}
              </span>
            </div>
          </div>

          {/* Rider Details Bar */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                <Bike className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">{order.riderName || 'Suresh Varma'}</h4>
                <p className="text-[11px] text-slate-500">Verified ManaMart Delivery Partner (Hero Splendor)</p>
              </div>
            </div>

            <a
              href={`tel:${order.riderPhone || '9123456780'}`}
              className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:text-emerald-600 hover:border-emerald-300 shadow-2xs transition-colors flex items-center space-x-1 text-xs font-bold"
            >
              <Phone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Call Rider</span>
            </a>
          </div>
        </div>

        {/* Stages Timeline */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-soft space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">Order Status Progress</h3>
          
          <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {stages.map((stage, idx) => (
              <div key={stage.key} className="relative flex items-start space-x-3 text-xs">
                <div
                  className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${
                    stage.done
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-slate-300'
                  }`}
                >
                  {stage.done && <CheckCircle2 className="w-3 h-3 text-white" />}
                </div>
                <div>
                  <span className={`font-bold ${stage.done ? 'text-slate-900' : 'text-slate-400'}`}>
                    {stage.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Items Receipt Summary */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-soft space-y-3 text-xs">
          <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">Item Details</h3>
          <div className="divide-y divide-slate-100">
            {order.items?.map((item, idx) => (
              <div key={idx} className="py-2.5 flex justify-between items-center text-slate-700">
                <div className="space-y-0.5">
                  <span className="font-semibold block">{item.name}</span>
                  <span className="text-[11px] text-slate-400">Qty: {item.quantity}</span>
                </div>
                <span className="font-bold text-slate-900">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-1.5 text-slate-500">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee:</span>
              <span>₹{order.deliveryFee}</span>
            </div>
            <div className="flex justify-between">
              <span>Taxes:</span>
              <span>₹{order.taxesAndCharges}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Discount:</span>
                <span>-₹{order.discount}</span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
              <span>Total Paid:</span>
              <span className="text-orange-600">₹{order.totalAmount}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

