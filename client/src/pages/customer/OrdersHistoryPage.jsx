import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import {
  ShoppingBag,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Repeat,
  Store,
} from 'lucide-react';

export default function OrdersHistoryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders/my-orders');
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-12 space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
          <span>{t('nav.orders')}</span>
          <ShoppingBag className="w-5 h-5 text-orange-600" />
        </h1>
        <p className="text-xs text-slate-500">
          Track active deliveries and review past orders from neighborhood stores
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm animate-pulse space-y-3">
              <div className="h-5 bg-slate-200 rounded w-1/4"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center space-y-3 border border-slate-100 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">No orders yet</h3>
          <p className="text-xs text-slate-500">
            Order your first meal, groceries, or essentials from local shops around you!
          </p>
          <button
            onClick={() => navigate('/')}
            className="text-xs font-bold text-white bg-orange-600 px-4 py-2 rounded-xl"
          >
            Explore Neighborhood
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isDelivered = order.orderStatus === 'delivered';
            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-card hover:shadow-md transition-shadow space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-slate-500">
                        #{order.orderNumber}
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          isDelivered
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-orange-50 text-orange-700 border border-orange-200 animate-pulse'
                        }`}
                      >
                        {order.orderStatus.replace(/_/g, ' ')}
                      </span>
                      {order.isRecurringOrder && (
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                          Monthly Auto-List
                        </span>
                      )}
                    </div>
                    <h3 className="font-extrabold text-base text-slate-900 mt-1">
                      {order.merchantName || 'Local Merchant'}
                    </h3>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-lg font-black text-slate-900 block">₹{order.totalAmount}</span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString()} at{' '}
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Items summary */}
                <div className="text-xs text-slate-600 space-y-1">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{item.name} × {item.quantity}</span>
                      <span className="font-semibold text-slate-800">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  {!isDelivered && (
                    <div className="flex items-center space-x-1.5 text-xs">
                      <span className="text-slate-500 font-medium">Delivery OTP:</span>
                      <span className="font-mono font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                        {order.deliveryOtp}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 ml-auto">
                    <button
                      onClick={() => navigate(`/orders/${order.id}`)}
                      className="inline-flex items-center space-x-1.5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-sm transition-all"
                    >
                      <span>Track Order</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

