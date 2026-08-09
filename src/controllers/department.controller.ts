import { Request, Response } from 'express';
import { DepartmentModel } from '../models/department.model.js';
import { User } from '../models/user.model.js';

export const getDepartments = async (req: Request, res: Response): Promise<void> => {
  try {
    const departments = await DepartmentModel.find().sort({ name: 1 });
    res.status(200).json({
      status: 'success',
      count: departments.length,
      data: departments,
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch departments',
    });
  }
};

export const createDepartment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, code, leadName, totalBudget } = req.body;

    const existing = await DepartmentModel.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existing) {
      res.status(400).json({
        status: 'error',
        message: `Department '${name}' already exists`,
      });
      return;
    }

    const newDept = await DepartmentModel.create({
      name,
      code: code ? code.toUpperCase() : name.substring(0, 3).toUpperCase(),
      leadName: leadName || 'Assigned Lead',
      leadTitle: 'Department Lead',
      headcount: 1,
      openPositions: 1,
      totalBudget: Number(totalBudget) || 500000,
      spentBudget: 0,
      color: 'from-indigo-600 to-purple-600',
      projects: ['Initial Setup'],
    });

    res.status(201).json({
      status: 'success',
      message: 'Department created successfully',
      data: newDept,
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to create department',
    });
  }
};

export const getDepartmentRoster = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const dept = await DepartmentModel.findById(id);
    if (!dept) {
      res.status(404).json({
        status: 'error',
        message: 'Department not found',
      });
      return;
    }

    const members = await User.find({ department: dept.name, isDeleted: false }).select(
      'name email designation role profileImage'
    );

    res.status(200).json({
      status: 'success',
      department: dept,
      count: members.length,
      members,
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch department roster',
    });
  }
};
