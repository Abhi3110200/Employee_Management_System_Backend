import { Router } from 'express';
import { getHierarchyTree, getDirectReports } from '../controllers/hierarchy.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect);

router.get('/tree', getHierarchyTree);
router.get('/direct-reports/:id', getDirectReports);

export default router;
