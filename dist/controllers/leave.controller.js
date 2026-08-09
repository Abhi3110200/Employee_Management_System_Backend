"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLeaveStatus = exports.applyLeave = exports.getLeaveRequests = void 0;
const leave_model_js_1 = require("../models/leave.model.js");
const user_model_js_1 = require("../models/user.model.js");
const getLeaveRequests = async (req, res) => {
    try {
        const { status, type, search } = req.query;
        const query = {};
        if (status && status !== 'all') {
            query.status = status;
        }
        if (type && type !== 'all') {
            query.type = type;
        }
        if (search) {
            query.$or = [
                { employeeName: { $regex: String(search), $options: 'i' } },
                { reason: { $regex: String(search), $options: 'i' } },
                { department: { $regex: String(search), $options: 'i' } },
            ];
        }
        const requests = await leave_model_js_1.LeaveRequestModel.find(query).sort({ createdAt: -1 });
        res.status(200).json({
            status: 'success',
            count: requests.length,
            data: requests,
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to fetch leave requests',
        });
    }
};
exports.getLeaveRequests = getLeaveRequests;
const applyLeave = async (req, res) => {
    try {
        const { type, startDate, endDate, reason } = req.body;
        const userId = req.user?.id;
        if (!startDate || !endDate || !reason) {
            res.status(400).json({
                status: 'error',
                message: 'Start date, end date, and reason are required',
            });
            return;
        }
        const currentUser = await user_model_js_1.User.findById(userId);
        if (!currentUser) {
            res.status(404).json({
                status: 'error',
                message: 'User profile not found',
            });
            return;
        }
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const daysCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        const newRequest = await leave_model_js_1.LeaveRequestModel.create({
            employee: currentUser._id,
            employeeName: currentUser.name,
            department: currentUser.department || 'Operations',
            type: type || 'casual',
            startDate: start,
            endDate: end,
            daysCount,
            reason,
            status: 'pending',
        });
        res.status(201).json({
            status: 'success',
            message: 'Leave application submitted successfully',
            data: newRequest,
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to submit leave request',
        });
    }
};
exports.applyLeave = applyLeave;
const updateLeaveStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, reviewComment } = req.body;
        const reviewerId = req.user?.id;
        if (!['approved', 'rejected'].includes(status)) {
            res.status(400).json({
                status: 'error',
                message: "Status must be either 'approved' or 'rejected'",
            });
            return;
        }
        const reviewer = await user_model_js_1.User.findById(reviewerId);
        const updatedRequest = await leave_model_js_1.LeaveRequestModel.findByIdAndUpdate(id, {
            status,
            reviewedBy: reviewer ? reviewer.name : 'Manager',
            reviewComment: reviewComment || '',
        }, { new: true });
        if (!updatedRequest) {
            res.status(404).json({
                status: 'error',
                message: 'Leave request record not found',
            });
            return;
        }
        res.status(200).json({
            status: 'success',
            message: `Leave request ${status} successfully`,
            data: updatedRequest,
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to update leave status',
        });
    }
};
exports.updateLeaveStatus = updateLeaveStatus;
//# sourceMappingURL=leave.controller.js.map