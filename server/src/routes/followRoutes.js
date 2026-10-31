import { Router } from 'express';
import {
  followMerchant,
  unfollowMerchant,
  getMyFollowedShops,
  getSocialFeed,
  likePost,
  createPost,
} from '../controllers/followController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

// Feed is public or authenticated
router.get('/feed', getSocialFeed);
router.post('/posts/:id/like', likePost);

router.use(authenticate);

router.post('/:merchantId', followMerchant);
router.delete('/:merchantId', unfollowMerchant);
router.get('/my-shops', getMyFollowedShops);
router.post('/posts', createPost);

export default router;
