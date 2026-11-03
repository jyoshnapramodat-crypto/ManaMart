import { Router } from 'express';
import {
  getRiderProfile,
  toggleOnlineStatus,
  getNearbyTasks,
  acceptTask,
  updateProgress,
  verifyDeliveryOtp,
  getDeliveryHistory,
  submitRiderApplication,
  resubmitRiderApplication,
  getMyRiderApplicationStatus,
} from '../controllers/riderController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

// Onboarding & Document Verification
router.post('/apply', submitRiderApplication);
router.post('/resubmit', resubmitRiderApplication);
router.get('/application-status', getMyRiderApplicationStatus);

// Rider Profile & Real-time Operations
router.get('/profile', getRiderProfile);
router.put('/status', toggleOnlineStatus);
router.get('/tasks/nearby', getNearbyTasks);
router.post('/tasks/:taskId/accept', acceptTask);
router.put('/tasks/:taskId/progress', updateProgress);
router.post('/tasks/:taskId/verify-otp', verifyDeliveryOtp);
router.get('/history', getDeliveryHistory);
router.get('/tasks/history', getDeliveryHistory);

export default router;
