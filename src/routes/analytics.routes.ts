import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { getAnalyticsSummary } from '../controllers/analytics.controller.js';

const router = Router();

router.use(protect);

router.get('/summary', getAnalyticsSummary);

export default router;
