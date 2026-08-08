import { Router } from 'express';
import {
  getDashboardStats,
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  updateEmployeeManager,
  getEmployeeReportees,
  deleteEmployee,
  restoreEmployee,
  exportEmployeesCSV,
  importEmployeesCSV,
} from '../controllers/employee.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { restrictRoleAssignment } from '../middleware/rbac.middleware.js';

const router = Router();

// Protect all employee routes
router.use(protect);

router.get('/stats', getDashboardStats);
router.get('/export/csv', authorize('super_admin', 'hr_manager'), exportEmployeesCSV);
router.post('/import/csv', authorize('super_admin', 'hr_manager'), importEmployeesCSV);
router.get('/', authorize('super_admin', 'hr_manager'), getAllEmployees);
router.get('/:id/reportees', getEmployeeReportees);
router.patch('/:id/manager', authorize('super_admin', 'hr_manager'), updateEmployeeManager);
router.patch('/:id/restore', authorize('super_admin'), restoreEmployee);
router.get('/:id', getEmployeeById);
router.post('/', authorize('super_admin', 'hr_manager'), restrictRoleAssignment, createEmployee);
router.put('/:id', restrictRoleAssignment, updateEmployee);
router.delete('/:id', authorize('super_admin'), deleteEmployee);

export default router;
