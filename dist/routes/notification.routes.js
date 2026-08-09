"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const notification_controller_js_1 = require("../controllers/notification.controller.js");
const router = (0, express_1.Router)();
router.use(auth_middleware_js_1.protect);
router.get('/', notification_controller_js_1.getMyNotifications);
router.patch('/read-all', notification_controller_js_1.markAllNotificationsAsRead);
router.patch('/:id/read', notification_controller_js_1.markNotificationAsRead);
router.delete('/:id', notification_controller_js_1.deleteNotification);
exports.default = router;
//# sourceMappingURL=notification.routes.js.map