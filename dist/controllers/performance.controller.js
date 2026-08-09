"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrUpdateReview = exports.getReviews = exports.updateGoalProgress = exports.createGoal = exports.getGoals = void 0;
const performance_model_js_1 = require("../models/performance.model.js");
const notification_model_js_1 = require("../models/notification.model.js");
const user_model_js_1 = require("../models/user.model.js");
const getGoals = async (req, res) => {
    try {
        const goals = await performance_model_js_1.GoalModel.find().sort({ createdAt: -1 });
        res.status(200).json({
            status: 'success',
            count: goals.length,
            data: goals,
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to fetch performance goals',
        });
    }
};
exports.getGoals = getGoals;
const createGoal = async (req, res) => {
    try {
        const { employeeName, department, title, category, dueDate, progress } = req.body;
        const userId = req.user?.id;
        const assignedUser = await user_model_js_1.User.findOne({ name: employeeName }) || await user_model_js_1.User.findById(userId);
        const newGoal = await performance_model_js_1.GoalModel.create({
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
            await notification_model_js_1.NotificationModel.create({
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
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to create goal',
        });
    }
};
exports.createGoal = createGoal;
const updateGoalProgress = async (req, res) => {
    try {
        const { id } = req.params;
        const { progress } = req.body;
        const progNum = Number(progress);
        const status = progNum === 100 ? 'completed' : progNum < 40 ? 'behind' : 'in_progress';
        const updatedGoal = await performance_model_js_1.GoalModel.findByIdAndUpdate(id, { progress: progNum, status }, { new: true });
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
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to update goal progress',
        });
    }
};
exports.updateGoalProgress = updateGoalProgress;
const getReviews = async (req, res) => {
    try {
        const reviews = await performance_model_js_1.ReviewModel.find().sort({ rating: -1 });
        res.status(200).json({
            status: 'success',
            count: reviews.length,
            data: reviews,
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to fetch reviews',
        });
    }
};
exports.getReviews = getReviews;
const createOrUpdateReview = async (req, res) => {
    try {
        const { employeeId, rating, strengths, growthAreas, quarter } = req.body;
        const reviewerId = req.user?.id;
        const reviewer = await user_model_js_1.User.findById(reviewerId);
        const targetUser = await user_model_js_1.User.findById(employeeId) || await user_model_js_1.User.findOne({ name: req.body.employeeName });
        if (!targetUser) {
            res.status(404).json({
                status: 'error',
                message: 'Employee target not found',
            });
            return;
        }
        const review = await performance_model_js_1.ReviewModel.findOneAndUpdate({ employee: targetUser._id, quarter: quarter || 'Q3 2026' }, {
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
        }, { upsert: true, new: true });
        // Trigger Notification to Employee
        await notification_model_js_1.NotificationModel.create({
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
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to save review',
        });
    }
};
exports.createOrUpdateReview = createOrUpdateReview;
//# sourceMappingURL=performance.controller.js.map