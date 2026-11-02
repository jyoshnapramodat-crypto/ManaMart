import { Router } from 'express';
import {
  getMyStore,
  updateStoreStatus,
  getStoreProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getStorePosts,
  createPost,
  deletePost,
  getStorePromotions,
  createPromotion,
  getStoreFollowers,
  getStoreOrders,
  getReservations,
  submitMerchantApplication,
  resubmitMerchantApplication,
  getMyApplicationStatus,
} from '../controllers/merchantController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

// Onboarding & Document Verification
router.post('/apply', submitMerchantApplication);
router.post('/resubmit', resubmitMerchantApplication);
router.get('/application-status', getMyApplicationStatus);

// Store Management
router.get('/my-store', getMyStore);
router.put('/my-store', updateStoreStatus);

// Products & Inventory CRUD
router.get('/products', getStoreProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// Posts & Social Feed Updates
router.get('/posts', getStorePosts);
router.post('/posts', createPost);
router.delete('/posts/:id', deletePost);

// Promotions & Coupon Offers
router.get('/promotions', getStorePromotions);
router.post('/promotions', createPromotion);

// Customer Followers
router.get('/followers', getStoreFollowers);

// Orders & Table Reservations
router.get('/orders', getStoreOrders);
router.get('/reservations', getReservations);

export default router;
