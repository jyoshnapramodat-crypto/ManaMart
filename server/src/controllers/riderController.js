import { mockDb } from '../utils/mockDbStore.js';
import { v4 as uuidv4 } from 'uuid';

export async function getRiderProfile(req, res) {
  try {
    const riderId = req.user.riderId || 'r-1';
    let rider = mockDb.riders.find((r) => r.id === riderId || r.userId === req.user.id);

    if (!rider) {
      rider = mockDb.riders[0];
    }

    // Active order assigned to this rider
    const activeOrder = mockDb.orders.find(
      (o) => o.riderId === rider.id && o.orderStatus !== 'delivered' && o.orderStatus !== 'cancelled'
    );

    return res.json({
      success: true,
      rider,
      activeOrder,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function toggleOnlineStatus(req, res) {
  try {
    const riderId = req.user.riderId || 'r-1';
    const rider = mockDb.riders.find((r) => r.id === riderId) || mockDb.riders[0];
    rider.isOnline = !rider.isOnline;

    return res.json({
      success: true,
      message: `Rider is now ${rider.isOnline ? 'ONLINE' : 'OFFLINE'}`,
      isOnline: rider.isOnline,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getNearbyTasks(req, res) {
  try {
    // Deliveries ready for pickup or searching for rider
    const availableTasks = mockDb.orders
      .filter((o) => o.orderStatus === 'confirmed' || o.orderStatus === 'preparing' || o.orderStatus === 'ready_for_pickup')
      .map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        merchantName: o.merchantName,
        merchantAddress: o.merchantAddress,
        deliveryAddress: o.deliveryAddress.street + ', ' + o.deliveryAddress.locality,
        distanceKm: 3.4,
        proposedPayout: Math.round((o.deliveryFee || 35) * 0.85) + 15, // Base payout to rider
        itemsCount: o.items ? o.items.length : 1,
        orderStatus: o.orderStatus,
      }));

    return res.json({
      success: true,
      tasks: availableTasks,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function acceptTask(req, res) {
  try {
    const { id } = req.params;
    const riderId = req.user.riderId || 'r-1';
    const rider = mockDb.riders.find((r) => r.id === riderId) || mockDb.riders[0];

    const order = mockDb.orders.find((o) => o.id === id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order task not found.' });
    }

    order.riderId = rider.id;
    order.riderName = rider.name;
    order.riderPhone = rider.phone;
    order.orderStatus = 'out_for_delivery';
    order.timeline.push({
      status: 'RIDER ASSIGNED',
      time: 'Just now',
      note: `${rider.name} accepted delivery task on ${rider.vehicleName}`,
    });

    return res.json({
      success: true,
      message: 'Delivery task accepted! Navigate to merchant for pickup.',
      order,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function counterOfferTask(req, res) {
  try {
    const { id } = req.params;
    const { counterAmount, reason } = req.body;

    return res.json({
      success: true,
      message: `Counter-offer of ₹${counterAmount} submitted for merchant review.`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function verifyDeliveryOtp(req, res) {
  try {
    const { id } = req.params;
    const { otp } = req.body;

    const order = mockDb.orders.find((o) => o.id === id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Verify OTP against the order's generated OTP or demo 1234
    if (otp !== order.deliveryOtp && otp !== '1234') {
      return res.status(400).json({
        success: false,
        message: 'Invalid Delivery OTP. Please request customer to provide the 4-digit code from their ManaMart app.',
      });
    }

    order.orderStatus = 'delivered';
    order.paymentStatus = 'paid';
    order.timeline.push({
      status: 'DELIVERED',
      time: 'Just now',
      note: `Package handed over securely with verified OTP ${otp}`,
    });

    // Credit rider wallet
    const riderId = req.user.riderId || 'r-1';
    const rider = mockDb.riders.find((r) => r.id === riderId) || mockDb.riders[0];
    const payoutEarned = 55;
    rider.todayEarnings = (rider.todayEarnings || 0) + payoutEarned;
    rider.todayDeliveries = (rider.todayDeliveries || 0) + 1;
    rider.totalDeliveries = (rider.totalDeliveries || 0) + 1;

    // Send customer delivered notification
    mockDb.notifications.unshift({
      id: `notif-${uuidv4().slice(0, 8)}`,
      userId: order.customerId,
      title: `Order ${order.orderNumber} Delivered! 🥳`,
      message: 'Your neighborhood delivery has been completed. Enjoy your items!',
      type: 'order',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    return res.json({
      success: true,
      message: `Delivery successfully completed! ₹${payoutEarned} credited to your Rider Wallet.`,
      order,
      riderEarnings: rider.todayEarnings,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getRiderEarnings(req, res) {
  try {
    const riderId = req.user.riderId || 'r-1';
    const rider = mockDb.riders.find((r) => r.id === riderId) || mockDb.riders[0];

    const completedDeliveries = mockDb.orders.filter(
      (o) => o.riderId === rider.id && o.orderStatus === 'delivered'
    );

    return res.json({
      success: true,
      todayEarnings: rider.todayEarnings,
      todayDeliveries: rider.todayDeliveries,
      totalDeliveries: rider.totalDeliveries,
      rating: rider.rating,
      deliveries: completedDeliveries,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
