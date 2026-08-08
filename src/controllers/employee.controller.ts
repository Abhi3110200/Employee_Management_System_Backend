import { Request, Response } from 'express';
import { User } from '../models/user.model.js';
import { willCauseCircularReporting } from '../utils/hierarchy.utils.js';
import { validateEmployeePayload } from '../utils/validation.utils.js';

/**
 * @desc    Get Dashboard Statistics (Total, Active, Inactive, Departments)
 * @route   GET /api/employees/stats
 * @access  Private
 */
export const getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const totalEmployees = await User.countDocuments({ isDeleted: false });
    const activeEmployees = await User.countDocuments({ isDeleted: false, status: { $ne: 'inactive' } });
    const inactiveEmployees = await User.countDocuments({ isDeleted: false, status: 'inactive' });

    const uniqueDepartments = await User.distinct('department', { isDeleted: false });
    const departmentCount = uniqueDepartments.filter(Boolean).length;

    const departmentBreakdown = await User.aggregate([
      { $match: { isDeleted: false, department: { $exists: true, $ne: '' } } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $project: { department: '$_id', count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      status: 'success',
      stats: {
        totalEmployees,
        activeEmployees,
        inactiveEmployees,
        departmentCount,
        departmentBreakdown,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch dashboard statistics',
    });
  }
};

/**
 * @desc    Get all employees with pagination, search, filter & sorting
 * @route   GET /api/employees
 * @access  Private (Super Admin & HR Manager)
 */
export const getAllEmployees = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      search,
      department,
      role,
      status,
      showDeleted,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = '1',
      limit = '10',
    } = req.query;

    const filter: any = {};

    // Soft delete filtering
    if (showDeleted === 'true') {
      filter.isDeleted = true;
    } else {
      filter.isDeleted = false;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search as string, $options: 'i' } },
        { email: { $regex: search as string, $options: 'i' } },
        { employeeId: { $regex: search as string, $options: 'i' } },
        { designation: { $regex: search as string, $options: 'i' } },
        { position: { $regex: search as string, $options: 'i' } },
      ];
    }

    if (department) filter.department = department;
    if (role) filter.role = role;
    if (status) filter.status = status;

    // Pagination calculations
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit as string, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    // Sorting configuration
    const sortField = (sortBy as string) || 'createdAt';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    const sortOptions: any = {};
    sortOptions[sortField] = sortDirection;

    const totalResults = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalResults / limitNum) || 1;

    const employees = await User.find(filter)
      .select('-refreshTokens')
      .populate('manager', 'name email role position designation')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      status: 'success',
      results: employees.length,
      pagination: {
        totalResults,
        totalPages,
        currentPage: pageNum,
        pageLimit: limitNum,
      },
      employees,
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch employees',
    });
  }
};

/**
 * @desc    Get single employee details by ID
 * @route   GET /api/employees/:id
 * @access  Private (Super Admin, HR Manager, or Self)
 */
export const getEmployeeById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check self-access permission for Employee role
    if (req.user?.role === 'employee' && req.user.id !== id) {
      res.status(403).json({
        status: 'error',
        code: 'FORBIDDEN',
        message: 'Employees can only view their own profile',
      });
      return;
    }

    const employee = await User.findById(id)
      .select('-refreshTokens')
      .populate('manager', 'name email role position designation');

    if (!employee || employee.isDeleted) {
      res.status(404).json({
        status: 'error',
        message: 'Employee not found',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      employee,
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch employee details',
    });
  }
};

/**
 * @desc    Create a new employee (with field validation)
 * @route   POST /api/employees
 * @access  Private (Super Admin & HR Manager)
 */
export const createEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    // Payload Validation
    const validation = validateEmployeePayload(req.body, true);
    if (!validation.isValid) {
      res.status(400).json({
        status: 'error',
        message: validation.error,
      });
      return;
    }

    const {
      employeeId,
      name,
      email,
      password,
      phone,
      department,
      designation,
      position,
      salary,
      joiningDate,
      status,
      role,
      manager,
      profileImage,
      address,
    } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(400).json({
        status: 'error',
        message: 'An employee with this email already exists',
      });
      return;
    }

    // Role safety check for HR Manager
    let assignedRole = role || 'employee';
    if (req.user?.role === 'hr_manager' && assignedRole === 'super_admin') {
      res.status(403).json({
        status: 'error',
        message: 'HR Managers cannot assign the Super Admin role',
      });
      return;
    }

    const newEmployee = new User({
      employeeId,
      name,
      email,
      password,
      phone: phone || '',
      department: department || 'Engineering',
      designation: designation || position || 'Staff Member',
      position: position || designation || 'Staff Member',
      salary: salary !== undefined ? Number(salary) : 0,
      joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
      status: status || 'active',
      role: assignedRole,
      manager: manager || null,
      profileImage: profileImage || '',
      address: address || '',
      refreshTokens: [],
    });

    await newEmployee.save();

    res.status(201).json({
      status: 'success',
      message: 'Employee created successfully',
      employee: newEmployee,
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to create employee',
    });
  }
};

/**
 * @desc    Update employee details
 * @route   PUT /api/employees/:id
 * @access  Private (Super Admin, HR Manager, or Self limited)
 */
export const updateEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    if (!currentUser) {
      res.status(401).json({ status: 'error', message: 'Not authenticated' });
      return;
    }

    const employee = await User.findById(id);
    if (!employee || employee.isDeleted) {
      res.status(404).json({ status: 'error', message: 'Employee not found' });
      return;
    }

    // Payload Validation
    const validation = validateEmployeePayload(req.body, false);
    if (!validation.isValid) {
      res.status(400).json({
        status: 'error',
        message: validation.error,
      });
      return;
    }

    // Employee Role: Can only update own profile limited fields
    if (currentUser.role === 'employee') {
      if (currentUser.id !== id) {
        res.status(403).json({
          status: 'error',
          code: 'FORBIDDEN',
          message: 'Employees can only edit their own profile',
        });
        return;
      }

      const { phone, address, profileImage } = req.body;
      if (phone !== undefined) employee.phone = phone;
      if (address !== undefined) employee.address = address;
      if (profileImage !== undefined) employee.profileImage = profileImage;

      await employee.save();

      res.status(200).json({
        status: 'success',
        message: 'Profile updated successfully',
        employee,
      });
      return;
    }

    const {
      employeeId,
      name,
      email,
      phone,
      department,
      designation,
      position,
      salary,
      joiningDate,
      status,
      role,
      manager,
      profileImage,
      address,
    } = req.body;

    // Prevent circular reporting manager assignments
    if (manager !== undefined && manager !== null && manager !== '') {
      const managerId = Array.isArray(manager) ? String(manager[0]) : String(manager);
      const isCircular = await willCauseCircularReporting(String(id), managerId);
      if (isCircular) {
        res.status(400).json({
          status: 'error',
          message: 'Circular reporting detected! An employee cannot report to themselves or a subordinate.',
        });
        return;
      }
      employee.manager = managerId as any;
    } else if (manager === null || manager === '') {
      employee.manager = null;
    }

    if (employeeId !== undefined) employee.employeeId = employeeId;
    if (name !== undefined) employee.name = name;
    if (email !== undefined) employee.email = email.toLowerCase();
    if (phone !== undefined) employee.phone = phone;
    if (department !== undefined) employee.department = department;
    if (designation !== undefined) {
      employee.designation = designation;
      employee.position = designation;
    }
    if (position !== undefined) {
      employee.position = position;
      employee.designation = position;
    }
    if (salary !== undefined) employee.salary = Number(salary);
    if (joiningDate !== undefined) employee.joiningDate = new Date(joiningDate);
    if (status !== undefined) employee.status = status;
    if (profileImage !== undefined) employee.profileImage = profileImage;
    if (address !== undefined) employee.address = address;

    if (role !== undefined) {
      if (currentUser.role === 'hr_manager' && role === 'super_admin') {
        res.status(403).json({
          status: 'error',
          message: 'HR Managers cannot assign the Super Admin role',
        });
        return;
      }

      if (currentUser.role === 'hr_manager' && employee.role === 'super_admin') {
        res.status(403).json({
          status: 'error',
          message: 'HR Managers cannot modify Super Admin accounts',
        });
        return;
      }

      employee.role = role;
    }

    await employee.save();

    res.status(200).json({
      status: 'success',
      message: 'Employee updated successfully',
      employee,
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to update employee',
    });
  }
};

/**
 * @desc    PATCH /api/employees/:id/manager
 * @access  Private (Super Admin & HR Manager)
 */
export const updateEmployeeManager = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { managerId, manager } = req.body;
    const targetManagerId = managerId !== undefined ? managerId : manager;

    const employee = await User.findById(id);
    if (!employee || employee.isDeleted) {
      res.status(404).json({ status: 'error', message: 'Employee not found' });
      return;
    }

    if (targetManagerId) {
      const cleanManagerId = String(targetManagerId);
      const isCircular = await willCauseCircularReporting(String(id), cleanManagerId);
      if (isCircular) {
        res.status(400).json({
          status: 'error',
          message: 'Circular reporting detected! An employee cannot report to themselves or a subordinate.',
        });
        return;
      }
      employee.manager = cleanManagerId as any;
    } else {
      employee.manager = null;
    }

    await employee.save();
    await employee.populate('manager', 'name email role position designation');

    res.status(200).json({
      status: 'success',
      message: 'Reporting manager updated successfully',
      employee,
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to update reporting manager',
    });
  }
};

/**
 * @desc    GET /api/employees/:id/reportees
 * @access  Private
 */
export const getEmployeeReportees = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const reportees = await User.find({ manager: id, isDeleted: false })
      .select('-refreshTokens')
      .sort({ name: 1 });

    res.status(200).json({
      status: 'success',
      results: reportees.length,
      reportees,
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch reportees',
    });
  }
};

/**
 * @desc    Soft Delete employee record
 * @route   DELETE /api/employees/:id
 * @access  Private (Super Admin Only)
 */
export const deleteEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (req.user?.id === id) {
      res.status(400).json({
        status: 'error',
        message: 'Super Admin cannot delete their own active account',
      });
      return;
    }

    const employee = await User.findById(id);
    if (!employee || employee.isDeleted) {
      res.status(404).json({
        status: 'error',
        message: 'Employee not found',
      });
      return;
    }

    employee.isDeleted = true;
    employee.deletedAt = new Date();
    await employee.save();

    res.status(200).json({
      status: 'success',
      message: 'Employee soft-deleted successfully',
      employeeId: employee._id,
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to delete employee',
    });
  }
};

/**
 * @desc    Restore soft-deleted employee
 * @route   PATCH /api/employees/:id/restore
 * @access  Private (Super Admin Only)
 */
export const restoreEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const employee = await User.findById(id);
    if (!employee) {
      res.status(404).json({ status: 'error', message: 'Employee not found' });
      return;
    }

    employee.isDeleted = false;
    employee.deletedAt = null;
    await employee.save();

    res.status(200).json({
      status: 'success',
      message: 'Employee restored successfully',
      employee,
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to restore employee',
    });
  }
};

/**
 * @desc    Export active employees to CSV stream
 * @route   GET /api/employees/export/csv
 * @access  Private (Super Admin & HR Manager)
 */
export const exportEmployeesCSV = async (_req: Request, res: Response): Promise<void> => {
  try {
    const employees = await User.find({ isDeleted: false })
      .select('-refreshTokens')
      .populate('manager', 'name email')
      .sort({ createdAt: -1 });

    const headers = [
      'Employee ID',
      'Full Name',
      'Email',
      'Phone',
      'Department',
      'Designation',
      'Salary',
      'Joining Date',
      'Status',
      'Role',
      'Reporting Manager',
    ];

    const rows = employees.map((emp) => [
      emp.employeeId || '',
      `"${emp.name.replace(/"/g, '""')}"`,
      emp.email,
      emp.phone || '',
      `"${(emp.department || '').replace(/"/g, '""')}"`,
      `"${(emp.designation || emp.position || '').replace(/"/g, '""')}"`,
      emp.salary || 0,
      emp.joiningDate ? new Date(emp.joiningDate).toISOString().split('T')[0] : '',
      emp.status || 'active',
      emp.role,
      typeof emp.manager === 'object' && emp.manager ? `"${(emp.manager as any).name}"` : '',
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=employees_export.csv');
    res.status(200).send(csvContent);
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to export employees CSV',
    });
  }
};

/**
 * @desc    Import bulk employees from CSV JSON array
 * @route   POST /api/employees/import/csv
 * @access  Private (Super Admin & HR Manager)
 */
export const importEmployeesCSV = async (req: Request, res: Response): Promise<void> => {
  try {
    const { rows } = req.body; // Expect array of row objects from client CSV parser

    if (!Array.isArray(rows) || rows.length === 0) {
      res.status(400).json({
        status: 'error',
        message: 'CSV import payload must contain an array of row objects',
      });
      return;
    }

    let createdCount = 0;
    let skippedCount = 0;

    for (const row of rows) {
      const name = row.name || row['Full Name'] || row['Name'];
      const email = row.email || row['Email'];
      const password = row.password || 'default123';
      const phone = row.phone || row['Phone'] || '';
      const department = row.department || row['Department'] || 'Engineering';
      const designation = row.designation || row['Designation'] || row['Position'] || 'Staff Member';
      const salary = Number(row.salary || row['Salary'] || 0);

      if (!name || !email) {
        skippedCount++;
        continue;
      }

      const existing = await User.findOne({ email: String(email).toLowerCase() });
      if (existing) {
        skippedCount++;
        continue;
      }

      const newEmp = new User({
        name,
        email: String(email).toLowerCase(),
        password,
        phone,
        department,
        designation,
        position: designation,
        salary,
        role: 'employee',
        status: 'active',
      });

      await newEmp.save();
      createdCount++;
    }

    res.status(200).json({
      status: 'success',
      message: `Bulk CSV import complete: ${createdCount} created, ${skippedCount} skipped`,
      summary: { createdCount, skippedCount },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to import CSV records',
    });
  }
};
