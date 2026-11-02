import { mockDb } from '../utils/mockDbStore.js';
import { v4 as uuidv4 } from 'uuid';
import { Notification } from '../models/Notification.js';
import { Order } from '../models/Order.js';
import { Review } from '../models/Review.js';
import { Report } from '../models/Report.js';
import { User } from '../models/User.js';
import { Store } from '../models/Store.js';
import { isConnectedToMongo } from '../config/db.js';

// Unified Notifications Center
export async function getMyNotifications(req, res) {
  try {
    const userId = String(req.user.id || req.user._id);
    const userRole = req.user.role || 'customer';

    let notifications = [];

    if (isConnectedToMongo) {
      try {
        notifications = await Notification.find({
          $or: [
            { userId },
            { role: userRole },
            { role: 'all' },
          ],
        }).sort({ createdAt: -1 }).limit(50);
      } catch (err) {
        console.warn('Mongo notifications error:', err.message);
      }
    }

    if (notifications.length === 0) {
      notifications = mockDb.notifications.filter(
        (n) => n.userId === userId || n.role === userRole || n.role === 'all' || !n.userId
      );
    }

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return res.json({
      success: true,
      count: notifications.length,
      unreadCount,
      notifications,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function markNotificationRead(req, res) {
  try {
    const { id } = req.params;

    if (isConnectedToMongo) {
      try {
        await Notification.findOneAndUpdate(
          { $or: [{ notificationId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] },
          { isRead: true }
        );
      } catch (_) {}
    }

    const notif = mockDb.notifications.find((n) => n.id === id || n.notificationId === id);
    if (notif) {
      notif.isRead = true;
    }

    return res.json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function markAllNotificationsRead(req, res) {
  try {
    const userId = String(req.user.id || req.user._id);

    if (isConnectedToMongo) {
      try {
        await Notification.updateMany({ userId }, { isRead: true });
      } catch (_) {}
    }

    mockDb.notifications.forEach((n) => {
      if (n.userId === userId) n.isRead = true;
    });

    return res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Verified Order Customer Reviews (Only allowed after completed order)
export async function submitReview(req, res) {
  try {
    const { orderId, storeId, rating, comment } = req.body;
    const customerId = String(req.user.id || req.user._id);

    if (!orderId || !rating) {
      return res.status(400).json({ success: false, message: 'Order ID and rating are required.' });
    }

    // Verify order completion
    let eligibleOrder = null;
    if (isConnectedToMongo) {
      eligibleOrder = await Order.findOne({
        orderId,
        customerId,
        orderStatus: 'Delivered',
      });
    }

    if (!eligibleOrder) {
      eligibleOrder = mockDb.orders.find(
        (o) => (o.orderId === orderId || o.id === orderId) && o.customerId === customerId && ['Delivered', 'delivered'].includes(o.orderStatus)
      );
    }

    if (!eligibleOrder) {
      return res.status(403).json({
        success: false,
        message: 'Verified reviews can only be submitted after your order has been successfully delivered.',
      });
    }

    const newReview = {
      orderId,
      customerId,
      customerName: req.user.name || 'Verified Customer',
      storeId: storeId || eligibleOrder.storeId || eligibleOrder.merchantId,
      rating: Number(rating),
      comment: comment ? comment.trim() : '',
    };

    if (isConnectedToMongo) {
      try {
        await Review.create(newReview);
      } catch (err) {
        if (err.code === 11000) {
          return res.status(409).json({ success: false, message: 'A review has already been submitted for this order.' });
        }
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your verified review has been published.',
      review: newReview,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Trust & Safety: Report Store, Product, or Post
export async function reportTarget(req, res) {
  try {
    const { targetType, targetId, targetName, reason, details } = req.body;
    const reporterId = String(req.user.id || req.user._id);

    if (!targetType || !targetId || !reason) {
      return res.status(400).json({ success: false, message: 'Target type, target ID, and reason are required.' });
    }

    const newReport = {
      reportId: `rep-${uuidv4().slice(0, 8)}`,
      reporterId,
      reporterName: req.user.name || 'Neighbor',
      reporterRole: req.user.role || 'customer',
      targetType,
      targetId,
      targetName: targetName || targetType,
      reason,
      details: details || '',
      status: 'pending',
    };

    if (isConnectedToMongo) {
      try {
        await Report.create(newReport);
      } catch (err) {
        console.warn('Mongo report create error:', err.message);
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Thank you for keeping our community safe. Our administration team has received your report for review.',
      reportId: newReport.reportId,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Favorites / Saved Items
export async function toggleFavorite(req, res) {
  try {
    const { itemId } = req.body;
    const userId = String(req.user.id || req.user._id);

    let user = null;
    if (isConnectedToMongo) {
      user = await User.findById(userId);
    }
    if (!user) {
      user = mockDb.users.find((u) => u.id === userId || u._id === userId);
    }

    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    if (!user.favorites) user.favorites = [];
    const index = user.favorites.indexOf(itemId);
    let isFavorited = false;

    if (index === -1) {
      user.favorites.push(itemId);
      isFavorited = true;
    } else {
      user.favorites.splice(index, 1);
      isFavorited = false;
    }

    if (isConnectedToMongo && user.save) {
      await user.save();
    }

    return res.json({
      success: true,
      isFavorited,
      favorites: user.favorites,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getFavorites(req, res) {
  try {
    const userId = String(req.user.id || req.user._id);
    let user = null;

    if (isConnectedToMongo) {
      user = await User.findById(userId);
    }
    if (!user) {
      user = mockDb.users.find((u) => u.id === userId || u._id === userId);
    }

    const favIds = user?.favorites || [];
    return res.json({ success: true, count: favIds.length, favorites: favIds });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
