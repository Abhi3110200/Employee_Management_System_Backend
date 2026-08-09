"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const performance_controller_js_1 = require("../controllers/performance.controller.js");
const router = (0, express_1.Router)();
router.use(auth_middleware_js_1.protect);
router.get('/goals', performance_controller_js_1.getGoals);
router.post('/goals', performance_controller_js_1.createGoal);
router.patch('/goals/:id/progress', performance_controller_js_1.updateGoalProgress);
router.get('/reviews', performance_controller_js_1.getReviews);
router.post('/reviews', (0, auth_middleware_js_1.authorize)('super_admin', 'hr_manager'), performance_controller_js_1.createOrUpdateReview);
exports.default = router;
//# sourceMappingURL=performance.routes.js.map