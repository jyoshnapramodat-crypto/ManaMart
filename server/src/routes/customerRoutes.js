import { Router } from 'express';
import { getMyNotifications, markNotificationRead, submitReview } from '../controllers/customerController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/notifications', getMyNotifications);
router.put('/notifications/:id/read', markNotificationRead);
router.post('/reviews', submitReview);

export default router;
