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
  Star,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Lock,
  ThumbsUp,
  MessageSquare,
  DollarSign,
  Heart,
  HelpCircle,
} from 'lucide-react';

export default function OrderTrackingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [riderPosition, setRiderPosition] = useState({ lat: 17.4450, lng: 78.3930 });

  // Cancellation Modal State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Changed my mind');
  const [confirmDeduction, setConfirmDeduction] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState(null);

  // Review Engine State
  const [storeRating, setStoreRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState([]);
  const [storeComment, setStoreComment] = useState('');
  const [riderRating, setRiderRating] = useState(5);
  const [riderTip, setRiderTip] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewDetails, setReviewDetails] = useState(null);

  useEffect(() => {
    fetchOrder();
    fetchExistingReview();

    // Join socket room
    socket.emit('join:order', id);

    // Listen to real-time status progression from merchant/rider
    socket.on('order:status_changed', ({ status, note, order: updatedOrder }) => {
      setOrder((prev) => {
        if (!prev) return prev;
        const normalized = status ? status.toUpperCase() : prev.orderStatus;
        return {
          ...prev,
          ...(updatedOrder || {}),
          orderStatus: normalized,
          timeline: [...(prev.timeline || []), { status: normalized, time: 'Just now', note }],
        };
      });
    });

    // Listen to real-time cancellation
    socket.on('order:cancelled', (data) => {
      if (data && (data.orderId === id || data.orderId === order?.orderId)) {
        setOrder((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            orderStatus: 'CANCELLED',
            cancelledBy: data.cancelledBy,
            cancellationReason: data.reason,
            refundAmount: data.refundAmount,
            cancellationFee: data.cancellationFee,
            refundPercentage: data.refundPercentage,
            cancelledAt: new Date().toISOString(),
          };
        });
      }
    });

    // Listen to rider GPS movement
    socket.on('order:rider_moved', ({ lat, lng }) => {
      setRiderPosition({ lat, lng });
    });

    return () => {
      socket.off('order:status_changed');
      socket.off('order:cancelled');
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
        if (res.data.order.review) {
          setReviewDetails(res.data.order.review);
          setReviewSuccess(true);
        }
      }
    } catch (err) {
      console.error('Failed to fetch order:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingReview = async () => {
    try {
      const res = await api.get(`/orders/${id}/review`);
      if (res.data?.success && res.data.review) {
        setReviewDetails(res.data.review);
        setReviewSuccess(true);
      }
    } catch (err) {
      // Ignore if no review exists yet
    }
  };

  const handleCancelOrder = async () => {
    setCancelling(true);
    setCancelError(null);
    try {
      const res = await api.post(`/orders/${order.orderId || id}/cancel`, {
        reason: cancelReason,
        confirmDeduction: confirmDeduction,
        cancelledBy: 'CUSTOMER',
      });

      if (res.data?.success) {
        setOrder(res.data.order);
        setShowCancelModal(false);
      }
    } catch (err) {
      const resp = err.response?.data;
      if (resp?.requiresConfirmation) {
        setConfirmDeduction(true);
        setCancelError(resp.message);
      } else {
        setCancelError(resp?.message || 'Unable to cancel order. Please contact support.');
      }
    } finally {
      setCancelling(false);
    }
  };

  const handleTagToggle = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      const res = await api.post(`/orders/${order.orderId || id}/review`, {
        storeRating,
        storeTags: selectedTags,
        storeComment,
        riderRating,
        riderTip: Number(riderTip),
      });

      if (res.data?.success) {
        setReviewSuccess(true);
        setReviewDetails(res.data.review);
        setOrder((prev) => ({ ...prev, reviewSubmitted: true, review: res.data.review }));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
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
          className="text-xs font-bold bg-[#FF6B00] text-white px-4 py-2 rounded-xl"
        >
          View All Orders
        </button>
      </div>
    );
  }

  const rawStatus = (order.orderStatus || order.status || '').toUpperCase();
  const isDelivered = rawStatus === 'DELIVERED';
  const isCancelled = rawStatus === 'CANCELLED';
  const isPlaced = rawStatus === 'PLACED';
  const isPreparingOrReady = ['ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP', 'READYFORPICKUP'].includes(rawStatus);
  const isOutForDelivery = ['OUT_FOR_DELIVERY', 'OUTFORDELIVERY'].includes(rawStatus);

  const stages = [
    { key: 'placed', label: 'Order Placed', done: true },
    { key: 'preparing', label: 'Store Preparing', done: ['ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP', 'READYFORPICKUP', 'OUT_FOR_DELIVERY', 'OUTFORDELIVERY', 'DELIVERED'].includes(rawStatus) },
    { key: 'out_for_delivery', label: 'Out for Delivery', done: ['OUT_FOR_DELIVERY', 'OUTFORDELIVERY', 'DELIVERED'].includes(rawStatus) },
    { key: 'delivered', label: 'Delivered', done: isDelivered },
  ];

  const totalAmount = Number(order.totalAmount || 0);
  const prepDeduction = Math.round(totalAmount * 0.5);
  const prepRefund = totalAmount - prepDeduction;

  const positiveTags = ['Hot & Fresh', 'Tasty Food', 'Well Packaged', 'Generous Portions', 'Correct Items', 'Quick Prep'];
  const negativeTags = ['Leaking Package', 'Cold Food', 'Wrong Item', 'Missing Item', 'Poor Taste', 'Excessive Delay'];
  const availableTags = storeRating <= 2 ? negativeTags : positiveTags;

  return (
    <div className="min-h-screen pb-24 md:pb-12 bg-[#F8F9FA]">
      
      {/* Top back navigation */}
      <div className="max-w-3xl mx-auto px-4 pt-3 pb-2 flex items-center justify-between">
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-[#FF6B00] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>My Orders</span>
        </button>
        <span className="text-xs font-mono font-bold text-slate-500">
          Order #{order.orderNumber || order.orderId || id}
        </span>
      </div>

      <div className="max-w-3xl mx-auto px-4 space-y-4">
        
        {/* ======================================================== */}
        {/* 1. CANCELLED ORDER BANNER                                */}
        {/* ======================================================== */}
        {isCancelled && (
          <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-5 text-red-900 shadow-sm space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center shrink-0 text-red-600">
                <XCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-base text-red-950">This Order Has Been Cancelled</h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-red-200/80 text-red-900 px-2.5 py-0.5 rounded-full">
                    Cancelled
                  </span>
                </div>
                <p className="text-xs text-red-800">
                  {order.cancellationReason || 'Order cancellation processed.'}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-red-200/60 flex flex-wrap items-center justify-between text-xs font-medium text-red-900 gap-2">
              <div>
                <span className="text-red-700">Refund Issued: </span>
                <span className="font-bold text-emerald-700">₹{order.refundAmount ?? order.totalAmount}</span>
                {order.cancellationFee > 0 && (
                  <span className="text-[11px] text-red-600 ml-1.5">
                    (₹{order.cancellationFee} prep deduction retained)
                  </span>
                )}
              </div>
              <span className="text-[11px] text-red-600">
                Action by: {order.cancelledBy || 'Platform'}
              </span>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 2. OTP HIGHLIGHT BANNER (When Active)                    */}
        {/* ======================================================== */}
        {!isDelivered && !isCancelled && (
          <div className="bg-gradient-to-r from-[#FF6B00] via-amber-600 to-[#FF6B00] rounded-3xl p-5 text-white shadow-lg shadow-orange-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-1.5 text-orange-200 text-xs font-bold">
                <KeyRound className="w-4 h-4" />
                <span>Delivery Verification Code</span>
              </div>
              <p className="text-xs text-orange-100 max-w-sm">
                Share this secure 4-digit code with your rider upon arrival to complete verification:
              </p>
            </div>
            
            <div className="bg-white text-[#FF6B00] px-6 py-2.5 rounded-2xl font-black text-2xl tracking-widest text-center shadow-md border-2 border-orange-200">
              {order.deliveryOtp || '4892'}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 3. LIVE GPS RADAR MAP                                    */}
        {/* ======================================================== */}
        {!isCancelled && (
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
        )}

        {/* ======================================================== */}
        {/* 4. CANCELLATION CONTROLS (Active States)                 */}
        {/* ======================================================== */}
        {!isDelivered && !isCancelled && (
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-slate-500" />
                Order Cancellation Policy
              </span>
              <p className="text-[11px] text-slate-500">
                {isPlaced && '1-Click Instant Cancellation with 100% full refund available.'}
                {isPreparingOrReady && 'Store is preparing food. 50% kitchen & food wastage deduction applies.'}
                {isOutForDelivery && 'Cancellation locked while rider is delivering. Contact support or rider.'}
              </p>
            </div>

            {isPlaced && (
              <button
                onClick={() => {
                  setConfirmDeduction(false);
                  setShowCancelModal(true);
                }}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl font-bold text-xs cursor-pointer transition-colors shrink-0 flex items-center justify-center gap-1.5"
              >
                <XCircle className="w-4 h-4 text-red-600" />
                <span>Cancel Order (100% Refund)</span>
              </button>
            )}

            {isPreparingOrReady && (
              <button
                onClick={() => {
                  setConfirmDeduction(false);
                  setShowCancelModal(true);
                }}
                className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-xl font-bold text-xs cursor-pointer transition-colors shrink-0 flex items-center justify-center gap-1.5"
              >
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Cancel (50% Deduction)</span>
              </button>
            )}

            {isOutForDelivery && (
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Cancellation Locked</span>
                </span>
                <a
                  href={`tel:${order.riderPhone || '1800100200'}`}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Rider</span>
                </a>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* 5. MULTI-VENDOR REVIEW & RATING ENGINE (When Delivered)  */}
        {/* ======================================================== */}
        {isDelivered && (
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-soft space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <Star className="w-4 h-4 fill-emerald-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    {reviewSuccess ? 'Your Experience Review' : 'Rate Your Delivery Experience'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {reviewSuccess
                      ? 'Thank you for supporting neighborhood merchants & couriers'
                      : 'Help local businesses and delivery partners improve with your feedback'}
                  </p>
                </div>
              </div>
              {reviewSuccess && (
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold text-[10px] uppercase tracking-wider rounded-full border border-emerald-200">
                  Review Submitted
                </span>
              )}
            </div>

            {reviewSuccess && reviewDetails ? (
              <div className="space-y-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-800">
                      {reviewDetails.storeName || order.merchantName || 'Store Experience'}
                    </span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= reviewDetails.storeRating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-200'
                          }`}
                        />
                      ))}
                      <span className="text-xs font-bold text-slate-700 ml-1">
                        {reviewDetails.storeRating} / 5
                      </span>
                    </div>
                  </div>

                  {reviewDetails.riderRating && (
                    <div className="space-y-0.5 text-right">
                      <span className="text-xs font-bold text-slate-800">
                        {reviewDetails.riderName || 'Rider Delivery'}
                      </span>
                      <div className="flex items-center justify-end gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= reviewDetails.riderRating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-200'
                            }`}
                          />
                        ))}
                        <span className="text-xs font-bold text-slate-700 ml-1">
                          {reviewDetails.riderRating} / 5
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {reviewDetails.storeTags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {reviewDetails.storeTags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {reviewDetails.comment && (
                  <p className="text-xs text-slate-600 italic bg-white p-2.5 rounded-xl border border-slate-100">
                    "{reviewDetails.comment}"
                  </p>
                )}

                {reviewDetails.riderTip > 0 && (
                  <div className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 fill-emerald-600" />
                    <span>Rider Tip: ₹{reviewDetails.riderTip} included via UPI</span>
                  </div>
                )}

                {reviewDetails.autoDisputeCreated && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Dispute Ticket Auto-Dispatched: </span>
                      A ticket has been sent to our Admin Dispute team ({reviewDetails.disputeId}) for review and merchant coaching.
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-5">
                {/* Step 1: Store & Food/Product Quality */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5 text-[#064E3B]" />
                        <span>Step 1: Store & Food Quality</span>
                      </span>
                      <p className="text-[11px] text-slate-400">
                        {order.merchantName || 'Neighborhood Merchant'}
                      </p>
                    </div>

                    {/* Star Selector */}
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setStoreRating(star)}
                          className="p-1 focus:outline-none cursor-pointer"
                        >
                          <Star
                            className={`w-6 h-6 transition-colors ${
                              star <= storeRating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-200 hover:text-amber-200'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quality Tag Chips */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-500">Quick feedback tags:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {availableTags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleTagToggle(tag)}
                          className={`text-xs px-3 py-1 rounded-full font-medium transition-all cursor-pointer ${
                            selectedTags.includes(tag)
                              ? 'bg-[#064E3B] text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comments input */}
                  <div>
                    <textarea
                      value={storeComment}
                      onChange={(e) => setStoreComment(e.target.value)}
                      placeholder="Write a note about the taste, packaging, or freshness (optional)..."
                      className="w-full text-xs p-3 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#064E3B] transition-all resize-none h-20"
                    />
                  </div>
                </div>

                {/* Step 2: Delivery Partner Experience */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                        <Bike className="w-3.5 h-3.5 text-[#FF6B00]" />
                        <span>Step 2: Delivery Partner</span>
                      </span>
                      <p className="text-[11px] text-slate-400">
                        {order.riderName || 'Neighborhood Delivery Hero'}
                      </p>
                    </div>

                    {/* Rider Star Selector */}
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRiderRating(star)}
                          className="p-1 focus:outline-none cursor-pointer"
                        >
                          <Star
                            className={`w-6 h-6 transition-colors ${
                              star <= riderRating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-200 hover:text-amber-200'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rider Tip Selection */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-500">
                      Add a tip for your delivery partner (UPI):
                    </span>
                    <div className="flex items-center gap-2">
                      {[0, 20, 30, 50, 100].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setRiderTip(amt)}
                          className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                            riderTip === amt
                              ? 'bg-[#FF6B00] text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {amt === 0 ? 'No Tip' : `₹${amt}`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Auto Dispute Notice for low ratings */}
                {(storeRating <= 2 || riderRating <= 2) && (
                  <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="font-bold block">Low Rating Resolution Guarantee</span>
                      <p className="text-[11px] text-amber-800">
                        Because you rated 2 stars or below, this review will automatically dispatch a priority ticket to our Admin Dispute Resolution console for investigation and corrective action.
                      </p>
                    </div>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full py-3 bg-[#064E3B] hover:bg-[#033B2D] text-white rounded-2xl font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>{submittingReview ? 'Submitting Feedback...' : 'Submit Review & Rating'}</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* 6. STAGES TIMELINE                                       */}
        {/* ======================================================== */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-soft space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">Order Status Progress</h3>
          
          <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {stages.map((stage) => (
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

        {/* ======================================================== */}
        {/* 7. ORDER ITEMS RECEIPT SUMMARY                           */}
        {/* ======================================================== */}
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
              <span>₹{order.subtotal || totalAmount}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee:</span>
              <span>₹{order.deliveryFee || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Taxes:</span>
              <span>₹{order.taxesAndCharges || 0}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Discount:</span>
                <span>-₹{order.discount}</span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
              <span>Total Paid:</span>
              <span className="text-[#FF6B00]">₹{totalAmount}</span>
            </div>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* CANCELLATION CONFIRMATION MODAL                          */}
      {/* ======================================================== */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-red-600">
                <div className="w-9 h-9 rounded-2xl bg-red-50 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    Cancel Order #{order.orderNumber || order.orderId || id}
                  </h3>
                  <span className="text-[11px] text-slate-400">Hyperlocal Cancellation Policy</span>
                </div>
              </div>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Policy Breakdown */}
            {isPlaced && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900 space-y-1">
                <span className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  100% Full Refund Policy Active
                </span>
                <p className="text-[11px] text-emerald-800">
                  Because the store has not begun food preparation, you will receive a full ₹{totalAmount} refund to your original payment method.
                </p>
              </div>
            )}

            {isPreparingOrReady && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-2.5">
                <span className="font-extrabold text-amber-950 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Food Preparation Underway Notice
                </span>
                <p className="text-[11px] text-amber-800">
                  The merchant has already initiated kitchen preparation. To prevent food wastage, a 50% deduction applies to cover ingredient and packaging costs.
                </p>
                <div className="pt-2 border-t border-amber-200/60 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span>Order Total:</span>
                    <span className="font-bold">₹{totalAmount}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Kitchen Prep Deduction (50%):</span>
                    <span className="font-bold">-₹{prepDeduction}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-extrabold text-xs pt-1 border-t border-amber-200/80">
                    <span>Net Refund to You:</span>
                    <span>₹{prepRefund}</span>
                  </div>
                </div>

                <label className="flex items-start gap-2 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmDeduction}
                    onChange={(e) => setConfirmDeduction(e.target.checked)}
                    className="mt-0.5 rounded text-[#064E3B] focus:ring-[#064E3B]"
                  />
                  <span className="text-[11px] font-bold text-slate-700">
                    I understand and confirm the 50% food prep deduction (₹{prepDeduction}).
                  </span>
                </label>
              </div>
            )}

            {/* Select Reason */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Reason for cancellation:</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#064E3B]"
              >
                <option value="Changed my mind">Changed my mind</option>
                <option value="Ordered by mistake">Ordered by mistake</option>
                <option value="Delivery time is too long">Delivery time is too long</option>
                <option value="Incorrect delivery address selected">Incorrect delivery address selected</option>
                <option value="Placed duplicate order">Placed duplicate order</option>
                <option value="Other">Other reason</option>
              </select>
            </div>

            {cancelError && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs border border-red-200">
                {cancelError}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Keep My Order
              </button>
              <button
                type="button"
                disabled={cancelling || (isPreparingOrReady && !confirmDeduction)}
                onClick={handleCancelOrder}
                className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold text-white shadow-sm cursor-pointer transition-colors ${
                  isPreparingOrReady && !confirmDeduction
                    ? 'bg-slate-300 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {cancelling ? 'Cancelling...' : isPreparingOrReady ? `Cancel & Refund ₹${prepRefund}` : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
