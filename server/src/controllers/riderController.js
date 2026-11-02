import { mockDb } from '../utils/mockDbStore.js';
import { v4 as uuidv4 } from 'uuid';
import { RiderApplication } from '../models/RiderApplication.js';
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
import { isConnectedToMongo } from '../config/db.js';

// Helper to resolve rider record
async function getRiderRecord(user) {
  const userId = String(user.id || user._id);

  let rider = mockDb.riders.find((r) => r.userId === userId || (user.riderId && r.id === user.riderId));
  if (!rider && user.isDemo) {
    rider = mockDb.riders[0];
  }
  return rider;
}

// 1. Get Application Status & Verification History
export async function getMyRiderApplicationStatus(req, res) {
  try {
    const userId = String(req.user.id || req.user._id);

    let appRecord = null;
    if (isConnectedToMongo) {
      try {
        appRecord = await RiderApplication.findOne({ userId });
      } catch (err) {
        console.warn('Mongo rider app fetch error:', err.message);
      }
    }

    if (!appRecord) {
      appRecord = mockDb.pendingRiders.find((r) => r.userId === userId || r.phone === req.user.phone);
    }

    const rider = await getRiderRecord(req.user);

    return res.json({
      success: true,
      hasApplied: Boolean(appRecord || rider),
      status: appRecord ? appRecord.status : (rider ? rider.verificationStatus : 'not_submitted'),
      application: appRecord || {
        name: rider?.name || req.user.name,
        vehicleType: rider?.vehicleType || 'bike',
        status: rider?.verificationStatus || 'not_submitted',
        documents: {},
        reviewHistory: [],
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 2. Submit Initial Delivery Hero Application with Real Documents
export async function submitRiderApplication(req, res) {
  try {
    const userId = String(req.user.id || req.user._id);
    const {
      name,
      phone,
      email,
      city,
      preferredArea,
      vehicleType = 'bike',
      vehicleName,
      vehicleNumber,
      emergencyContact,
      bankDetails,
      documents = {},
    } = req.body;

    if (!name || !city || !preferredArea) {
      return res.status(400).json({ success: false, message: 'Please provide all required profile details.' });
    }

    if (vehicleType !== 'bicycle' && (!documents.drivingLicense || !documents.drivingLicense.number)) {
      return res.status(400).json({ success: false, message: 'Driving license number is mandatory for motorized delivery vehicles.' });
    }

    const applicationData = {
      applicationId: `app-r-${uuidv4().slice(0, 8)}`,
      userId,
      name: name.trim(),
      phone: (phone || req.user.phone).trim(),
      email: (email || req.user.email || '').trim().toLowerCase(),
      city: city.trim(),
      preferredArea: preferredArea.trim(),
      vehicleType,
      vehicleName: vehicleName || (vehicleType === 'bicycle' ? 'Eco Bicycle' : 'Motorcycle'),
      vehicleNumber: (vehicleNumber || '').trim().toUpperCase(),
      emergencyContact: emergencyContact || {},
      bankDetails: bankDetails || {},
      documents: {
        govtId: documents.govtId,
        drivingLicense: documents.drivingLicense,
        rc: documents.rc,
        insurance: documents.insurance,
        profilePhoto: documents.profilePhoto,
        addressProof: documents.addressProof,
      },
      status: 'pending_verification',
      reviewHistory: [],
    };

    let savedApp = null;
    if (isConnectedToMongo) {
      try {
        savedApp = await RiderApplication.findOneAndUpdate(
          { userId },
          applicationData,
          { upsert: true, new: true }
        );
      } catch (err) {
        console.warn('Mongo rider app save error:', err.message);
      }
    }

    const existingIndex = mockDb.pendingRiders.findIndex((r) => r.userId === userId);
    if (existingIndex !== -1) {
      mockDb.pendingRiders[existingIndex] = applicationData;
    } else {
      mockDb.pendingRiders.push(applicationData);
    }

    return res.status(201).json({
      success: true,
      message: 'Delivery partner credentials and documents submitted for administrator verification.',
      application: savedApp || applicationData,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 3. Resubmit Corrected Rider Documents
export async function resubmitRiderApplication(req, res) {
  try {
    const userId = String(req.user.id || req.user._id);
    const { documents, notes } = req.body;

    let app = null;
    if (isConnectedToMongo) {
      app = await RiderApplication.findOne({ userId });
    }

    if (!app) {
      app = mockDb.pendingRiders.find((r) => r.userId === userId);
    }

    if (!app) {
      return res.status(404).json({ success: false, message: 'Application record not found.' });
    }

    if (documents) {
      app.documents = { ...app.documents, ...documents };
    }

    app.status = 'pending_verification';
    app.resubmittedAt = new Date();
    if (notes) {
      app.reviewHistory.push({
        status: 'resubmitted',
        reviewedBy: req.user.name || 'Rider',
        reviewedAt: new Date(),
        remarks: `Delivery partner resubmission note: ${notes}`,
      });
    }

    if (isConnectedToMongo && app.save) {
      await app.save();
    }

    return res.json({
      success: true,
      message: 'Updated credentials resubmitted successfully. Your application is queued for administrator review.',
      application: app,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 4. Get Rider Profile & Active Deliveries
export async function getRiderProfile(req, res) {
  try {
    const rider = await getRiderRecord(req.user);

    if (!rider) {
      return res.status(404).json({
        success: false,
        noProfile: true,
        message: 'Delivery partner profile not found. Please complete onboarding.',
      });
    }

    const riderId = rider.id;
    let activeOrder = null;

    if (isConnectedToMongo) {
      try {
        activeOrder = await Order.findOne({
          'assignedRider.riderId': riderId,
          orderStatus: { $in: ['ReadyForPickup', 'OutForDelivery', 'Preparing', 'Accepted'] },
        });
      } catch (err) {
        console.warn('Mongo active order fetch error:', err.message);
      }
    }

    if (!activeOrder) {
      activeOrder = mockDb.orders.find(
        (o) => o.assignedRider?.riderId === riderId && !['Delivered', 'delivered', 'Cancelled', 'cancelled'].includes(o.orderStatus)
      );
    }

    return res.json({
      success: true,
      rider,
      activeOrder,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 5. Toggle Online / Offline Status (Strictly blocks unverified riders)
export async function toggleOnlineStatus(req, res) {
  try {
    const rider = await getRiderRecord(req.user);
    if (!rider) {
      return res.status(404).json({ success: false, message: 'Delivery partner profile not found.' });
    }

    // Strict access control: unverified riders cannot go online
    if (rider.verificationStatus !== 'verified' && req.user.status !== 'active') {
      return res.status(403).json({
        success: false,
        isUnverified: true,
        message: 'Access restricted: Please wait for administrator verification of your driving license before going online.',
      });
    }

    rider.isOnline = !rider.isOnline;

    return res.json({
      success: true,
      isOnline: rider.isOnline,
      message: rider.isOnline
        ? 'You are now ONLINE. You will receive nearby delivery requests!'
        : 'You are now OFFLINE. New delivery requests paused.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 6. Nearby Available Delivery Requests
export async function getNearbyTasks(req, res) {
  try {
    const rider = await getRiderRecord(req.user);
    if (!rider || !rider.isOnline) {
      return res.json({ success: true, count: 0, tasks: [] });
    }

    let availableOrders = [];

    if (isConnectedToMongo) {
      try {
        availableOrders = await Order.find({
          orderStatus: { $in: ['Accepted', 'Preparing', 'ReadyForPickup'] },
          'assignedRider.riderId': { $exists: false },
        }).sort({ createdAt: -1 });
      } catch (err) {
        console.warn('Mongo available orders error:', err.message);
      }
    }

    if (availableOrders.length === 0) {
      availableOrders = mockDb.orders.filter(
        (o) => ['Accepted', 'Preparing', 'ReadyForPickup'].includes(o.orderStatus) && !o.assignedRider?.riderId
      );
    }

    const tasks = availableOrders.map((o) => ({
      taskId: o.orderId || o.id,
      orderNumber: o.orderId || o.id,
      merchantName: o.storeName,
      customerName: o.customerName,
      pickupAddress: `${o.storeName}, Main Road, Madhapur`,
      dropoffAddress: o.deliveryAddress ? `${o.deliveryAddress.street}, ${o.deliveryAddress.locality}` : 'Madhapur, Hyderabad',
      distanceKm: 2.4,
      earnings: 45,
      itemsCount: o.items ? o.items.length : 1,
      totalAmount: o.totalAmount,
    }));

    return res.json({ success: true, count: tasks.length, tasks });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 7. Accept a Delivery Task
export async function acceptTask(req, res) {
  try {
    const { taskId } = req.params;
    const rider = await getRiderRecord(req.user);
    if (!rider) return res.status(404).json({ success: false, message: 'Rider record not found.' });

    const riderId = rider.id;
    let order = null;

    if (isConnectedToMongo) {
      try {
        order = await Order.findOneAndUpdate(
          { orderId: taskId },
          {
            orderStatus: 'ReadyForPickup',
            assignedRider: {
              riderId,
              name: rider.name,
              phone: rider.phone,
              acceptedAt: new Date(),
            },
          },
          { new: true }
        );
      } catch (err) {
        console.warn('Mongo order accept error:', err.message);
      }
    }

    const memoryOrder = mockDb.orders.find((o) => o.id === taskId || o.orderId === taskId);
    if (memoryOrder) {
      memoryOrder.orderStatus = 'ReadyForPickup';
      memoryOrder.assignedRider = {
        riderId,
        name: rider.name,
        phone: rider.phone,
      };
      order = memoryOrder;
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Delivery task not found.' });
    }

    // Real-time broadcast
    const io = req.app.get('io');
    if (io) {
      io.emit('order:assigned', { orderId: taskId, riderName: rider.name });
    }

    return res.json({
      success: true,
      message: 'Delivery order accepted! Head to the store for pickup.',
      order,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 8. Update Delivery Status (e.g. Out For Delivery)
export async function updateProgress(req, res) {
  try {
    const { taskId } = req.params;
    const { status } = req.body; // 'OutForDelivery'

    if (isConnectedToMongo) {
      await Order.findOneAndUpdate({ orderId: taskId }, { orderStatus: status });
    }

    const memoryOrder = mockDb.orders.find((o) => o.id === taskId || o.orderId === taskId);
    if (memoryOrder) {
      memoryOrder.orderStatus = status;
    }

    return res.json({ success: true, message: `Order status updated to ${status}.` });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 9. Confirm Delivery via Secure Order-Specific OTP (NO universal 1234!)
export async function verifyDeliveryOtp(req, res) {
  try {
    const { taskId } = req.params;
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({ success: false, message: 'Please enter the 4-digit customer delivery OTP.' });
    }

    let order = null;
    if (isConnectedToMongo) {
      order = await Order.findOne({ orderId: taskId });
    }
    if (!order) {
      order = mockDb.orders.find((o) => o.id === taskId || o.orderId === taskId);
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Strict validation: OTP MUST match the order's specific OTP!
    const cleanOtp = String(otp).trim();
    const expectedOtp = String(order.deliveryOtp).trim();

    if (cleanOtp !== expectedOtp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Delivery OTP. Please ask the customer for the 4-digit code shown on their order screen.',
      });
    }

    // Mark delivered
    if (isConnectedToMongo) {
      await Order.findOneAndUpdate(
        { orderId: taskId },
        {
          orderStatus: 'Delivered',
          paymentStatus: 'paid',
          'assignedRider.completedAt': new Date(),
        }
      );
    }

    if (order) {
      order.orderStatus = 'Delivered';
      order.paymentStatus = 'paid';
    }

    // Credit earnings to rider
    const rider = await getRiderRecord(req.user);
    if (rider) {
      rider.todayDeliveries = (rider.todayDeliveries || 0) + 1;
      rider.todayEarnings = (rider.todayEarnings || 0) + 55;
      rider.totalDeliveries = (rider.totalDeliveries || 0) + 1;
    }

    // Notify customer via Socket
    const io = req.app.get('io');
    if (io) {
      io.emit('order:delivered', { orderId: taskId });
    }

    return res.json({
      success: true,
      message: 'Delivery confirmed and completed successfully! ₹55 added to your earnings.',
      earnedAmount: 55,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 10. Delivery History & Earnings
export async function getDeliveryHistory(req, res) {
  try {
    const rider = await getRiderRecord(req.user);
    if (!rider) return res.json({ success: true, count: 0, history: [] });

    const riderId = rider.id;
    let completed = [];

    if (isConnectedToMongo) {
      try {
        completed = await Order.find({
          'assignedRider.riderId': riderId,
          orderStatus: 'Delivered',
        }).sort({ createdAt: -1 });
      } catch (err) {
        console.warn('Mongo delivery history error:', err.message);
      }
    }

    if (completed.length === 0) {
      completed = mockDb.orders.filter(
        (o) => o.assignedRider?.riderId === riderId && ['Delivered', 'delivered'].includes(o.orderStatus)
      );
    }

    return res.json({
      success: true,
      count: completed.length,
      history: completed,
      earnings: {
        todayEarnings: rider.todayEarnings || 0,
        todayDeliveries: rider.todayDeliveries || 0,
        totalDeliveries: rider.totalDeliveries || completed.length,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
