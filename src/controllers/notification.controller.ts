import { Request, Response } from 'express';
import { NotificationModel } from '../models/notification.model.js';

export const getMyNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    const notifications = await NotificationModel.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await NotificationModel.countDocuments({ recipient: userId, isRead: false });

    res.status(200).json({
      status: 'success',
      unreadCount,
      count: notifications.length,
      data: notifications,
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch notifications',
    });
  }
};

export const markNotificationAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const notification = await NotificationModel.findOneAndUpdate(
      { _id: id, recipient: userId },
      { isRead: true },
      { new: true }
    );

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
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to mark notification as read',
    });
  }
};

export const markAllNotificationsAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    await NotificationModel.updateMany({ recipient: userId, isRead: false }, { isRead: true });

    res.status(200).json({
      status: 'success',
      message: 'All notifications marked as read',
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to mark all notifications as read',
    });
  }
};

export const deleteNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    await NotificationModel.findOneAndDelete({ _id: id, recipient: userId });

    res.status(200).json({
      status: 'success',
      message: 'Notification deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to delete notification',
    });
  }
};
