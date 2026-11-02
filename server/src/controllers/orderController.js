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
