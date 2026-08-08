import { Request, Response } from 'express';
import { User, IUser } from '../models/user.model.js';

interface HierarchyNode {
  id: string;
  employeeId?: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  designation?: string;
  position?: string;
  profileImage?: string;
  status?: string;
  directReportsCount: number;
  directReports?: HierarchyNode[];
}

/**
 * Helper to recursively build tree nodes for an employee and their direct reports
 */
const buildTreeNode = async (employee: IUser): Promise<HierarchyNode> => {
  const reports = await User.find({ manager: employee._id })
    .select('-refreshTokens')
    .sort({ name: 1 });

  const childrenNodes: HierarchyNode[] = [];
  for (const report of reports) {
    const childNode = await buildTreeNode(report);
    childrenNodes.push(childNode);
  }

  return {
    id: employee._id.toString(),
    employeeId: employee.employeeId,
    name: employee.name,
    email: employee.email,
    role: employee.role,
    department: employee.department,
    designation: employee.designation || employee.position,
    position: employee.position || employee.designation,
    profileImage: employee.profileImage,
    status: employee.status,
    directReportsCount: reports.length,
    directReports: childrenNodes,
  };
};

/**
 * @desc    Get full organizational hierarchy tree
 * @route   GET /api/hierarchy/tree
 * @access  Private
 */
export const getHierarchyTree = async (_req: Request, res: Response): Promise<void> => {
  try {
    // Find top-level managers (manager is null or role is super_admin without manager)
    const rootEmployees = await User.find({
      $or: [{ manager: null }, { manager: { $exists: false } }],
    })
      .select('-refreshTokens')
      .sort({ role: 1, name: 1 });

    const tree: HierarchyNode[] = [];
    for (const root of rootEmployees) {
      const node = await buildTreeNode(root);
      tree.push(node);
    }

    res.status(200).json({
      status: 'success',
      tree,
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to generate organizational tree',
    });
  }
};

/**
 * @desc    Get direct reports for a specific manager ID
 * @route   GET /api/employees/:id/direct-reports
 * @access  Private
 */
export const getDirectReports = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const manager = await User.findById(id).select('name email role designation');
    if (!manager) {
      res.status(404).json({
        status: 'error',
        message: 'Manager record not found',
      });
      return;
    }

    const directReports = await User.find({ manager: id })
      .select('-refreshTokens')
      .sort({ name: 1 });

    res.status(200).json({
      status: 'success',
      manager: {
        id: manager._id,
        name: manager.name,
        email: manager.email,
        role: manager.role,
      },
      results: directReports.length,
      directReports,
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch direct reports',
    });
  }
};
