import { Request, Response } from 'express';
import { LeaveRequestModel } from '../models/leave.model.js';
import { User } from '../models/user.model.js';

export const getLeaveRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, type, search } = req.query;
    const query: any = {};

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

    const requests = await LeaveRequestModel.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      count: requests.length,
      data: requests,
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch leave requests',
    });
  }
};

export const applyLeave = async (req: Request, res: Response): Promise<void> => {
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

    const currentUser = await User.findById(userId);
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

    const newRequest = await LeaveRequestModel.create({
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
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to submit leave request',
    });
  }
};

export const updateLeaveStatus = async (req: Request, res: Response): Promise<void> => {
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

    const reviewer = await User.findById(reviewerId);
    const updatedRequest = await LeaveRequestModel.findByIdAndUpdate(
      id,
      {
        status,
        reviewedBy: reviewer ? reviewer.name : 'Manager',
        reviewComment: reviewComment || '',
      },
      { new: true }
    );

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
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to update leave status',
    });
  }
};
