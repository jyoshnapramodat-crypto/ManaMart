import { Router } from 'express';
import {
  getRiderProfile,
  toggleOnlineStatus,
  getNearbyTasks,
  acceptTask,
  counterOfferTask,
  verifyDeliveryOtp,
  getRiderEarnings,
  submitRiderApplication,
  getMyRiderApplicationStatus,
} from '../controllers/riderController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.post('/apply', submitRiderApplication);
router.get('/application-status', getMyRiderApplicationStatus);
router.get('/profile', getRiderProfile);
router.put('/status', toggleOnlineStatus);
router.get('/tasks/nearby', getNearbyTasks);
router.post('/tasks/:id/accept', acceptTask);
router.post('/tasks/:id/counter', counterOfferTask);
router.post('/tasks/:id/verify-otp', verifyDeliveryOtp);
router.get('/earnings', getRiderEarnings);

export default router;
