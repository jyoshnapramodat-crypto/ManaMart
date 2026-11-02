import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  createParcelOrder,
  bookReservation,
  bookService,
} from '../controllers/orderController.js';
import { verifyDeliveryOtp } from '../controllers/riderController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.post('/create', createOrder);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', updateOrderStatus);
router.post('/:id/verify-delivery', verifyDeliveryOtp);

// Parcel delivery & reservations
router.post('/parcel', createParcelOrder);
router.post('/reservation', bookReservation);
router.post('/service', bookService);

export default router;

