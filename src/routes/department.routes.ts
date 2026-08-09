import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import {
  getDepartments,
  createDepartment,
  getDepartmentRoster,
} from '../controllers/department.controller.js';

const router = Router();

router.use(protect);

router.get('/', getDepartments);
router.post('/', authorize('super_admin', 'hr_manager'), createDepartment);
router.get('/:id/roster', getDepartmentRoster);

export default router;
