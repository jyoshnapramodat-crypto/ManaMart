import { Router } from 'express';
import {
  getPlatformStats,
  getPendingMerchants,
  verifyMerchant,
  getPendingRiders,
  verifyRider,
  getAllOrders,
  processRefund,
} from '../controllers/adminController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/stats', getPlatformStats);
router.get('/merchants/pending', getPendingMerchants);
router.post('/merchants/:id/verify', verifyMerchant);
router.get('/riders/pending', getPendingRiders);
router.post('/riders/:id/verify', verifyRider);
router.get('/orders', getAllOrders);
router.post('/refunds/:id', processRefund);

export default router;

