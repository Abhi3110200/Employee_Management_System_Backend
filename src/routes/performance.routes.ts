import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import {
  getGoals,
  createGoal,
  updateGoalProgress,
  getReviews,
  createOrUpdateReview,
} from '../controllers/performance.controller.js';

const router = Router();

router.use(protect);

router.get('/goals', getGoals);
router.post('/goals', createGoal);
router.patch('/goals/:id/progress', updateGoalProgress);

router.get('/reviews', getReviews);
router.post('/reviews', authorize('super_admin', 'hr_manager'), createOrUpdateReview);

export default router;
