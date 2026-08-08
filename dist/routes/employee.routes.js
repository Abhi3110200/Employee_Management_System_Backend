"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const employee_controller_js_1 = require("../controllers/employee.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const rbac_middleware_js_1 = require("../middleware/rbac.middleware.js");
const router = (0, express_1.Router)();
// Protect all employee routes
router.use(auth_middleware_js_1.protect);
router.get('/stats', employee_controller_js_1.getDashboardStats);
router.get('/export/csv', (0, auth_middleware_js_1.authorize)('super_admin', 'hr_manager'), employee_controller_js_1.exportEmployeesCSV);
router.post('/import/csv', (0, auth_middleware_js_1.authorize)('super_admin', 'hr_manager'), employee_controller_js_1.importEmployeesCSV);
router.get('/', (0, auth_middleware_js_1.authorize)('super_admin', 'hr_manager'), employee_controller_js_1.getAllEmployees);
router.get('/:id/reportees', employee_controller_js_1.getEmployeeReportees);
router.patch('/:id/manager', (0, auth_middleware_js_1.authorize)('super_admin', 'hr_manager'), employee_controller_js_1.updateEmployeeManager);
router.patch('/:id/restore', (0, auth_middleware_js_1.authorize)('super_admin'), employee_controller_js_1.restoreEmployee);
router.get('/:id', employee_controller_js_1.getEmployeeById);
router.post('/', (0, auth_middleware_js_1.authorize)('super_admin', 'hr_manager'), rbac_middleware_js_1.restrictRoleAssignment, employee_controller_js_1.createEmployee);
router.put('/:id', rbac_middleware_js_1.restrictRoleAssignment, employee_controller_js_1.updateEmployee);
router.delete('/:id', (0, auth_middleware_js_1.authorize)('super_admin'), employee_controller_js_1.deleteEmployee);
exports.default = router;
//# sourceMappingURL=employee.routes.js.map