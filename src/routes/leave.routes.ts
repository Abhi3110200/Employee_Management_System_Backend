import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import {
  getLeaveRequests,
  applyLeave,
  updateLeaveStatus,
} from '../controllers/leave.controller.js';

const router = Router();

router.use(protect);

router.get('/', getLeaveRequests);
router.post('/', applyLeave);
router.patch('/:id/status', authorize('super_admin', 'hr_manager'), updateLeaveStatus);

export default router;
