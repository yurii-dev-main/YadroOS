import { Router } from 'express';
import {
  createActivity,
  deleteActivity,
  getActivityById,
  listActivities,
  updateActivity
} from '../controllers/activities.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);
router.get('/', listActivities);
router.get('/:id', getActivityById);
router.post('/', createActivity);
router.put('/:id', updateActivity);
router.delete('/:id', deleteActivity);

export default router;
