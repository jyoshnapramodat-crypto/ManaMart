import { mockDb } from '../utils/mockDbStore.js';
import { v4 as uuidv4 } from 'uuid';

export async function getPlatformStats(req, res) {
  try {
    const totalOrders = mockDb.orders.length;
    const gmv = mockDb.orders
      .filter((o) => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const platformCommission = Math.round(gmv * 0.08); // 8% average commission
    const activeMerchants = mockDb.merchants.filter((m) => m.verificationStatus === 'verified').length;
    const activeRiders = mockDb.riders.filter((r) => r.isOnline).length;
    const pendingVerifications = mockDb.pendingMerchants.length + mockDb.pendingRiders.length;

    return res.json({
      success: true,
      stats: {
        gmv,
        totalOrders,
        platformCommission,
        activeMerchants,
        activeRiders,
        pendingVerifications,
        activeZones: mockDb.cities.length,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getPendingMerchants(req, res) {
  try {
    return res.json({
      success: true,
      count: mockDb.pendingMerchants.length,
      merchants: mockDb.pendingMerchants,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function verifyMerchant(req, res) {
  try {
    const { id } = req.params;
    const { action, remarks } = req.body; // action: 'approve' | 'reject'

    const pendingIndex = mockDb.pendingMerchants.findIndex((m) => m.id === id);
    if (pendingIndex === -1) {
      return res.status(404).json({ success: false, message: 'Pending merchant record not found.' });
    }

    const pending = mockDb.pendingMerchants[pendingIndex];
    if (action === 'approve') {
      pending.status = 'verified';

      // Check if merchant exists in main list or create
      let merchant = mockDb.merchants.find((m) => m.phone === pending.phone || (pending.userId && m.userId === pending.userId));
      if (!merchant) {
        merchant = {
          id: `m-${uuidv4().slice(0, 8)}`,
          userId: pending.userId || `user-m-${uuidv4().slice(0, 6)}`,
          businessName: pending.businessName,
          category: pending.category,
          phone: pending.phone,
          email: pending.email || `${pending.businessName.toLowerCase().replace(/\s+/g, '')}@localloop.in`,
          address: pending.address || {
            street: `${pending.locality}, Main Road`,
            locality: pending.locality,
            city: pending.city,
            pincode: '520010',
            lat: 16.5062,
            lng: 80.6480,
          },
          rating: 4.8,
          totalRatings: 1,
          isOpen: true,
          openTime: pending.openTime || '08:00 AM',
          closeTime: pending.closeTime || '10:00 PM',
          deliveryRadiusKm: 7,
          verificationStatus: 'verified',
          fssaiLicense: pending.documents?.fssai || '',
          bannerImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80',
          logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80',
        };
        mockDb.merchants.push(merchant);
      } else {
        merchant.verificationStatus = 'verified';
        if (pending.userId) merchant.userId = pending.userId;
      }

      // Activate linked user account
      const linkedUser = mockDb.users.find((u) => u.phone === pending.phone || u.id === pending.userId);
      if (linkedUser) {
        linkedUser.role = 'merchant';
        linkedUser.status = 'active';
        linkedUser.merchantId = merchant.id;
      }

      mockDb.pendingMerchants.splice(pendingIndex, 1);
      return res.json({ success: true, message: `Merchant "${pending.businessName}" approved and verified!`, merchant });
    } else {
      pending.status = 'rejected';
      pending.rejectionRemarks = remarks || 'Missing required certifications or regulatory documentation.';
      return res.json({ success: true, message: `Merchant application rejected.`, pending });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getPendingRiders(req, res) {
  try {
    return res.json({
      success: true,
      count: mockDb.pendingRiders.length,
      riders: mockDb.pendingRiders,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function verifyRider(req, res) {
  try {
    const { id } = req.params;
    const { action } = req.body;

    const pendingIndex = mockDb.pendingRiders.findIndex((r) => r.id === id);
    if (pendingIndex === -1) {
      return res.status(404).json({ success: false, message: 'Pending rider record not found.' });
    }

    const pending = mockDb.pendingRiders[pendingIndex];
    if (action === 'approve') {
      const newRider = {
        id: `r-${uuidv4().slice(0, 8)}`,
        userId: pending.userId || `user-r-${uuidv4().slice(0, 6)}`,
        name: pending.name,
        phone: pending.phone,
        vehicleType: pending.vehicleType,
        vehicleName: pending.vehicleType === 'bicycle' ? 'Eco Bicycle' : 'Motorcycle',
        vehicleNumber: pending.vehicleNumber,
        isOnline: true,
        currentLocation: { lat: 17.4480, lng: 78.3910 },
        rating: 5.0,
        todayDeliveries: 0,
        todayEarnings: 0,
        totalDeliveries: 0,
        verificationStatus: 'verified',
        drivingLicenseNumber: pending.documents?.drivingLicense,
      };

      mockDb.riders.push(newRider);

      // Activate linked user account
      const linkedUser = mockDb.users.find((u) => u.phone === pending.phone || u.id === pending.userId);
      if (linkedUser) {
        linkedUser.role = 'rider';
        linkedUser.status = 'active';
        linkedUser.riderId = newRider.id;
      }

      mockDb.pendingRiders.splice(pendingIndex, 1);
      return res.json({ success: true, message: `Rider ${pending.name} approved to take orders!`, rider: newRider });
    } else {
      pending.status = 'rejected';
      pending.rejectionRemarks = remarks || 'Driving license or vehicle credentials mismatch.';
      return res.json({ success: true, message: `Rider application rejected.`, pending });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getAllOrders(req, res) {
  try {
    return res.json({
      success: true,
      count: mockDb.orders.length,
      orders: mockDb.orders,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function processRefund(req, res) {
  try {
    const { id } = req.params;
    const order = mockDb.orders.find((o) => o.id === id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    order.paymentStatus = 'refunded';
    order.orderStatus = 'cancelled';
    order.timeline.push({
      status: 'REFUND PROCESSED',
      time: 'Just now',
      note: `Platform Admin approved full refund of ₹${order.totalAmount} back to source method`,
    });

    return res.json({
      success: true,
      message: `Full refund of ₹${order.totalAmount} processed for order ${order.orderNumber}.`,
      order,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

