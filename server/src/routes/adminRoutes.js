import { Router } from 'express';
import {
  getPlatformStats,
  getUsers,
  updateUserStatus,
  getPendingMerchants,
  verifyMerchant,
  getPendingRiders,
  verifyRider,
  getReports,
  updateReportStatus,
  getAuditLogs,
  getAllOrders,
  processRefund,
  getAdminTeam,
  inviteAdmin,
  verifyAdminInvite,
  acceptAdminInvite,
} from '../controllers/adminController.js';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware.js';

const router = Router();

// Public Tokenized Endpoints: Only accessible with a valid, unexpired Admin Invite Token
// (Note: No public /admin/register route exists)
router.get('/invite/verify', verifyAdminInvite);
router.post('/accept-invite', acceptAdminInvite);

// Strict security: require authentication and administrator role for all admin routes
router.use(authenticate, authorizeRoles('admin'));

router.get('/team', getAdminTeam);
router.post('/invite', inviteAdmin);
router.get('/stats', getPlatformStats);
router.get('/users', getUsers);
router.put('/users/:id/status', updateUserStatus);
router.get('/merchants/pending', getPendingMerchants);
router.post('/merchants/:id/verify', verifyMerchant);
router.post('/merchants/:id/review', verifyMerchant);
router.get('/riders/pending', getPendingRiders);
router.post('/riders/:id/verify', verifyRider);
router.post('/riders/:id/review', verifyRider);
router.get('/reports', getReports);
router.put('/reports/:id/status', updateReportStatus);
router.get('/audit-logs', getAuditLogs);
router.get('/orders', getAllOrders);
router.post('/refunds/:id', processRefund);

export default router;
