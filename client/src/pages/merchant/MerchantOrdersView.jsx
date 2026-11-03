import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import MerchantPortalLayout from '../../components/merchant/MerchantPortalLayout';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  ChefHat,
  Filter,
} from 'lucide-react';

export default function MerchantOrdersView() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Cancellation Modal State
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [merchantReason, setMerchantReason] = useState('Out of stock');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/merchants/orders');
      if (res.data?.success) {
        setOrders(res.data.orders || []);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/orders/${orderId}/status`, { status: newStatus });
      if (res.data?.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus } : o))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelModalOrder) return;
    setCancelling(true);
    try {
      const res = await api.post(`/orders/${cancelModalOrder.id}/cancel`, {
        reason: merchantReason,
        cancelledBy: 'MERCHANT',
      });
      if (res.data?.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === cancelModalOrder.id ? { ...o, orderStatus: 'CANCELLED', cancellationReason: merchantReason } : o
          )
        );
        setCancelModalOrder(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filter === 'all') return true;
    const st = (o.orderStatus || '').toLowerCase();
    if (filter === 'received') return ['new', 'received', 'pending'].includes(st);
    return st === filter;
  });

  return (
    <MerchantPortalLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Incoming Customer Orders
            </h1>
            <p className="text-xs text-slate-500">
              Manage order queue, food preparation, and handover to neighborhood couriers
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {['all', 'received', 'preparing', 'ready_for_pickup', 'handed_over', 'delivered'].map((st) => (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`px-3 py-1.5 rounded-full font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
                  filter === st
                    ? 'bg-[#064E3B] text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading incoming orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-slate-400 text-xs border border-slate-200/80">
            No orders match the selected filter.
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3.5"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="font-extrabold text-sm text-slate-900">Order #{order.id}</span>
                    <p className="text-[11px] text-slate-400">
                      Received at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-base text-slate-900">₹{order.totalAmount}</span>
                    <p className="text-[10px] text-slate-500 uppercase">{order.paymentMethod || 'COD'}</p>
                  </div>
                </div>

                {/* Items */}
                <div className="text-xs space-y-1.5 text-slate-700 bg-slate-50/70 p-3 rounded-2xl">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between font-medium">
                      <span>{item.quantity}x {item.name}</span>
                      <span className="font-mono text-slate-900 font-bold">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Status & Action */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className={`px-2.5 py-1 rounded-full font-bold uppercase tracking-wider text-[10px] ${
                    order.orderStatus?.toLowerCase() === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                    ['new', 'received', 'pending'].includes(order.orderStatus?.toLowerCase()) ? 'bg-amber-100 text-amber-800' :
                    order.orderStatus?.toLowerCase() === 'preparing' ? 'bg-orange-100 text-orange-800' :
                    order.orderStatus?.toLowerCase() === 'ready_for_pickup' ? 'bg-blue-100 text-blue-800' :
                    order.orderStatus?.toLowerCase() === 'handed_over' ? 'bg-purple-100 text-purple-800' :
                    'bg-slate-100 text-slate-800'
                  }`}>
                    Status: {order.orderStatus?.replace('_', ' ')}
                  </span>

                  <div className="flex items-center gap-2">
                    {['new', 'received', 'pending'].includes(order.orderStatus?.toLowerCase()) && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                        className="px-3.5 py-1.5 bg-[#064E3B] hover:bg-[#033B2D] text-white rounded-xl font-bold cursor-pointer flex items-center gap-1 shadow-xs"
                      >
                        <ChefHat className="w-3.5 h-3.5" />
                        <span>Accept & Cook</span>
                      </button>
                    )}
                    {order.orderStatus?.toUpperCase() === 'PREPARING' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'READY_FOR_PICKUP')}
                        className="px-3.5 py-1.5 bg-[#FF6B00] hover:bg-[#e05e00] text-white rounded-xl font-bold cursor-pointer flex items-center gap-1 shadow-xs"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Mark Ready for Pickup</span>
                      </button>
                    )}
                    {order.orderStatus?.toUpperCase() === 'READY_FOR_PICKUP' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'HANDED_OVER')}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer flex items-center gap-1 shadow-xs"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Hand Over to Courier</span>
                      </button>
                    )}
                    {order.orderStatus?.toUpperCase() === 'HANDED_OVER' && (
                      <span className="text-purple-700 font-bold text-xs bg-purple-50 px-2.5 py-1 rounded-xl">
                        In Transit • Awaiting Courier OTP Hand-off
                      </span>
                    )}

                    {!['delivered', 'cancelled', 'handed_over'].includes(order.orderStatus?.toLowerCase()) && (
                      <button
                        onClick={() => {
                          setMerchantReason('Out of stock');
                          setCancelModalOrder(order);
                        }}
                        className="px-2.5 py-1.5 text-red-600 hover:bg-red-50 rounded-xl font-bold text-xs cursor-pointer border border-red-200 transition-colors flex items-center gap-1"
                        title="Cancel Order"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Merchant Cancellation Quick Reason Modal */}
        {cancelModalOrder && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-red-600">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <h3 className="font-extrabold text-base text-slate-900">
                    Cancel Order #{cancelModalOrder.id}
                  </h3>
                </div>
                <button
                  onClick={() => setCancelModalOrder(null)}
                  className="text-slate-400 hover:text-slate-600 text-lg p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="bg-red-50 text-red-900 text-xs p-3 rounded-2xl border border-red-200 space-y-1">
                <span className="font-bold block">Customer 100% Refund Guarantee</span>
                <p className="text-[11px] text-red-700">
                  Merchant-initiated cancellations immediately trigger a full 100% refund of ₹{cancelModalOrder.totalAmount} to the customer and unassign the delivery courier.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Select Merchant Reason:</label>
                <div className="space-y-1.5">
                  {[
                    'Out of stock',
                    'Kitchen closed',
                    'Power outage',
                    'Store closed for the day',
                    'High peak demand / Kitchen overloaded',
                  ].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setMerchantReason(r)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        merchantReason === r
                          ? 'border-red-500 bg-red-50 text-red-900 font-bold'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCancelModalOrder(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Keep Order
                </button>
                <button
                  type="button"
                  disabled={cancelling}
                  onClick={handleCancelOrder}
                  className="flex-1 py-2.5 rounded-xl text-xs font-extrabold text-white bg-red-600 hover:bg-red-700 shadow-sm cursor-pointer transition-colors"
                >
                  {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MerchantPortalLayout>
  );
}

