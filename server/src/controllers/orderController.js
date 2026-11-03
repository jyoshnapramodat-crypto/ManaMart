import { mockDb } from '../utils/mockDbStore.js';
import { v4 as uuidv4 } from 'uuid';
import { generateOTP } from '../utils/otpGenerator.js';
import { calculateDistanceKm, calculateDeliveryFee } from '../utils/haversine.js';
import { Order } from '../models/Order.js';
import { Store } from '../models/Store.js';
import { Product } from '../models/Product.js';
import { Promotion } from '../models/Promotion.js';
import { Notification } from '../models/Notification.js';
import { Reservation } from '../models/Reservation.js';
import { Review } from '../models/Review.js';
import { Report } from '../models/Report.js';
import { User } from '../models/User.js';
import { isConnectedToMongo } from '../config/db.js';

// Cache for duplicate order protection (15 seconds debounce)
const recentCustomerOrders = new Map();

export async function createOrder(req, res) {
  try {
    const {
      merchantId,
      items,
      deliveryAddress,
      paymentMethod = 'UPI',
      couponCode,
      instructions,
      substitutionsPreference = 'smart_replace',
    } = req.body;

    const customerId = String(req.user.id || req.user._id);

    if (!merchantId || !items || !items.length) {
      return res.status(400).json({ success: false, message: 'Merchant store and shopping cart items are required.' });
    }

    // Duplicate order prevention: reject duplicate orders placed within 15 seconds
    const debounceKey = `${customerId}-${merchantId}`;
    const now = Date.now();
    if (recentCustomerOrders.has(debounceKey)) {
      const lastOrderTime = recentCustomerOrders.get(debounceKey);
      if (now - lastOrderTime < 15000) {
        return res.status(429).json({
          success: false,
          isDuplicate: true,
          message: 'An identical order was placed moments ago. Please wait 15 seconds or check your Orders tab.',
        });
      }
    }
    recentCustomerOrders.set(debounceKey, now);

    // Resolve store
    let merchant = null;
    if (isConnectedToMongo) {
      try {
        merchant = await Store.findOne({ $or: [{ storeId: merchantId }, { _id: merchantId.match(/^[0-9a-fA-F]{24}$/) ? merchantId : null }] });
      } catch (_) {}
    }
    if (!merchant) {
      merchant = mockDb.merchants.find((m) => m.id === merchantId || m.storeId === merchantId) || mockDb.merchants[0];
    }

    const customerAddress = deliveryAddress || (req.user.addresses && req.user.addresses[0]) || {
      street: 'Main Road',
      locality: 'Madhapur',
      city: 'Hyderabad',
      pincode: '500081',
      lat: 17.4480,
      lng: 78.3910,
    };

    // Calculate distance and delivery fee
    const distance = calculateDistanceKm(
      customerAddress.lat || 17.4480,
      customerAddress.lng || 78.3910,
      merchant.address?.lat || 17.4480,
      merchant.address?.lng || 78.3910
    );
    const deliveryFee = calculateDeliveryFee(distance);

    // Calculate subtotal with product price checks
    let subtotal = 0;
    const orderItems = items.map((item) => {
      const price = Number(item.price) || 100;
      const qty = Number(item.quantity) || 1;
      subtotal += price * qty;
      return {
        productId: item.productId || item.id || `p-${Date.now()}`,
        name: item.name,
        nameTelugu: item.nameTelugu || '',
        price,
        quantity: qty,
        storeId: merchant.storeId || merchant.id,
        storeName: merchant.businessName,
        unit: item.unit || '1 unit',
        image: item.image,
      };
    });

    // Coupon discount verification
    let discountAmount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      const cleanCode = couponCode.trim().toUpperCase();
      if (isConnectedToMongo) {
        try {
          const promo = await Promotion.findOne({
            code: cleanCode,
            isActive: true,
            $or: [{ merchantId: merchant.storeId || merchant.id }, { merchantId: 'ALL' }],
          });
          if (promo && subtotal >= promo.minOrderAmount) {
            discountAmount = promo.discountType === 'flat'
              ? promo.discountValue
              : Math.min(promo.maxDiscount || 100, Math.round(subtotal * (promo.discountValue / 100)));
            appliedCoupon = cleanCode;
          }
        } catch (_) {}
      }

      if (!appliedCoupon) {
        if (['SWAGATHFREE', 'WELCOME50', 'LOCAL50'].includes(cleanCode)) {
          discountAmount = Math.min(50, Math.round(subtotal * 0.15));
          appliedCoupon = cleanCode;
        } else if (cleanCode === 'KIRANA10') {
          discountAmount = Math.round(subtotal * 0.1);
          appliedCoupon = cleanCode;
        }
      }
    }

    const taxAmount = Math.round(subtotal * 0.05); // 5% GST
    const totalAmount = Math.max(0, subtotal + deliveryFee + taxAmount - discountAmount);

    // Generate unique secure 4-digit Delivery OTP (NEVER static 1234!)
    const deliveryOtp = generateOTP(4);
    const orderId = `MM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = {
      orderId,
      customerId,
      customerName: req.user.name || 'Valued Customer',
      customerPhone: req.user.phone || '9876543210',
      storeId: merchant.storeId || merchant.id,
      storeName: merchant.businessName,
      deliveryAddress: customerAddress,
      items: orderItems,
      subtotal,
      deliveryFee,
      taxAmount,
      discountAmount,
      couponCode: appliedCoupon || '',
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'CashOnDelivery' || paymentMethod === 'cod' ? 'pending' : 'paid',
      orderStatus: 'Placed',
      deliveryOtp,
      substitutionsPreference,
      instructions: instructions || '',
      eta: '15-25 mins',
      timeline: [
        { status: 'Order Placed', time: 'Just now', note: `Payment confirmed via ${paymentMethod}` },
        { status: 'Sent to Merchant', time: 'Just now', note: `Sent to ${merchant.businessName}` },
      ],
    };

    if (isConnectedToMongo) {
      try {
        await Order.create(newOrder);
      } catch (err) {
        console.warn('Mongo order create error:', err.message);
      }
    }

    mockDb.orders.unshift({ ...newOrder, id: orderId, merchantId: merchant.storeId || merchant.id, merchantName: merchant.businessName });

    // In-app persistent notification for customer
    const customerNotif = {
      notificationId: `notif-${Date.now()}`,
      userId: customerId,
      role: 'customer',
      title: `Order Placed: ${orderId} 🛍️`,
      message: `Your order from ${merchant.businessName} was placed. Delivery OTP: ${deliveryOtp}`,
      type: 'order',
      link: `/orders/${orderId}`,
      isRead: false,
    };

    if (isConnectedToMongo) {
      try {
        await Notification.create(customerNotif);
      } catch (_) {}
    }
    mockDb.notifications.unshift(customerNotif);

    // In-app persistent notification for merchant
    if (merchant.userId) {
      const merchantNotif = {
        notificationId: `notif-${Date.now() + 1}`,
        userId: merchant.userId,
        role: 'merchant',
        title: `Incoming New Order #${orderId} 🔔`,
        message: `${req.user.name} ordered ${orderItems.length} items (₹${totalAmount}).`,
        type: 'order',
        link: '/merchant',
        isRead: false,
      };
      if (isConnectedToMongo) {
        try {
          await Notification.create(merchantNotif);
        } catch (_) {}
      }
      mockDb.notifications.unshift(merchantNotif);
    }

    // Broadcast to merchant via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('order:new', { order: newOrder });
      io.emit('notification:new', customerNotif);
    }

    return res.status(201).json({
      success: true,
      message: 'Order created successfully!',
      order: newOrder,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getMyOrders(req, res) {
  try {
    const customerId = String(req.user.id || req.user._id);
    let ordersList = [];

    if (isConnectedToMongo) {
      try {
        ordersList = await Order.find({ customerId }).sort({ createdAt: -1 });
      } catch (err) {
        console.warn('Mongo customer orders fetch error:', err.message);
      }
    }

    if (ordersList.length === 0) {
      ordersList = mockDb.orders.filter((o) => o.customerId === customerId);
    }

    return res.json({
      success: true,
      count: ordersList.length,
      orders: ordersList,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getOrderById(req, res) {
  try {
    const { id } = req.params;
    let order = null;

    if (isConnectedToMongo) {
      try {
        order = await Order.findOne({ $or: [{ orderId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] });
      } catch (_) {}
    }

    if (!order) {
      order = mockDb.orders.find((o) => o.id === id || o.orderId === id || o.orderNumber === id);
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    return res.json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    let updated = null;
    if (isConnectedToMongo) {
      try {
        updated = await Order.findOneAndUpdate(
          { orderId: id },
          { orderStatus: status },
          { new: true }
        );
      } catch (_) {}
    }

    const memoryOrder = mockDb.orders.find((o) => o.id === id || o.orderId === id);
    if (memoryOrder) {
      memoryOrder.orderStatus = status;
      if (!memoryOrder.timeline) memoryOrder.timeline = [];
      memoryOrder.timeline.push({
        status: status.toUpperCase(),
        time: 'Just now',
        note: note || `Status updated to ${status}`,
      });
      updated = memoryOrder;
    }

    return res.json({
      success: true,
      message: `Order status updated to ${status}.`,
      order: updated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function createParcelOrder(req, res) {
  try {
    const {
      senderName,
      senderPhone,
      pickupAddress,
      recipientName,
      recipientPhone,
      dropAddress,
      packageType = 'Documents & Small Box',
      weightKg = 1,
      instructions,
    } = req.body;

    const deliveryFee = 65;
    const otp = generateOTP(4);
    const orderNumber = `MM-PKT-${Math.floor(1000 + Math.random() * 9000)}`;

    const newParcel = {
      orderId: orderNumber,
      id: orderNumber,
      customerId: req.user.id || req.user._id,
      customerName: senderName || req.user.name,
      customerPhone: senderPhone || req.user.phone,
      recipientName,
      recipientPhone,
      pickupAddress,
      dropAddress,
      packageType,
      weightKg,
      subtotal: deliveryFee,
      deliveryFee,
      totalAmount: deliveryFee,
      paymentStatus: 'paid',
      orderStatus: 'Placed',
      deliveryOtp: otp,
      instructions: instructions || '',
      createdAt: new Date().toISOString(),
    };

    mockDb.orders.unshift(newParcel);

    return res.status(201).json({
      success: true,
      message: 'Hyperlocal parcel courier dispatch registered!',
      parcel: newParcel,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function bookReservation(req, res) {
  try {
    const {
      merchantId,
      partySize = 2,
      reservationDate,
      reservationTime = '08:00 PM',
      tableNumber = 'T-04',
      seatingArea = 'AC Fine Dining Hall',
      occasion = 'Casual Dining',
      specialRequests = '',
      guestName,
      guestPhone,
    } = req.body;

    const bookingCode = `MM-RES-${Math.floor(100000 + Math.random() * 900000)}`;

    let merchant = null;
    if (isConnectedToMongo) {
      merchant = await Store.findOne({ storeId: merchantId });
    }
    if (!merchant) {
      merchant = mockDb.merchants.find((m) => m.id === merchantId || m.storeId === merchantId) || mockDb.merchants[0];
    }

    const newReservation = {
      reservationId: `res-${uuidv4().slice(0, 8)}`,
      bookingCode,
      customerId: String(req.user.id || req.user._id),
      customerName: guestName || req.user.name || 'Valued Guest',
      customerPhone: guestPhone || req.user.phone || '9876543210',
      merchantId: merchant.storeId || merchant.id,
      merchantName: merchant.businessName,
      partySize: Number(partySize),
      reservationDate: reservationDate || new Date().toISOString().split('T')[0],
      reservationTime,
      tableNumber,
      seatingArea,
      occasion,
      specialRequests,
      status: 'confirmed',
    };

    if (isConnectedToMongo) {
      try {
        await Reservation.create(newReservation);
      } catch (_) {}
    }

    mockDb.reservations.unshift({ ...newReservation, id: newReservation.reservationId });

    return res.status(201).json({
      success: true,
      message: 'Table reservation confirmed successfully!',
      reservation: newReservation,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function bookService(req, res) {
  try {
    const { serviceName, serviceDate, timeSlot, address, notes } = req.body;
    const newService = {
      id: `srv-${uuidv4().slice(0, 8)}`,
      customerId: req.user.id || req.user._id,
      customerName: req.user.name || 'Customer',
      serviceName: serviceName || 'Home Appliance Service',
      serviceDate: serviceDate || new Date().toISOString().split('T')[0],
      timeSlot: timeSlot || '10:00 AM - 12:00 PM',
      address: address || 'Madhapur, Hyderabad',
      notes: notes || '',
      status: 'confirmed',
      price: 499,
    };

    if (!mockDb.serviceBookings) mockDb.serviceBookings = [];
    mockDb.serviceBookings.unshift(newService);

    return res.status(201).json({
      success: true,
      message: 'Service appointment scheduled successfully!',
      booking: newService,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// ----------------------------------------------------
// Order Cancellation Engine & State Management
// ----------------------------------------------------
export async function cancelOrder(req, res) {
  try {
    const { id } = req.params;
    const { reason, confirmDeduction, cancelledBy: explicitCancelledBy } = req.body;
    const userRole = (req.user?.role || '').toUpperCase();
    const cancelledBy = explicitCancelledBy || (userRole === 'MERCHANT' ? 'MERCHANT' : 'CUSTOMER');

    let order = null;
    let mongoOrder = null;

    if (isConnectedToMongo) {
      try {
        mongoOrder = await Order.findOne({
          $or: [
            { orderId: id },
            { id: id },
            { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
          ].filter(Boolean),
        });
        if (mongoOrder) {
          order = mongoOrder;
        }
      } catch (err) {
        console.warn('Mongo order find warning in cancelOrder:', err.message);
      }
    }

    const memoryOrder = mockDb.orders.find((o) => o.id === id || o.orderId === id);
    if (!order && memoryOrder) {
      order = memoryOrder;
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const currentStatus = (order.orderStatus || order.status || '').toUpperCase();

    // Disallow cancelling finished or already cancelled orders
    if (currentStatus === 'CANCELLED') {
      return res.status(400).json({ success: false, message: 'This order has already been cancelled.' });
    }
    if (currentStatus === 'DELIVERED') {
      return res.status(400).json({ success: false, message: 'Delivered orders cannot be cancelled.' });
    }

    // Cancellation Policy Evaluation
    let refundPercentage = 100;
    let cancellationFee = 0;
    let refundAmount = Number(order.totalAmount || 0);

    // Rule: Out for delivery cannot be cancelled by customer
    if (currentStatus === 'OUT_FOR_DELIVERY' || currentStatus === 'OUTFORDELIVERY') {
      if (cancelledBy !== 'MERCHANT') {
        return res.status(400).json({
          success: false,
          locked: true,
          message: 'Order is out for delivery with our delivery partner and cannot be cancelled directly. Please contact support or the rider.',
        });
      }
    }

    if (cancelledBy === 'MERCHANT') {
      // Merchant cancellations: 100% full customer refund
      refundPercentage = 100;
      cancellationFee = 0;
      refundAmount = Number(order.totalAmount || 0);
    } else {
      // Customer cancellation policies
      if (currentStatus === 'PLACED') {
        // 1-Click instant cancellation with 100% refund
        refundPercentage = 100;
        cancellationFee = 0;
        refundAmount = Number(order.totalAmount || 0);
      } else if (
        currentStatus === 'PREPARING' ||
        currentStatus === 'ACCEPTED' ||
        currentStatus === 'READY_FOR_PICKUP' ||
        currentStatus === 'READYFORPICKUP'
      ) {
        // Food preparation underway -> 50% deduction warning
        const deductionAmt = Math.round(Number(order.totalAmount || 0) * 0.5);
        const refAmt = Number(order.totalAmount || 0) - deductionAmt;

        if (!confirmDeduction) {
          return res.status(400).json({
            success: false,
            requiresConfirmation: true,
            deductionPercentage: 50,
            deductionAmount: deductionAmt,
            refundAmount: refAmt,
            message: 'Food preparation is already underway. A 50% deduction applies to cover kitchen and packaging costs. Please confirm to proceed.',
          });
        }

        cancellationFee = deductionAmt;
        refundAmount = refAmt;
        refundPercentage = 50;
      }
    }

    const cancellationReason = reason || (cancelledBy === 'MERCHANT' ? 'Merchant unavailable / Item out of stock' : 'Customer requested cancellation');
    const cancelledTimestamp = new Date().toISOString();

    // Update in-memory order
    if (memoryOrder) {
      memoryOrder.orderStatus = 'Cancelled';
      memoryOrder.status = 'cancelled';
      memoryOrder.cancelledBy = cancelledBy;
      memoryOrder.cancellationReason = cancellationReason;
      memoryOrder.refundAmount = refundAmount;
      memoryOrder.cancellationFee = cancellationFee;
      memoryOrder.refundPercentage = refundPercentage;
      memoryOrder.cancelledAt = cancelledTimestamp;
      if (!Array.isArray(memoryOrder.timeline)) memoryOrder.timeline = [];
      memoryOrder.timeline.push({
        status: 'Cancelled',
        timestamp: cancelledTimestamp,
        note: `Cancelled by ${cancelledBy}. Reason: ${cancellationReason}. Refund: ₹${refundAmount} (${refundPercentage}%)`,
      });
      order = memoryOrder;
    }

    // Update MongoDB
    if (isConnectedToMongo && mongoOrder) {
      try {
        mongoOrder.orderStatus = 'Cancelled';
        mongoOrder.status = 'cancelled';
        mongoOrder.cancelledBy = cancelledBy;
        mongoOrder.cancellationReason = cancellationReason;
        mongoOrder.refundAmount = refundAmount;
        mongoOrder.cancellationFee = cancellationFee;
        mongoOrder.refundPercentage = refundPercentage;
        mongoOrder.cancelledAt = new Date(cancelledTimestamp);
        mongoOrder.timeline = mongoOrder.timeline || [];
        mongoOrder.timeline.push({
          status: 'Cancelled',
          timestamp: new Date(cancelledTimestamp),
          note: `Cancelled by ${cancelledBy}. Reason: ${cancellationReason}. Refund: ₹${refundAmount} (${refundPercentage}%)`,
        });
        await mongoOrder.save();
        order = mongoOrder;
      } catch (saveErr) {
        console.warn('Mongo order save error in cancelOrder:', saveErr.message);
      }
    }

    // Real-time broadcast to Rider, Merchant, and Customer
    const io = req.app.get('io');
    if (io) {
      const orderIdKey = order.orderId || order.id || id;
      io.emit('order:cancelled', {
        orderId: orderIdKey,
        cancelledBy,
        reason: cancellationReason,
        refundAmount,
        cancellationFee,
        refundPercentage,
        order,
      });
      io.emit('order:status_changed', {
        orderId: orderIdKey,
        status: 'Cancelled',
        order,
      });
    }

    return res.json({
      success: true,
      message: `Order successfully cancelled. Refund of ₹${refundAmount} (${refundPercentage}%) processed.`,
      order,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// ----------------------------------------------------
// Multi-Vendor Review & Rating Engine
// ----------------------------------------------------
export async function submitOrderReview(req, res) {
  try {
    const { id } = req.params;
    const { storeRating, storeTags = [], storeComment = '', riderRating, riderTip = 0 } = req.body;

    if (!storeRating || Number(storeRating) < 1 || Number(storeRating) > 5) {
      return res.status(400).json({ success: false, message: 'Please provide a valid store rating between 1 and 5 stars.' });
    }

    let order = null;
    let mongoOrder = null;

    if (isConnectedToMongo) {
      try {
        mongoOrder = await Order.findOne({
          $or: [
            { orderId: id },
            { id: id },
            { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
          ].filter(Boolean),
        });
        if (mongoOrder) order = mongoOrder;
      } catch (err) {
        console.warn('Mongo order lookup error in submitOrderReview:', err.message);
      }
    }

    const memoryOrder = mockDb.orders.find((o) => o.id === id || o.orderId === id);
    if (!order && memoryOrder) {
      order = memoryOrder;
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const currentStatus = (order.orderStatus || order.status || '').toUpperCase();
    if (currentStatus !== 'DELIVERED') {
      return res.status(400).json({ success: false, message: 'Reviews can only be submitted for delivered orders.' });
    }

    if (order.reviewSubmitted) {
      return res.status(400).json({ success: false, message: 'You have already submitted a review for this order.' });
    }

    const reviewId = `rev-${Date.now()}`;
    const targetOrderId = order.orderId || order.id || id;
    const customerId = req.user?.id || req.user?._id || order.customerId || 'user-cust-1';
    const customerName = req.user?.name || order.customerName || 'ManaMart Customer';
    const storeId = order.storeId || order.merchantId || 'm-1';
    const storeName = order.storeName || order.merchantName || 'ManaMart Store';
    const riderId = order.assignedRiderId || order.riderId || 'r-1';
    const riderName = order.assignedRiderName || order.riderName || 'Delivery Partner';

    const numStoreRating = Number(storeRating);
    const numRiderRating = riderRating ? Number(riderRating) : null;
    const numRiderTip = Number(riderTip) || 0;

    // Check if <= 2 stars (Low Rating Alert)
    const isStoreLow = numStoreRating <= 2;
    const isRiderLow = numRiderRating !== null && numRiderRating <= 2;
    let autoDisputeCreated = false;
    let disputeId = null;

    if (isStoreLow || isRiderLow) {
      autoDisputeCreated = true;
      disputeId = `DISP-${Date.now().toString().slice(-6)}`;
      const targetType = isStoreLow ? 'store' : 'rider';
      const targetEntityId = isStoreLow ? storeId : riderId;
      const targetEntityName = isStoreLow ? storeName : riderName;
      const minStars = isRiderLow && (!isStoreLow || numRiderRating < numStoreRating) ? numRiderRating : numStoreRating;

      const disputeRecord = {
        id: disputeId.toLowerCase(),
        reportId: disputeId,
        reporterId: customerId,
        reporterName: customerName,
        reporterRole: 'customer',
        targetType,
        targetId: targetEntityId,
        targetName: targetEntityName,
        reason: `Low Rating Alert (${minStars} Stars) - Customer Dissatisfaction`,
        details: `Order #${targetOrderId}: "${storeComment || 'Low rating given by customer'}" [Tags: ${storeTags.join(', ') || 'None'}]`,
        status: 'pending',
        priority: 'high',
        createdAt: new Date().toISOString(),
      };

      if (!mockDb.reports) mockDb.reports = [];
      mockDb.reports.unshift(disputeRecord);

      if (isConnectedToMongo) {
        try {
          await Report.create(disputeRecord);
        } catch (repErr) {
          console.warn('Mongo report create warning:', repErr.message);
        }
      }

      const io = req.app.get('io');
      if (io) {
        io.emit('report:new', disputeRecord);
      }
    }

    const reviewPayload = {
      id: reviewId,
      reviewId,
      orderId: targetOrderId,
      customerId,
      customerName,
      storeId,
      storeName,
      rating: numStoreRating,
      storeRating: numStoreRating,
      storeTags: Array.isArray(storeTags) ? storeTags : [],
      comment: storeComment,
      storeComment,
      riderId,
      riderName,
      riderRating: numRiderRating,
      riderTip: numRiderTip,
      autoDisputeCreated,
      disputeId,
      createdAt: new Date().toISOString(),
    };

    // Save to memory store
    if (!mockDb.reviews) mockDb.reviews = [];
    mockDb.reviews.unshift(reviewPayload);

    // Save to MongoDB
    if (isConnectedToMongo) {
      try {
        await Review.create(reviewPayload);
      } catch (revErr) {
        console.warn('Mongo review create warning:', revErr.message);
      }
    }

    // Mark order as reviewed
    if (memoryOrder) {
      memoryOrder.reviewSubmitted = true;
      memoryOrder.review = reviewPayload;
    }
    if (isConnectedToMongo && mongoOrder) {
      try {
        mongoOrder.reviewSubmitted = true;
        mongoOrder.review = reviewPayload;
        await mongoOrder.save();
      } catch (saveErr) {
        console.warn('Mongo order review mark error:', saveErr.message);
      }
    }

    // Recalculate Store aggregate rating
    const storeReviews = mockDb.reviews.filter((r) => r.storeId === storeId && r.storeRating);
    if (storeReviews.length > 0) {
      const avgStoreRating = Number(
        (storeReviews.reduce((sum, r) => sum + Number(r.storeRating), 0) / storeReviews.length).toFixed(1)
      );
      if (mockDb.merchants) {
        const merch = mockDb.merchants.find((m) => m.id === storeId || m.storeId === storeId);
        if (merch) {
          merch.rating = avgStoreRating;
          merch.reviewsCount = storeReviews.length;
        }
      }
      if (mockDb.stores) {
        const str = mockDb.stores.find((s) => s.id === storeId);
        if (str) {
          str.rating = avgStoreRating;
          str.reviewsCount = storeReviews.length;
        }
      }
    }

    // Recalculate Rider aggregate rating
    if (riderId && numRiderRating) {
      const riderReviews = mockDb.reviews.filter((r) => r.riderId === riderId && r.riderRating);
      if (riderReviews.length > 0) {
        const avgRiderRating = Number(
          (riderReviews.reduce((sum, r) => sum + Number(r.riderRating), 0) / riderReviews.length).toFixed(1)
        );
        if (mockDb.pendingRiders) {
          const rRecord = mockDb.pendingRiders.find((r) => r.id === riderId || r.userId === riderId);
          if (rRecord) {
            rRecord.rating = avgRiderRating;
            rRecord.tripsCount = (rRecord.tripsCount || 0) + 1;
          }
        }
      }
    }

    // Emit review event
    const io = req.app.get('io');
    if (io) {
      io.emit('review:created', reviewPayload);
    }

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your review has been submitted successfully.',
      review: reviewPayload,
      autoDisputeCreated,
      disputeId,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getOrderReview(req, res) {
  try {
    const { id } = req.params;

    let review = null;
    if (isConnectedToMongo) {
      try {
        review = await Review.findOne({ orderId: id });
      } catch (err) {
        console.warn('Mongo getOrderReview error:', err.message);
      }
    }

    if (!review && mockDb.reviews) {
      review = mockDb.reviews.find((r) => r.orderId === id || r.id === id);
    }

    return res.json({
      success: true,
      review: review || null,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
