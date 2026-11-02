import { Router } from 'express';
import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  submitReview,
  reportTarget,
  toggleFavorite,
  getFavorites,
} from '../controllers/customerController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

// Notifications Center
router.get('/notifications', getMyNotifications);
router.put('/notifications/:id/read', markNotificationRead);
router.put('/notifications/read-all', markAllNotificationsRead);

// Verified Reviews & Community Moderation
router.post('/reviews', submitReview);
router.post('/reports', reportTarget);

// Saved Items / Favorites
router.get('/favorites', getFavorites);
router.post('/favorites/toggle', toggleFavorite);

export default router;
