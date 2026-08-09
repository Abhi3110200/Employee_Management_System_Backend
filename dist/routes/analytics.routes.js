"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const analytics_controller_js_1 = require("../controllers/analytics.controller.js");
const router = (0, express_1.Router)();
router.use(auth_middleware_js_1.protect);
router.get('/summary', analytics_controller_js_1.getAnalyticsSummary);
exports.default = router;
//# sourceMappingURL=analytics.routes.js.map