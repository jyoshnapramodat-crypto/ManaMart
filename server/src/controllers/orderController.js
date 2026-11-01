import { mockDb } from '../utils/mockDbStore.js';
import { v4 as uuidv4 } from 'uuid';
import { generateOTP } from '../utils/otpGenerator.js';
import { calculateDistanceKm, calculateDeliveryFee } from '../utils/haversine.js';

export async function createOrder(req, res) {
  try {
    const {
      merchantId,
      items,
      deliveryAddress,
      paymentMethod = 'upi',
      couponCode,
      instructions,
    } = req.body;

    const customerId = req.user.id;

    if (!merchantId || !items || !items.length) {
      return res.status(400).json({ success: false, message: 'Merchant and items are required.' });
    }

    const merchant = mockDb.merchants.find((m) => m.id === merchantId) || mockDb.merchants[0];
    const customerAddress = deliveryAddress || (req.user.addresses && req.user.addresses[0]) || {
      street: '100 Feet Road',
      locality: 'Madhapur',
      city: 'Hyderabad',
      lat: 17.4480,
      lng: 78.3910,
    };

    // Calculate distance and delivery fee
    const distance = calculateDistanceKm(
      customerAddress.lat || 17.4480,
      customerAddress.lng || 78.3910,
      merchant.address.lat,
      merchant.address.lng
    );
    const deliveryFee = calculateDeliveryFee(distance);

    // Calculate subtotal
    let subtotal = 0;
    const orderItems = items.map((item) => {
      const prod = mockDb.products.find((p) => p.id === item.productId || p.id === item.id);
      const price = prod ? prod.price : item.price || 100;
      const qty = item.quantity || 1;
      subtotal += price * qty;
      return {
        productId: prod ? prod.id : item.productId,
        name: prod ? prod.name : item.name,
        price,
        quantity: qty,
        unit: prod ? prod.unit : 'item',
        isVeg: prod ? prod.isVeg : true,
      };
    });

    // Discount calculations
    let discount = 0;
    if (couponCode) {
      const upperCoupon = couponCode.toUpperCase();
      if (upperCoupon === 'SWAGATHFREE' || upperCoupon === 'WELCOME50' || upperCoupon === 'LOCAL50') {
        discount = Math.min(50, Math.round(subtotal * 0.15));
      } else if (upperCoupon === 'KIRANA10') {
        discount = Math.round(subtotal * 0.1);
      }
    }

    const taxesAndCharges = Math.round(subtotal * 0.05); // 5% GST
    const totalAmount = Math.max(0, subtotal + deliveryFee + taxesAndCharges - discount);

    // Generate unique 4-digit Delivery OTP
    const deliveryOtp = generateOTP(4);
    const orderNumber = `MM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = {
      id: `ord-${uuidv4().slice(0, 8)}`,
      orderNumber,
      customerId,
      customerName: req.user.name || 'Valued Customer',
      customerPhone: req.user.phone || '9876543210',
      merchantId: merchant.id,
      merchantName: merchant.businessName,
      merchantAddress: merchant.address.street,
      merchantCoordinates: { lat: merchant.address.lat, lng: merchant.address.lng },
      riderId: 'r-1',
      riderName: 'Suresh Varma',
      riderPhone: '9123456780',
      riderCoordinates: { lat: merchant.address.lat + 0.002, lng: merchant.address.lng + 0.002 },
      items: orderItems,
      subtotal,
      deliveryFee,
      taxesAndCharges,
      discount,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      orderStatus: 'confirmed', // confirmed immediately
      deliveryOtp,
      deliveryAddress: customerAddress,
      instructions: instructions || '',
      createdAt: new Date().toISOString(),
      timeline: [
        { status: 'Order Placed', time: 'Just now', note: `Payment confirmed via ${paymentMethod.toUpperCase()}` },
        { status: 'Sent to Merchant', time: 'Just now', note: `Order received at ${merchant.businessName}` },
      ],
    };

    mockDb.orders.unshift(newOrder);

    // Send in-app notification to customer
    mockDb.notifications.unshift({
      id: `notif-${uuidv4().slice(0, 8)}`,
      userId: customerId,
      title: `Order Confirmed: ${orderNumber} 🎉`,
      message: `Your order from ${merchant.businessName} has been received. Delivery OTP: ${deliveryOtp}`,
      type: 'order',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

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
    const customerId = req.user.id;
    const orders = mockDb.orders.filter((o) => o.customerId === customerId);
    return res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getOrderById(req, res) {
  try {
    const { id } = req.params;
    const order = mockDb.orders.find((o) => o.id === id || o.orderNumber === id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    return res.json({
      success: true,
      order,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const order = mockDb.orders.find((o) => o.id === id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    order.orderStatus = status;
    order.timeline.push({
      status: status.replace(/_/g, ' ').toUpperCase(),
      time: 'Just now',
      note: note || `Status updated to ${status}`,
    });

    return res.json({
      success: true,
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Hyperlocal Parcel Booking
export async function createParcelOrder(req, res) {
  try {
    const {
      senderName,
      senderPhone,
      pickupAddress,
      recipientName,
      recipientPhone,
      dropAddress,
      packageType,
      weightKg,
      instructions,
    } = req.body;

    const distance = 4.2; // estimated km
    const deliveryFee = calculateDeliveryFee(distance) + 20; // parcel base
    const otp = generateOTP(4);
    const orderNumber = `MM-PKT-${Math.floor(1000 + Math.random() * 9000)}`;

    const newParcel = {
      id: `parcel-${uuidv4().slice(0, 8)}`,
      orderNumber,
      customerId: req.user.id,
      customerName: senderName || req.user.name,
      customerPhone: senderPhone || req.user.phone,
      recipientName,
      recipientPhone,
      pickupAddress,
      dropAddress,
      packageType: packageType || 'Documents & Small Box',
      weightKg: weightKg || 1,
      subtotal: deliveryFee,
      deliveryFee,
      totalAmount: deliveryFee,
      paymentStatus: 'paid',
      orderStatus: 'confirmed',
      deliveryOtp: otp,
      instructions,
      createdAt: new Date().toISOString(),
      timeline: [
        { status: 'Parcel Registered', time: 'Just now', note: 'Searching for nearest ManaMart delivery partner' },
        { status: 'Rider Assigned', time: 'Just now', note: 'Rider Suresh assigned for pickup' },
      ],
    };

    mockDb.orders.unshift(newParcel);

    return res.status(201).json({
      success: true,
      message: 'Parcel delivery request placed!',
      parcel: newParcel,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Restaurant Table Reservation (BookMyShow-style Dine-In Pass)
export async function bookReservation(req, res) {
  try {
    const {
      merchantId,
      partySize,
      reservationDate,
      reservationTime,
      tableNumber,
      seatingArea,
      occasion,
      specialRequests,
      guestName,
      guestPhone,
      preOrderedItems,
    } = req.body;

    const merchant = mockDb.merchants.find((m) => m.id === merchantId) || mockDb.merchants[0];
    const bookingCode = `MM-RES-${Math.floor(100000 + Math.random() * 900000)}`;

    const newReservation = {
      id: `res-${uuidv4().slice(0, 8)}`,
      bookingCode,
      customerId: req.user.id,
      customerName: guestName || req.user.name || 'Valued Guest',
      customerPhone: guestPhone || req.user.phone || '9876543210',
      merchantId: merchant.id,
      merchantName: merchant.businessName,
      merchantAddress: merchant.address || 'Road No. 36, Madhapur, Hyderabad',
      partySize: Number(partySize) || 2,
      reservationDate: reservationDate || new Date().toISOString().split('T')[0],
      reservationTime: reservationTime || '08:00 PM',
      tableNumber: tableNumber || 'T-04',
      seatingArea: seatingArea || 'AC Fine Dining Hall',
      occasion: occasion || 'Casual Dining',
      specialRequests: specialRequests || '',
      preOrderedItems: preOrderedItems || [],
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
        JSON.stringify({ code: bookingCode, store: merchant.businessName, guests: partySize })
      )}`,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    mockDb.reservations.unshift(newReservation);

    // Create persistent notification
    mockDb.notifications.unshift({
      id: `notif-${uuidv4().slice(0, 8)}`,
      userId: req.user.id,
      title: `Table Confirmed at ${merchant.businessName} 🍽️`,
      message: `Table ${newReservation.tableNumber} for ${newReservation.partySize} guests is booked for ${newReservation.reservationDate} at ${newReservation.reservationTime}. Ticket Pass: ${bookingCode}`,
      type: 'reservation',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    // Real-time Socket Broadcast
    const io = req.app.get('io');
    if (io) {
      io.emit('notification:new', {
        id: `notif-${uuidv4().slice(0, 8)}`,
        title: `Dine-In Booking Confirmed! 🎫`,
        message: `${newReservation.customerName} booked Table ${newReservation.tableNumber} at ${merchant.businessName}`,
        type: 'reservation',
        createdAt: new Date().toISOString(),
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Table reservation confirmed successfully!',
      reservation: newReservation,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Local Services & Appointments Booking
export async function bookService(req, res) {
  try {
    const { merchantId, serviceName, serviceDate, timeSlot, address, notes } = req.body;
    const newServiceBooking = {
      id: `srv-${uuidv4().slice(0, 8)}`,
      customerId: req.user.id,
      customerName: req.user.name || 'Customer',
      customerPhone: req.user.phone || '9876543210',
      merchantId: merchantId || 'm-6',
      serviceName: serviceName || 'Doorstep AC Deep Clean',
      serviceDate: serviceDate || new Date().toISOString().split('T')[0],
      timeSlot: timeSlot || '11:00 AM - 01:00 PM',
      price: 549,
      status: 'confirmed',
      address: address || 'Madhapur, Hyderabad',
      notes: notes || '',
      createdAt: new Date().toISOString(),
    };

    mockDb.serviceBookings.unshift(newServiceBooking);

    return res.status(201).json({
      success: true,
      message: 'Service appointment confirmed!',
      booking: newServiceBooking,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

