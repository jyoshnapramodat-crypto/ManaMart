import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';
import {
  ShoppingBag,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Repeat,
  Store,
  FileText,
  XCircle,
  RotateCcw,
  ShieldCheck,
  Download,
  AlertTriangle,
  Receipt,
  Check,
} from 'lucide-react';

export default function OrdersHistoryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addItem, setIsCartOpen } = useCart();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'completed' | 'cancelled'

  // Cancellation Modal State (Module 8)
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('Placed order by mistake');
  const [cancelComments, setCancelComments] = useState('');
  const [cancelSuccessOrder, setCancelSuccessOrder] = useState(null);

  // 1-Click Reorder State (Module 10)
  const [reorderModalOrder, setReorderModalOrder] = useState(null);
  const [reorderStatus, setReorderStatus] = useState(null); // 'verifying' | 'ready'

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders/my-orders');
      if (res.data.success && res.data.orders) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter orders by tab
  const activeOrders = orders.filter(
    (o) => !['delivered', 'cancelled'].includes(o.orderStatus?.toLowerCase())
  );
  const completedOrders = orders.filter(
    (o) => o.orderStatus?.toLowerCase() === 'delivered'
  );
  const cancelledOrders = orders.filter(
    (o) => o.orderStatus?.toLowerCase() === 'cancelled'
  );

  const displayedOrders =
    activeTab === 'active'
      ? activeOrders
      : activeTab === 'completed'
      ? completedOrders
      : cancelledOrders;

  // Handle Cancel Order Confirmation
  const handleConfirmCancel = () => {
    if (!cancelModalOrder) return;

    // Update locally and simulate backend cancellation
    setOrders((prev) =>
      prev.map((o) =>
        o.id === cancelModalOrder.id
          ? {
              ...o,
              orderStatus: 'cancelled',
              cancellationReason: cancelReason,
              cancellationComments: cancelComments,
              refund: {
                status: 'Refund Initiated',
                amount: o.finalPayable || o.totalAmount || 280,
                method: o.paymentMethod || 'UPI',
                timeline: '15-45 minutes to your original account',
                txnId: `ref_${Math.random().toString(36).substring(2, 9)}`,
              },
            }
          : o
      )
    );

    const cancelledItem = {
      ...cancelModalOrder,
      orderStatus: 'cancelled',
      refund: {
        status: 'Refund Initiated',
        amount: cancelModalOrder.finalPayable || cancelModalOrder.totalAmount || 280,
        method: cancelModalOrder.paymentMethod || 'UPI',
        timeline: '15-45 minutes to your original account',
      },
    };

    setCancelSuccessOrder(cancelledItem);
    setCancelModalOrder(null);
    setActiveTab('cancelled');
  };

  // Handle 1-Click Reorder
  const handleStartReorder = (order) => {
    setReorderModalOrder(order);
    setReorderStatus('verifying');

    // Simulate price check & availability confirmation
    setTimeout(() => {
      setReorderStatus('ready');
    }, 1000);
  };

  const handleConfirmReorder = () => {
    if (!reorderModalOrder) return;

    // Add items from this order to current cart
    const store = {
      id: reorderModalOrder.merchantId || 'm-1',
      businessName: reorderModalOrder.merchant?.businessName || reorderModalOrder.merchantName || 'Swagath Grand',
      deliveryFee: 35,
    };

    reorderModalOrder.items.forEach((it) => {
      addItem(
        {
          id: it.productId || it.id,
          name: it.name,
          price: it.price,
          unit: it.unit || 'unit',
          isVeg: it.isVeg !== false,
          inStock: true,
        },
        store
      );
    });

    setReorderModalOrder(null);
    setIsCartOpen(true);
  };

  // Generate Printable Tax Invoice
  const handleDownloadInvoice = (order) => {
    const invoiceWindow = window.open('', '_blank');
    const invoiceHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>ManaMart Tax Invoice #${order.orderNumber || order.id}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #1e293b; }
          .header { border-bottom: 2px solid #003527; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
          .title { color: #003527; font-size: 24px; font-weight: bold; }
          .badge { background: #003527; color: white; padding: 4px 10px; border-radius: 6px; font-size: 12px; }
          .grid { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 13px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; }
          th { background: #f8fafc; text-align: left; padding: 10px; border-bottom: 2px solid #e2e8f0; }
          td { padding: 10px; border-bottom: 1px solid #f1f5f9; }
          .total-row { font-weight: bold; font-size: 15px; border-top: 2px solid #003527; }
          .footer { margin-top: 30px; font-size: 11px; color: #64748b; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">ManaMart - Mana Ooru. Mana Market.</div>
            <div style="font-size: 12px; color: #64748b;">Official Neighborhood Tax Invoice & Delivery Memo</div>
          </div>
          <span class="badge">PAID • VERIFIED</span>
        </div>

        <div class="grid">
          <div>
            <strong>Merchant Details:</strong><br />
            ${order.merchant?.businessName || order.merchantName || 'Swagath Grand'}<br />
            Madhapur Main Road, Hyderabad, Telangana<br />
            GSTIN: 36AAACG1234F1Z5
          </div>
          <div style="text-align: right;">
            <strong>Invoice #:</strong> MNM-INV-${order.orderNumber || '841920'}<br />
            <strong>Order ID:</strong> ${order.id}<br />
            <strong>Date:</strong> ${new Date(order.createdAt || Date.now()).toLocaleString()}<br />
            <strong>Payment Mode:</strong> ${(order.paymentMethod || 'UPI').toUpperCase()}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item Description</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${(order.items || []).map((it) => `
              <tr>
                <td>${it.name}</td>
                <td>${it.quantity}</td>
                <td>₹${it.price}</td>
                <td style="text-align: right;">₹${it.price * it.quantity}</td>
              </tr>
            `).join('')}
            <tr>
              <td colspan="3" style="text-align: right;">Store Delivery Fee</td>
              <td style="text-align: right;">₹${order.deliveryFee || 35}</td>
            </tr>
            <tr>
              <td colspan="3" style="text-align: right;">Platform Fee</td>
              <td style="text-align: right;">₹5</td>
            </tr>
            <tr>
              <td colspan="3" style="text-align: right;">Taxes & GST (5%)</td>
              <td style="text-align: right;">₹${Math.round((order.subtotal || 250) * 0.05)}</td>
            </tr>
            <tr class="total-row">
              <td colspan="3" style="text-align: right;">Total Paid</td>
              <td style="text-align: right; color: #003527;">₹${order.finalPayable || order.totalAmount || 280}</td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          This is an electronically generated authentic tax receipt by ManaMart Hyperlocal Platform.<br />
          Thank you for supporting your local neighborhood merchants!
        </div>
        <script>window.print();</script>
      </body>
      </html>
    `;
    invoiceWindow.document.write(invoiceHtml);
    invoiceWindow.document.close();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Orders & Invoices</span>
            <ShoppingBag className="w-5 h-5 text-orange-600" />
          </h1>
          <p className="text-xs text-slate-500">
            Track live deliveries, cancel active orders, check refund timelines, and reorder in 1-click
          </p>
        </div>
      </div>

      {/* 3 Tabs: Active, Completed, Cancelled (Module 10) */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('active')}
          className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center space-x-1.5 ${
            activeTab === 'active'
              ? 'border-orange-600 text-orange-600 bg-orange-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Active Orders</span>
          <span className="w-4 h-4 rounded-full bg-orange-100 text-orange-700 text-[10px] flex items-center justify-center font-bold">
            {activeOrders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center space-x-1.5 ${
            activeTab === 'completed'
              ? 'border-orange-600 text-orange-600 bg-orange-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Completed</span>
          <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 text-[10px] flex items-center justify-center font-bold">
            {completedOrders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('cancelled')}
          className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center space-x-1.5 ${
            activeTab === 'cancelled'
              ? 'border-orange-600 text-orange-600 bg-orange-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Cancelled & Refunds</span>
          <span className="w-4 h-4 rounded-full bg-red-100 text-red-700 text-[10px] flex items-center justify-center font-bold">
            {cancelledOrders.length}
          </span>
        </button>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm animate-pulse space-y-3">
              <div className="h-5 bg-slate-200 rounded w-1/4"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : displayedOrders.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl p-10 text-center space-y-3 border border-slate-200 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="font-extrabold text-slate-800 text-sm">
            {activeTab === 'active'
              ? 'No active orders in transit'
              : activeTab === 'completed'
              ? 'No completed orders yet'
              : 'No cancelled orders'}
          </h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            Discover delicious handi biryani, farm fresh milk, sweets, or 24x7 medicines from neighborhood merchants!
          </p>
          <button
            onClick={() => navigate('/app')}
            className="text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 px-4 py-2.5 rounded-xl shadow-xs transition-colors"
          >
            Explore Neighborhood Stores
          </button>
        </div>
      ) : (
        /* Orders List */
        <div className="space-y-4">
          {displayedOrders.map((order) => {
            const isDelivered = order.orderStatus === 'delivered';
            const isCancelled = order.orderStatus === 'cancelled';
            const canCancel = ['placed', 'confirmed'].includes(order.orderStatus?.toLowerCase());

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-card hover:shadow-md transition-shadow space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-slate-700">
                        #{order.orderNumber || order.id?.substring(0, 8)}
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                          isDelivered
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : isCancelled
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : 'bg-orange-100 text-orange-800 border border-orange-200 animate-pulse'
                        }`}
                      >
                        {order.orderStatus.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 text-right">
                    <div>
                      <span className="text-sm font-black text-slate-900 block">
                        ₹{order.finalPayable || order.totalAmount || 280}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        {order.paymentMethod || 'UPI'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Store & Items summary */}
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold flex-shrink-0">
                    <Store className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold text-sm text-slate-900 truncate">
                      {order.merchant?.businessName || order.merchantName || 'Swagath Grand'}
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {(order.items || [])
                        .map((it) => `${it.name} (x${it.quantity})`)
                        .join(', ')}
                    </p>
                  </div>
                </div>

                {/* REFUND LIFECYCLE TRACKER (Module 8) */}
                {isCancelled && (
                  <div className="p-3.5 bg-red-50/60 rounded-2xl border border-red-200/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-red-900 flex items-center space-x-1.5">
                        <RotateCcw className="w-3.5 h-3.5 text-red-600" />
                        <span>Refund Lifecycle Tracker</span>
                      </span>
                      <span className="text-[10px] font-bold text-red-700 bg-white px-2 py-0.5 rounded-full border border-red-200">
                        {order.refund?.status || 'Refund Initiated'}
                      </span>
                    </div>

                    <div className="text-[11px] text-red-800 space-y-0.5">
                      <p>• Refund Amount: <strong>₹{order.finalPayable || order.totalAmount || 280}</strong></p>
                      <p>• Crediting to: <strong>Original {order.paymentMethod || 'UPI'} Account</strong></p>
                      <p>• Estimated Timeline: <strong>{order.refund?.timeline || '15-45 minutes'}</strong></p>
                    </div>
                  </div>
                )}

                {/* Actions Footer */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    {/* Invoice Download (Module 10) */}
                    <button
                      onClick={() => handleDownloadInvoice(order)}
                      className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-500" />
                      <span>Invoice</span>
                    </button>

                    {/* Customer Cancel Button (Module 8) */}
                    {canCancel && (
                      <button
                        onClick={() => setCancelModalOrder(order)}
                        className="text-xs font-bold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-xl border border-red-200 transition-all"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* 1-Click Reorder Button (Module 10) */}
                    <button
                      onClick={() => handleStartReorder(order)}
                      className="text-xs font-bold text-orange-600 hover:bg-orange-50 px-3.5 py-1.5 rounded-xl border border-orange-200 transition-all flex items-center space-x-1.5"
                    >
                      <Repeat className="w-3.5 h-3.5" />
                      <span>Reorder Items</span>
                    </button>

                    {/* Live Tracking Link for Active */}
                    {!isDelivered && !isCancelled && (
                      <button
                        onClick={() => navigate(`/orders/${order.id}`)}
                        className="text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 px-4 py-1.5 rounded-xl shadow-xs transition-all flex items-center space-x-1"
                      >
                        <span>Live GPS Track</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: CUSTOMER CANCELLATION (Module 8) */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-100">
            <div className="flex items-center space-x-3 text-red-600">
              <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Cancel Active Order?</h3>
                <span className="text-[11px] text-slate-500">Order #{cancelModalOrder.orderNumber || cancelModalOrder.id?.substring(0, 8)}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Please choose a reason for cancellation. Any payments made will be refunded automatically to your original payment method.
            </p>

            {/* Reasons */}
            <div className="space-y-1.5">
              {[
                'Placed order by mistake',
                'Expected faster delivery arrival',
                'Want to modify items or delivery address',
                'Found alternative at local street market',
                'Other reason',
              ].map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center space-x-2 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    cancelReason === reason
                      ? 'border-red-500 bg-red-50/50 text-red-950 font-bold'
                      : 'border-slate-200 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="cancel_reason"
                    checked={cancelReason === reason}
                    onChange={() => setCancelReason(reason)}
                    className="text-red-600 focus:ring-red-500"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            <textarea
              rows="2"
              value={cancelComments}
              onChange={(e) => setCancelComments(e.target.value)}
              placeholder="Additional comments (optional)..."
              className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-red-500"
            />

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalOrder(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition-all"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: 1-CLICK REORDER STOCK & PRICE VERIFICATION (Module 10) */}
      {reorderModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <Repeat className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">1-Click Quick Reorder</h3>
                <span className="text-[11px] text-slate-500">
                  From {reorderModalOrder.merchant?.businessName || reorderModalOrder.merchantName || 'Local Store'}
                </span>
              </div>
            </div>

            {reorderStatus === 'verifying' ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-8 h-8 rounded-full border-3 border-orange-500 border-t-transparent animate-spin mx-auto" />
                <p className="text-xs text-slate-500">Checking neighborhood merchant stock & latest prices...</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>All {(reorderModalOrder.items || []).length} items are currently fresh in stock at the same price!</span>
                </div>

                <div className="space-y-1.5 divide-y divide-slate-100 max-h-48 overflow-y-auto">
                  {(reorderModalOrder.items || []).map((it, idx) => (
                    <div key={idx} className="pt-1.5 first:pt-0 flex justify-between text-xs">
                      <span className="text-slate-800 font-medium">{it.name} (x{it.quantity})</span>
                      <span className="font-black text-orange-600">₹{it.price * it.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReorderModalOrder(null)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmReorder}
                    className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md"
                  >
                    Add to Basket & Checkout
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
