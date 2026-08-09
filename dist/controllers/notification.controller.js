"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNotification = exports.markAllNotificationsAsRead = exports.markNotificationAsRead = exports.getMyNotifications = void 0;
const notification_model_js_1 = require("../models/notification.model.js");
const getMyNotifications = async (req, res) => {
    try {
        const userId = req.user?.id;
        const notifications = await notification_model_js_1.NotificationModel.find({ recipient: userId })
            .sort({ createdAt: -1 })
            .limit(30);
        const unreadCount = await notification_model_js_1.NotificationModel.countDocuments({ recipient: userId, isRead: false });
        res.status(200).json({
            status: 'success',
            unreadCount,
            count: notifications.length,
            data: notifications,
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to fetch notifications',
        });
    }
};
exports.getMyNotifications = getMyNotifications;
const markNotificationAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const notification = await notification_model_js_1.NotificationModel.findOneAndUpdate({ _id: id, recipient: userId }, { isRead: true }, { new: true });
        if (!notification) {
            res.status(404).json({
                status: 'error',
                message: 'Notification record not found',
            });
            return;
        }
        res.status(200).json({
            status: 'success',
            data: notification,
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to mark notification as read',
        });
    }
};
exports.markNotificationAsRead = markNotificationAsRead;
const markAllNotificationsAsRead = async (req, res) => {
    try {
        const userId = req.user?.id;
        await notification_model_js_1.NotificationModel.updateMany({ recipient: userId, isRead: false }, { isRead: true });
        res.status(200).json({
            status: 'success',
            message: 'All notifications marked as read',
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to mark all notifications as read',
        });
    }
};
exports.markAllNotificationsAsRead = markAllNotificationsAsRead;
const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        await notification_model_js_1.NotificationModel.findOneAndDelete({ _id: id, recipient: userId });
        res.status(200).json({
            status: 'success',
            message: 'Notification deleted successfully',
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to delete notification',
        });
    }
};
exports.deleteNotification = deleteNotification;
//# sourceMappingURL=notification.controller.js.map