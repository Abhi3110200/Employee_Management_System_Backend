"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const leave_controller_js_1 = require("../controllers/leave.controller.js");
const router = (0, express_1.Router)();
router.use(auth_middleware_js_1.protect);
router.get('/', leave_controller_js_1.getLeaveRequests);
router.post('/', leave_controller_js_1.applyLeave);
router.patch('/:id/status', (0, auth_middleware_js_1.authorize)('super_admin', 'hr_manager'), leave_controller_js_1.updateLeaveStatus);
exports.default = router;
//# sourceMappingURL=leave.routes.js.map