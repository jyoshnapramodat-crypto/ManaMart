import { mockDb } from '../utils/mockDbStore.js';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../models/User.js';
import { Store } from '../models/Store.js';
import { Order } from '../models/Order.js';
import { MerchantApplication } from '../models/MerchantApplication.js';
import { RiderApplication } from '../models/RiderApplication.js';
import { Notification } from '../models/Notification.js';
import { Report } from '../models/Report.js';
import { AuditLog } from '../models/AuditLog.js';
import { isConnectedToMongo } from '../config/db.js';

// Real Platform Analytics & Statistics
export async function getPlatformStats(req, res) {
  try {
    let totalUsers = mockDb.users.length;
    let customerCount = mockDb.users.filter((u) => u.role === 'customer').length;
    let merchantCount = mockDb.users.filter((u) => u.role === 'merchant').length;
    let riderCount = mockDb.users.filter((u) => u.role === 'rider').length;
    let pendingMerchants = mockDb.pendingMerchants.length;
    let pendingRiders = mockDb.pendingRiders.length;
    let totalOrders = mockDb.orders.length;
    let gmv = mockDb.orders
      .filter((o) => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    if (isConnectedToMongo) {
      try {
        const [users, orders, mApps, rApps, stores] = await Promise.all([
          User.find({}, 'role status'),
          Order.find({}, 'totalAmount paymentStatus'),
          MerchantApplication.countDocuments({ status: { $in: ['pending_verification', 'under_review'] } }),
          RiderApplication.countDocuments({ status: { $in: ['pending_verification', 'under_review'] } }),
          Store.countDocuments({ isVerified: true }),
        ]);

        totalUsers = users.length;
        customerCount = users.filter((u) => u.role === 'customer').length;
        merchantCount = users.filter((u) => u.role === 'merchant').length;
        riderCount = users.filter((u) => u.role === 'rider').length;
        pendingMerchants = mApps;
        pendingRiders = rApps;
        totalOrders = orders.length;
        gmv = orders
          .filter((o) => o.paymentStatus === 'paid')
          .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      } catch (err) {
        console.warn('Mongo platform stats fallback:', err.message);
      }
    }

    const platformCommission = Math.round(gmv * 0.08); // 8% platform fee
    const activeMerchants = merchantCount;
    const activeRiders = riderCount;

    return res.json({
      success: true,
      stats: {
        gmv,
        totalOrders,
        platformCommission,
        totalUsers,
        customerCount,
        merchantCount,
        riderCount,
        activeMerchants,
        activeRiders,
        pendingMerchants,
        pendingRiders,
        pendingVerifications: pendingMerchants + pendingRiders,
        activeZones: mockDb.cities?.length || 4,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// User Management: List, Search, and Filter Users
export async function getUsers(req, res) {
  try {
    const { role, status, search, limit = 50 } = req.query;
    let usersList = [];

    if (isConnectedToMongo) {
      try {
        const query = {};
        if (role && role !== 'all') query.role = role;
        if (status && status !== 'all') query.status = status;
        if (search) {
          const reg = new RegExp(search.trim(), 'i');
          query.$or = [{ name: reg }, { phone: reg }, { email: reg }];
        }
        usersList = await User.find(query).select('-password').sort({ createdAt: -1 }).limit(Number(limit));
      } catch (err) {
        console.warn('Mongo users fetch error:', err.message);
      }
    }

    if (usersList.length === 0) {
      usersList = mockDb.users.filter((u) => {
        if (role && role !== 'all' && u.role !== role) return false;
        if (status && status !== 'all' && u.status !== status) return false;
        if (search) {
          const s = search.toLowerCase();
          const matchName = u.name?.toLowerCase().includes(s);
          const matchPhone = u.phone?.includes(s);
          const matchEmail = u.email?.toLowerCase().includes(s);
          if (!matchName && !matchPhone && !matchEmail) return false;
        }
        return true;
      });
    }

    return res.json({
      success: true,
      count: usersList.length,
      users: usersList,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Suspend or Reactivate a User Account
export async function updateUserStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body; // status: 'active' | 'suspended' | 'rejected'

    if (!['active', 'suspended', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    let user = null;
    if (isConnectedToMongo) {
      try {
        user = await User.findByIdAndUpdate(id, { status }, { new: true });
        if (!user) {
          user = await User.findOneAndUpdate({ $or: [{ phone: id }, { email: id }] }, { status }, { new: true });
        }
      } catch (err) {
        console.warn('Mongo user status update error:', err.message);
      }
    }

    const memoryUser = mockDb.users.find((u) => u.id === id || u._id === id || u.phone === id);
    if (memoryUser) {
      memoryUser.status = status;
    }

    // Audit Log
    const auditRecord = {
      logId: `log-${Date.now()}`,
      adminId: req.user.id || req.user._id,
      adminName: req.user.name || 'Platform Administrator',
      action: status === 'suspended' ? 'USER_SUSPENDED' : 'USER_REACTIVATED',
      targetType: 'User',
      targetId: id,
      details: { status, remarks: remarks || 'Admin manual action' },
      ipAddress: req.ip,
      createdAt: new Date().toISOString(),
    };

    if (isConnectedToMongo) {
      try {
        await AuditLog.create(auditRecord);
      } catch (_) {}
    }

    return res.json({
      success: true,
      message: `User account has been set to "${status.toUpperCase()}".`,
      status,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Get Merchant Applications for Document Review
export async function getPendingMerchants(req, res) {
  try {
    const { status } = req.query;
    let applications = [];

    if (isConnectedToMongo) {
      try {
        const query = status ? { status } : {};
        applications = await MerchantApplication.find(query).sort({ createdAt: -1 });
      } catch (err) {
        console.warn('Mongo merchant apps fetch error:', err.message);
      }
    }

    if (applications.length === 0) {
      applications = mockDb.pendingMerchants;
    }

    return res.json({
      success: true,
      count: applications.length,
      merchants: applications,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Review and Decide Merchant Application (Approve, Reject, or Request Changes)
export async function verifyMerchant(req, res) {
  try {
    const { id } = req.params;
    const { action, remarks, rejectionReason, requestedChanges } = req.body; // action: 'approve' | 'reject' | 'request_changes'
    const adminId = req.user.id || req.user._id;
    const adminName = req.user.name || 'Platform Administrator';

    if (!['approve', 'reject', 'request_changes'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid verification action. Choose approve, reject, or request_changes.' });
    }

    if ((action === 'reject' || action === 'request_changes') && !remarks && !rejectionReason && !requestedChanges) {
      return res.status(400).json({ success: false, message: 'A detailed reason or remark is mandatory when rejecting or requesting changes.' });
    }

    let application = null;
    if (isConnectedToMongo) {
      try {
        application = await MerchantApplication.findOne({
          $or: [{ applicationId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { userId: id }],
        });
      } catch (err) {
        console.warn('Mongo find merchant app error:', err.message);
      }
    }

    const memoryIndex = mockDb.pendingMerchants.findIndex((m) => m.id === id || m.applicationId === id || m.userId === id);
    const memoryApp = memoryIndex !== -1 ? mockDb.pendingMerchants[memoryIndex] : null;

    const targetUserId = application?.userId || memoryApp?.userId;
    const businessName = application?.businessName || memoryApp?.businessName || 'Neighborhood Store';

    let newStatus = 'approved';
    let notificationTitle = '';
    let notificationMsg = '';

    if (action === 'approve') {
      newStatus = 'approved';
      notificationTitle = '🎉 Merchant Store Approved!';
      notificationMsg = `Congratulations! Your store "${businessName}" has been verified. You can now publish products and accept orders.`;

      // Update linked User to active merchant
      if (targetUserId) {
        if (isConnectedToMongo) {
          await User.findByIdAndUpdate(targetUserId, { role: 'merchant', status: 'active' });
        }
        const u = mockDb.users.find((user) => user.id === targetUserId || user._id === targetUserId);
        if (u) {
          u.role = 'merchant';
          u.status = 'active';
        }
      }

      // Activate or create Store record
      const storeId = `store-${uuidv4().slice(0, 8)}`;
      if (isConnectedToMongo && targetUserId) {
        await Store.findOneAndUpdate(
          { userId: targetUserId },
          {
            isVerified: true,
            verificationStatus: 'verified',
            isOpen: true,
          },
          { upsert: true, new: true }
        );
      }

      // Sync with mockDb
      const existingMerch = mockDb.merchants.find((m) => m.userId === targetUserId);
      if (existingMerch) {
        existingMerch.verificationStatus = 'verified';
        existingMerch.isOpen = true;
      } else if (memoryApp) {
        mockDb.merchants.push({
          id: storeId,
          userId: targetUserId,
          businessName: memoryApp.businessName,
          category: memoryApp.category || 'grocery',
          phone: memoryApp.phone,
          verificationStatus: 'verified',
          isOpen: true,
          rating: 4.8,
          totalRatings: 1,
        });
      }
    } else if (action === 'reject') {
      newStatus = 'rejected';
      const reason = rejectionReason || remarks || 'Regulatory documentation does not meet platform verification standards.';
      notificationTitle = '❌ Merchant Application Rejected';
      notificationMsg = `Your application for "${businessName}" was rejected: ${reason}`;

      if (targetUserId && isConnectedToMongo) {
        await User.findByIdAndUpdate(targetUserId, { status: 'rejected' });
      }
    } else if (action === 'request_changes') {
      newStatus = 'changes_requested';
      const notes = requestedChanges || remarks || 'Please update your uploaded documents and resubmit.';
      notificationTitle = '⚠️ Changes Requested on Your Application';
      notificationMsg = `Action required for "${businessName}": ${notes}`;

      if (targetUserId && isConnectedToMongo) {
        await User.findByIdAndUpdate(targetUserId, { status: 'pending' });
      }
    }

    // Persist application decision to MongoDB
    if (application) {
      application.status = newStatus;
      application.adminReview = {
        reviewedBy: adminName,
        reviewedAt: new Date(),
        remarks: remarks || rejectionReason || requestedChanges,
        rejectionReason: action === 'reject' ? (rejectionReason || remarks) : undefined,
        requestedChanges: action === 'request_changes' ? (requestedChanges || remarks) : undefined,
      };
      application.reviewHistory.push({
        status: newStatus,
        reviewedBy: adminName,
        reviewedAt: new Date(),
        remarks: remarks || rejectionReason || requestedChanges || 'Reviewed by admin',
      });
      await application.save();
    }

    if (memoryApp) {
      memoryApp.status = newStatus;
      memoryApp.remarks = remarks || rejectionReason || requestedChanges;
    }

    // Dispatch in-app notification
    if (targetUserId) {
      const notifData = {
        notificationId: `notif-${Date.now()}`,
        userId: targetUserId,
        role: 'merchant',
        title: notificationTitle,
        message: notificationMsg,
        type: 'verification',
        link: newStatus === 'approved' ? '/merchant' : '/merchant/status',
        isRead: false,
      };

      if (isConnectedToMongo) {
        try {
          await Notification.create(notifData);
        } catch (_) {}
      }
      mockDb.notifications.unshift(notifData);

      const io = req.app.get('io');
      if (io) io.emit('notification:new', notifData);
    }

    // Audit Log
    const auditRecord = {
      logId: `log-${Date.now()}`,
      adminId,
      adminName,
      action: `MERCHANT_${newStatus.toUpperCase()}`,
      targetType: 'MerchantApplication',
      targetId: id,
      details: { businessName, action, newStatus, remarks: remarks || rejectionReason || requestedChanges },
      ipAddress: req.ip,
    };
    if (isConnectedToMongo) {
      try {
        await AuditLog.create(auditRecord);
      } catch (_) {}
    }

    return res.json({
      success: true,
      message: `Merchant application marked as "${newStatus}".`,
      status: newStatus,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Get Delivery Partner Applications
export async function getPendingRiders(req, res) {
  try {
    const { status } = req.query;
    let applications = [];

    if (isConnectedToMongo) {
      try {
        const query = status ? { status } : {};
        applications = await RiderApplication.find(query).sort({ createdAt: -1 });
      } catch (err) {
        console.warn('Mongo rider apps fetch error:', err.message);
      }
    }

    if (applications.length === 0) {
      applications = mockDb.pendingRiders;
    }

    return res.json({
      success: true,
      count: applications.length,
      riders: applications,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Review and Decide Rider Application (Approve, Reject, or Request Changes)
export async function verifyRider(req, res) {
  try {
    const { id } = req.params;
    const { action, remarks, rejectionReason, requestedChanges } = req.body;
    const adminId = req.user.id || req.user._id;
    const adminName = req.user.name || 'Platform Administrator';

    if (!['approve', 'reject', 'request_changes'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid verification action. Choose approve, reject, or request_changes.' });
    }

    if ((action === 'reject' || action === 'request_changes') && !remarks && !rejectionReason && !requestedChanges) {
      return res.status(400).json({ success: false, message: 'A detailed reason or remark is mandatory when rejecting or requesting changes.' });
    }

    let application = null;
    if (isConnectedToMongo) {
      try {
        application = await RiderApplication.findOne({
          $or: [{ applicationId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { userId: id }],
        });
      } catch (err) {
        console.warn('Mongo find rider app error:', err.message);
      }
    }

    const memoryIndex = mockDb.pendingRiders.findIndex((r) => r.id === id || r.applicationId === id || r.userId === id);
    const memoryApp = memoryIndex !== -1 ? mockDb.pendingRiders[memoryIndex] : null;

    const targetUserId = application?.userId || memoryApp?.userId;
    const riderName = application?.name || memoryApp?.name || 'Delivery Partner';

    let newStatus = 'approved';
    let notificationTitle = '';
    let notificationMsg = '';

    if (action === 'approve') {
      newStatus = 'approved';
      notificationTitle = '🎉 Delivery Partner Verified!';
      notificationMsg = `Congratulations ${riderName}! Your delivery credentials have been approved. You can now toggle online and accept delivery orders.`;

      if (targetUserId) {
        if (isConnectedToMongo) {
          await User.findByIdAndUpdate(targetUserId, { role: 'rider', status: 'active' });
        }
        const u = mockDb.users.find((user) => user.id === targetUserId || user._id === targetUserId);
        if (u) {
          u.role = 'rider';
          u.status = 'active';
        }
      }

      // Add to verified riders
      const riderId = `rider-${uuidv4().slice(0, 8)}`;
      const existingRider = mockDb.riders.find((r) => r.userId === targetUserId);
      if (existingRider) {
        existingRider.verificationStatus = 'verified';
        existingRider.isOnline = true;
      } else {
        mockDb.riders.push({
          id: riderId,
          userId: targetUserId,
          name: riderName,
          phone: application?.phone || memoryApp?.phone,
          vehicleType: application?.vehicleType || memoryApp?.vehicleType || 'bike',
          vehicleName: 'Motorcycle',
          isOnline: true,
          verificationStatus: 'verified',
          todayDeliveries: 0,
          todayEarnings: 0,
          rating: 5.0,
        });
      }
    } else if (action === 'reject') {
      newStatus = 'rejected';
      const reason = rejectionReason || remarks || 'Driving license or vehicle registration did not meet requirements.';
      notificationTitle = '❌ Delivery Application Rejected';
      notificationMsg = `Your application was rejected: ${reason}`;

      if (targetUserId && isConnectedToMongo) {
        await User.findByIdAndUpdate(targetUserId, { status: 'rejected' });
      }
    } else if (action === 'request_changes') {
      newStatus = 'changes_requested';
      const notes = requestedChanges || remarks || 'Please re-upload your driving license / RC with a clearer photo.';
      notificationTitle = '⚠️ Changes Requested on Your Delivery Application';
      notificationMsg = `Action required: ${notes}`;

      if (targetUserId && isConnectedToMongo) {
        await User.findByIdAndUpdate(targetUserId, { status: 'pending' });
      }
    }

    if (application) {
      application.status = newStatus;
      application.adminReview = {
        reviewedBy: adminName,
        reviewedAt: new Date(),
        remarks: remarks || rejectionReason || requestedChanges,
        rejectionReason: action === 'reject' ? (rejectionReason || remarks) : undefined,
        requestedChanges: action === 'request_changes' ? (requestedChanges || remarks) : undefined,
      };
      application.reviewHistory.push({
        status: newStatus,
        reviewedBy: adminName,
        reviewedAt: new Date(),
        remarks: remarks || rejectionReason || requestedChanges || 'Reviewed by admin',
      });
      await application.save();
    }

    if (memoryApp) {
      memoryApp.status = newStatus;
      memoryApp.remarks = remarks || rejectionReason || requestedChanges;
    }

    // In-app notification
    if (targetUserId) {
      const notifData = {
        notificationId: `notif-${Date.now()}`,
        userId: targetUserId,
        role: 'rider',
        title: notificationTitle,
        message: notificationMsg,
        type: 'verification',
        link: newStatus === 'approved' ? '/rider' : '/rider/status',
        isRead: false,
      };

      if (isConnectedToMongo) {
        try {
          await Notification.create(notifData);
        } catch (_) {}
      }
      mockDb.notifications.unshift(notifData);

      const io = req.app.get('io');
      if (io) io.emit('notification:new', notifData);
    }

    // Audit Log
    const auditRecord = {
      logId: `log-${Date.now()}`,
      adminId,
      adminName,
      action: `RIDER_${newStatus.toUpperCase()}`,
      targetType: 'RiderApplication',
      targetId: id,
      details: { riderName, action, newStatus, remarks: remarks || rejectionReason || requestedChanges },
      ipAddress: req.ip,
    };
    if (isConnectedToMongo) {
      try {
        await AuditLog.create(auditRecord);
      } catch (_) {}
    }

    return res.json({
      success: true,
      message: `Rider application marked as "${newStatus}".`,
      status: newStatus,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Moderation & Complaints (Reports Queue)
export async function getReports(req, res) {
  try {
    let reportsList = [];
    if (isConnectedToMongo) {
      try {
        reportsList = await Report.find().sort({ createdAt: -1 });
      } catch (err) {
        console.warn('Mongo reports fetch error:', err.message);
      }
    }

    return res.json({
      success: true,
      count: reportsList.length,
      reports: reportsList,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Update Report Status
export async function updateReportStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, adminRemarks } = req.body; // status: 'investigating' | 'resolved' | 'dismissed'

    let updated = null;
    if (isConnectedToMongo) {
      try {
        updated = await Report.findOneAndUpdate(
          { reportId: id },
          {
            status,
            adminRemarks,
            resolvedBy: req.user.name || 'Platform Administrator',
            resolvedAt: new Date(),
          },
          { new: true }
        );
      } catch (err) {
        console.warn('Mongo report update error:', err.message);
      }
    }

    return res.json({
      success: true,
      message: `Report marked as "${status}".`,
      report: updated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Get Platform Audit Logs
export async function getAuditLogs(req, res) {
  try {
    let logs = [];
    if (isConnectedToMongo) {
      try {
        logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
      } catch (err) {
        console.warn('Mongo audit logs fetch error:', err.message);
      }
    }

    return res.json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Platform Orders Overview
export async function getAllOrders(req, res) {
  try {
    let ordersList = [];
    if (isConnectedToMongo) {
      try {
        ordersList = await Order.find().sort({ createdAt: -1 }).limit(100);
      } catch (err) {
        console.warn('Mongo orders fetch error:', err.message);
      }
    }

    if (ordersList.length === 0) {
      ordersList = mockDb.orders;
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

// Process Customer Order Refund
export async function processRefund(req, res) {
  try {
    const { id } = req.params;
    let order = null;

    if (isConnectedToMongo) {
      try {
        order = await Order.findOneAndUpdate(
          { orderId: id },
          { paymentStatus: 'refunded', orderStatus: 'Cancelled' },
          { new: true }
        );
      } catch (err) {
        console.warn('Mongo order refund error:', err.message);
      }
    }

    const memoryOrder = mockDb.orders.find((o) => o.id === id || o.orderId === id);
    if (memoryOrder) {
      memoryOrder.paymentStatus = 'refunded';
      memoryOrder.orderStatus = 'Cancelled';
      order = memoryOrder;
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Audit Log
    const auditRecord = {
      logId: `log-${Date.now()}`,
      adminId: req.user.id || req.user._id,
      adminName: req.user.name || 'Platform Administrator',
      action: 'ORDER_REFUND_PROCESSED',
      targetType: 'Order',
      targetId: id,
      details: { totalAmount: order.totalAmount, customerPhone: order.customerPhone },
      ipAddress: req.ip,
    };
    if (isConnectedToMongo) {
      try {
        await AuditLog.create(auditRecord);
      } catch (_) {}
    }

    return res.json({
      success: true,
      message: `Full refund of ₹${order.totalAmount} processed for order ${order.orderId || order.id}.`,
      order,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
