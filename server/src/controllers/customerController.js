import { mockDb } from '../utils/mockDbStore.js';
import { v4 as uuidv4 } from 'uuid';

export async function getMyNotifications(req, res) {
  try {
    const userId = req.user.id;
    const notifications = mockDb.notifications.filter((n) => n.userId === userId || !n.userId);
    return res.json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function markNotificationRead(req, res) {
  try {
    const { id } = req.params;
    const notif = mockDb.notifications.find((n) => n.id === id);
    if (notif) {
      notif.isRead = true;
    }
    return res.json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function submitReview(req, res) {
  try {
    const { merchantId, rating, comment } = req.body;
    const merchant = mockDb.merchants.find((m) => m.id === merchantId);

    if (merchant) {
      const currentTotal = (merchant.rating || 4.5) * (merchant.totalRatings || 10);
      merchant.totalRatings = (merchant.totalRatings || 10) + 1;
      merchant.rating = Math.round(((currentTotal + Number(rating)) / merchant.totalRatings) * 10) / 10;
    }

    return res.json({
      success: true,
      message: 'Review submitted successfully. Thank you for supporting local businesses!',
      merchantRating: merchant ? merchant.rating : rating,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

