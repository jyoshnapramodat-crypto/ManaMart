import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import { socket } from '../../services/socket';
import LiveGpsRadarMap from '../../components/LiveGpsRadarMap';
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

        {/* Live Interactive GPS Radar Map Component */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Live Turn-by-Turn GPS Radar
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              Hyperlocal Telemetry SLA &lt; 140ms
            </span>
          </div>
          <LiveGpsRadarMap
            order={{
              orderId: order.orderId || id,
              merchantName: order.merchantName,
              riderName: order.riderName,
              riderPhone: order.riderPhone,
              deliveryAddress: order.address?.street || 'Flat 402, Sai Residency',
            }}
          />
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

