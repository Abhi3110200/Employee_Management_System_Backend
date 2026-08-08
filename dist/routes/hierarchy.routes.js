"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const hierarchy_controller_js_1 = require("../controllers/hierarchy.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const router = (0, express_1.Router)();
router.use(auth_middleware_js_1.protect);
router.get('/tree', hierarchy_controller_js_1.getHierarchyTree);
router.get('/direct-reports/:id', hierarchy_controller_js_1.getDirectReports);
exports.default = router;
//# sourceMappingURL=hierarchy.routes.js.map