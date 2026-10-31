import { Router } from 'express';
import { getCities, getCategories, getNearbyMerchants, getMerchantDetails, searchAll } from '../controllers/discoveryController.js';

const router = Router();

router.get('/cities', getCities);
router.get('/categories', getCategories);
router.get('/nearby', getNearbyMerchants);
router.get('/search', searchAll);
router.get('/merchants/:id', getMerchantDetails);

export default router;
