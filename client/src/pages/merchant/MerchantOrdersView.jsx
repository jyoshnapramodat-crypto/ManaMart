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
  const [selectedOrderId, setSelectedOrderId] = useState(null);

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
        const orderList = res.data.orders || [];
        setOrders(orderList);
        if (orderList.length > 0 && !selectedOrderId) {
          setSelectedOrderId(orderList[0].id);
        }
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Order List / KOT Tickets */}
            <div className="lg:col-span-5 space-y-3.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
                <span>Active Tickets ({filteredOrders.length})</span>
                <span className="hidden lg:inline text-emerald-800">Select to inspect details</span>
              </div>
              {filteredOrders.map((order) => {
                const isSelected = selectedOrderId === order.id;
                return (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrderId(order.id)}
                    className={`bg-white rounded-3xl p-5 border transition-all cursor-pointer shadow-xs space-y-3 ${
                      isSelected
                        ? 'border-[#064E3B] ring-2 ring-emerald-500/20 shadow-md'
                        : 'border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div>
                        <span className="font-extrabold text-sm text-slate-900">Order #{order.id}</span>
                        <p className="text-[11px] text-slate-400">
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-sm text-slate-900">₹{order.totalAmount}</span>
                        <p className="text-[10px] text-slate-500 uppercase">{order.paymentMethod || 'COD'}</p>
                      </div>
                    </div>

                    {/* Summary snippet */}
                    <div className="text-xs text-slate-600">
                      <span className="font-semibold">{order.items?.length || 1} items: </span>
                      <span className="text-slate-500">
                        {order.items?.map((it) => `${it.quantity}x ${it.name}`).join(', ')}
                      </span>
                    </div>

                    {/* Status & Quick Mobile Buttons */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] ${
                        order.orderStatus?.toLowerCase() === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                        ['new', 'received', 'pending'].includes(order.orderStatus?.toLowerCase()) ? 'bg-amber-100 text-amber-800' :
                        order.orderStatus?.toLowerCase() === 'preparing' ? 'bg-orange-100 text-orange-800' :
                        order.orderStatus?.toLowerCase() === 'ready_for_pickup' ? 'bg-blue-100 text-blue-800' :
                        order.orderStatus?.toLowerCase() === 'handed_over' ? 'bg-purple-100 text-purple-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {order.orderStatus?.replace('_', ' ')}
                      </span>

                      {/* Quick action buttons on mobile */}
                      <div className="flex lg:hidden items-center gap-1.5">
                        {['new', 'received', 'pending'].includes(order.orderStatus?.toLowerCase()) && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(order.id, 'PREPARING');
                            }}
                            className="px-2.5 py-1 bg-[#064E3B] text-white rounded-lg font-bold text-[11px]"
                          >
                            Accept
                          </button>
                        )}
                        {order.orderStatus?.toUpperCase() === 'PREPARING' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(order.id, 'READY_FOR_PICKUP');
                            }}
                            className="px-2.5 py-1 bg-[#FF6B00] text-white rounded-lg font-bold text-[11px]"
                          >
                            Ready
                          </button>
                        )}
                        {order.orderStatus?.toUpperCase() === 'READY_FOR_PICKUP' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(order.id, 'HANDED_OVER');
                            }}
                            className="px-2.5 py-1 bg-blue-600 text-white rounded-lg font-bold text-[11px]"
                          >
                            Dispatch
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Active Order Breakdown on Desktop (7 cols on lg) */}
            <div className="hidden lg:block lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm sticky top-20 space-y-5">
              {(() => {
                const active = filteredOrders.find((o) => o.id === selectedOrderId) || filteredOrders[0];
                if (!active) {
                  return (
                    <div className="py-12 text-center text-slate-400 text-xs">
                      Select an order from the left to view detailed kitchen ticket.
                    </div>
                  );
                }

                return (
                  <>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-black text-lg text-slate-900">Order #{active.id}</span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                            {active.orderStatus?.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Placed at {new Date(active.createdAt).toLocaleTimeString()} • Customer: <strong className="text-slate-700">{active.customerName || 'Local Resident'}</strong>
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="font-black text-xl text-slate-900">₹{active.totalAmount}</span>
                        <p className="text-xs text-slate-500 font-bold uppercase">{active.paymentMethod || 'COD'}</p>
                      </div>
                    </div>

                    {/* Detailed Items Table */}
                    <div className="space-y-2">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                        Kitchen Recipe / Items List
                      </span>
                      <div className="rounded-2xl border border-slate-100 divide-y divide-slate-100 bg-slate-50/50 overflow-hidden text-xs">
                        {active.items?.map((item, idx) => (
                          <div key={idx} className="p-3 flex justify-between items-center">
                            <div>
                              <span className="font-extrabold text-slate-900">{item.quantity}x {item.name}</span>
                              {item.notes && <p className="text-[11px] text-amber-700 mt-0.5 font-medium">Note: {item.notes}</p>}
                            </div>
                            <span className="font-mono font-bold text-slate-800">₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Customer Drop Address */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                      <span className="font-extrabold text-slate-700 block">Delivery Destination</span>
                      <p className="text-slate-600">
                        {active.deliveryAddress?.street || 'Local Neighborhood Street'}, {active.deliveryAddress?.locality || 'Narakoduru'}
                      </p>
                    </div>

                    {/* Desktop Kitchen Actions */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {['new', 'received', 'pending'].includes(active.orderStatus?.toLowerCase()) && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(active.id, 'PREPARING')}
                            className="px-4 py-2.5 bg-[#064E3B] hover:bg-[#033B2D] text-white rounded-xl font-black text-xs cursor-pointer flex items-center gap-1.5 shadow-xs"
                          >
                            <ChefHat className="w-4 h-4" />
                            <span>Accept & Cook</span>
                          </button>
                        )}
                        {active.orderStatus?.toUpperCase() === 'PREPARING' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(active.id, 'READY_FOR_PICKUP')}
                            className="px-4 py-2.5 bg-[#FF6B00] hover:bg-[#e05e00] text-white rounded-xl font-black text-xs cursor-pointer flex items-center gap-1.5 shadow-xs"
                          >
                            <Truck className="w-4 h-4" />
                            <span>Mark Ready for Pickup</span>
                          </button>
                        )}
                        {active.orderStatus?.toUpperCase() === 'READY_FOR_PICKUP' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(active.id, 'HANDED_OVER')}
                            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs cursor-pointer flex items-center gap-1.5 shadow-xs"
                          >
                            <Truck className="w-4 h-4" />
                            <span>Hand Over to Courier</span>
                          </button>
                        )}
                        {active.orderStatus?.toUpperCase() === 'HANDED_OVER' && (
                          <span className="text-purple-700 font-bold text-xs bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-100">
                            In Transit • Awaiting Courier OTP Hand-off
                          </span>
                        )}
                      </div>

                      {!['delivered', 'cancelled', 'handed_over'].includes(active.orderStatus?.toLowerCase()) && (
                        <button
                          type="button"
                          onClick={() => {
                            setMerchantReason('Out of stock');
                            setCancelModalOrder(active);
                          }}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl font-bold text-xs cursor-pointer border border-red-200 transition-colors flex items-center gap-1"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Cancel Order</span>
                        </button>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
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

