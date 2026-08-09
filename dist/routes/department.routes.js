"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const department_controller_js_1 = require("../controllers/department.controller.js");
const router = (0, express_1.Router)();
router.use(auth_middleware_js_1.protect);
router.get('/', department_controller_js_1.getDepartments);
router.post('/', (0, auth_middleware_js_1.authorize)('super_admin', 'hr_manager'), department_controller_js_1.createDepartment);
router.get('/:id/roster', department_controller_js_1.getDepartmentRoster);
exports.default = router;
//# sourceMappingURL=department.routes.js.map