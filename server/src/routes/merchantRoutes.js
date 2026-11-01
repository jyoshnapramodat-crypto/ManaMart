import { Router } from 'express';
import {
  getMyStore,
  updateStoreStatus,
  getStoreProducts,
  createProduct,
  updateProduct,
  getStoreOrders,
  uploadDocuments,
  getReservations,
  submitMerchantApplication,
  getMyApplicationStatus,
} from '../controllers/merchantController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.post('/apply', submitMerchantApplication);
router.get('/application-status', getMyApplicationStatus);
router.get('/my-store', getMyStore);
router.put('/my-store', updateStoreStatus);
router.get('/products', getStoreProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.get('/orders', getStoreOrders);
router.post('/documents', uploadDocuments);
router.get('/reservations', getReservations);

export default router;
