import { Request, Response } from 'express';
import { GoalModel, ReviewModel } from '../models/performance.model.js';
import { NotificationModel } from '../models/notification.model.js';
import { User } from '../models/user.model.js';

export const getGoals = async (req: Request, res: Response): Promise<void> => {
  try {
    const goals = await GoalModel.find().sort({ createdAt: -1 });
    res.status(200).json({
      status: 'success',
      count: goals.length,
      data: goals,
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch performance goals',
    });
  }
};

export const createGoal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { employeeName, department, title, category, dueDate, progress } = req.body;
    const userId = req.user?.id;

    const assignedUser = await User.findOne({ name: employeeName }) || await User.findById(userId);

    const newGoal = await GoalModel.create({
      employee: assignedUser ? assignedUser._id : userId,
      employeeName: employeeName || (assignedUser ? assignedUser.name : 'Assigned Staff'),
      department: department || (assignedUser ? assignedUser.department : 'Engineering'),
      title,
      category: category || 'OKR',
      dueDate: dueDate ? new Date(dueDate) : new Date('2026-09-30'),
      progress: Number(progress) || 0,
      status: Number(progress) === 100 ? 'completed' : 'in_progress',
    });

    if (assignedUser) {
      await NotificationModel.create({
        recipient: assignedUser._id,
        type: 'task_assigned',
        title: 'New Goal / Task Assigned',
        message: `You were assigned goal "${title}" (${category || 'OKR'}). Target due: ${dueDate || 'Sep 30'}.`,
        linkHref: '/performance',
      });
    }

    res.status(201).json({
      status: 'success',
      message: 'Performance goal assigned successfully',
      data: newGoal,
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to create goal',
    });
  }
};

export const updateGoalProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { progress } = req.body;

    const progNum = Number(progress);
    const status = progNum === 100 ? 'completed' : progNum < 40 ? 'behind' : 'in_progress';

    const updatedGoal = await GoalModel.findByIdAndUpdate(
      id,
      { progress: progNum, status },
      { returnDocument: 'after' }
    );

    if (!updatedGoal) {
      res.status(404).json({
        status: 'error',
        message: 'Goal not found',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: updatedGoal,
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to update goal progress',
    });
  }
};

export const getReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const reviews = await ReviewModel.find().sort({ rating: -1 });
    res.status(200).json({
      status: 'success',
      count: reviews.length,
      data: reviews,
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch reviews',
    });
  }
};

export const createOrUpdateReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { employeeId, rating, strengths, growthAreas, quarter } = req.body;
    const reviewerId = req.user?.id;

    const reviewer = await User.findById(reviewerId);
    const targetUser = await User.findById(employeeId) || await User.findOne({ name: req.body.employeeName });

    if (!targetUser) {
      res.status(404).json({
        status: 'error',
        message: 'Employee target not found',
      });
      return;
    }

    const review = await ReviewModel.findOneAndUpdate(
      { employee: targetUser._id, quarter: quarter || 'Q3 2026' },
      {
        employee: targetUser._id,
        employeeName: targetUser.name,
        designation: targetUser.designation || 'Staff Member',
        department: targetUser.department || 'Engineering',
        rating: Number(rating),
        quarter: quarter || 'Q3 2026',
        reviewStatus: 'completed',
        strengths: strengths || '',
        growthAreas: growthAreas || '',
        reviewedBy: reviewer ? reviewer.name : 'Manager',
      },
      { upsert: true, returnDocument: 'after' }
    );

    // Trigger Notification to Employee
    await NotificationModel.create({
      recipient: targetUser._id,
      type: 'performance_review',
      title: `${quarter || 'Q3'} Performance Review Finalized`,
      message: `Your quarterly performance score of ${rating} / 5.0 was recorded by ${reviewer ? reviewer.name : 'Manager'}.`,
      linkHref: '/performance',
    });

    res.status(200).json({
      status: 'success',
      message: 'Performance review evaluation saved',
      data: review,
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to save review',
    });
  }
};
