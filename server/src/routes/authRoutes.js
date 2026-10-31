import { Router } from 'express';
import {
  sendOtp,
  verifyOtp,
  register,
  login,
  checkAvailability,
  quickLogin,
  getMe,
  updateProfile,
  addAddress,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/check-availability', checkAvailability);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/quick-login', quickLogin);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.post('/address', authenticate, addAddress);

export default router;
