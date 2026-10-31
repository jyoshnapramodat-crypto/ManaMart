import { Router } from 'express';
import {
  createRecurringList,
  getMyRecurringLists,
  pauseRecurringList,
  resumeRecurringList,
  executeRecurringOrder,
  deleteRecurringList,
} from '../controllers/recurringController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.post('/', createRecurringList);
router.get('/', getMyRecurringLists);
router.post('/:id/pause', pauseRecurringList);
router.post('/:id/resume', resumeRecurringList);
router.post('/:id/execute', executeRecurringOrder);
router.delete('/:id', deleteRecurringList);

export default router;

