"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.importEmployeesCSV = exports.exportEmployeesCSV = exports.restoreEmployee = exports.deleteEmployee = exports.getEmployeeReportees = exports.updateEmployeeManager = exports.updateEmployee = exports.createEmployee = exports.getEmployeeById = exports.getAllEmployees = exports.getDashboardStats = void 0;
const user_model_js_1 = require("../models/user.model.js");
const hierarchy_utils_js_1 = require("../utils/hierarchy.utils.js");
const validation_utils_js_1 = require("../utils/validation.utils.js");
/**
 * @desc    Get Dashboard Statistics (Total, Active, Inactive, Departments)
 * @route   GET /api/employees/stats
 * @access  Private
 */
const getDashboardStats = async (_req, res) => {
    try {
        const totalEmployees = await user_model_js_1.User.countDocuments({ isDeleted: false });
        const activeEmployees = await user_model_js_1.User.countDocuments({ isDeleted: false, status: { $ne: 'inactive' } });
        const inactiveEmployees = await user_model_js_1.User.countDocuments({ isDeleted: false, status: 'inactive' });
        const uniqueDepartments = await user_model_js_1.User.distinct('department', { isDeleted: false });
        const departmentCount = uniqueDepartments.filter(Boolean).length;
        const departmentBreakdown = await user_model_js_1.User.aggregate([
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
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to fetch dashboard statistics',
        });
    }
};
exports.getDashboardStats = getDashboardStats;
/**
 * @desc    Get all employees with pagination, search, filter & sorting
 * @route   GET /api/employees
 * @access  Private (Super Admin & HR Manager)
 */
const getAllEmployees = async (req, res) => {
    try {
        const { search, department, role, status, showDeleted, sortBy = 'createdAt', sortOrder = 'desc', page = '1', limit = '10', } = req.query;
        const filter = {};
        // Soft delete filtering
        if (showDeleted === 'true') {
            filter.isDeleted = true;
        }
        else {
            filter.isDeleted = false;
        }
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { employeeId: { $regex: search, $options: 'i' } },
                { designation: { $regex: search, $options: 'i' } },
                { position: { $regex: search, $options: 'i' } },
            ];
        }
        if (department)
            filter.department = department;
        if (role)
            filter.role = role;
        if (status)
            filter.status = status;
        // Pagination calculations
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.max(1, parseInt(limit, 10) || 10);
        const skip = (pageNum - 1) * limitNum;
        // Sorting configuration
        const sortField = sortBy || 'createdAt';
        const sortDirection = sortOrder === 'asc' ? 1 : -1;
        const sortOptions = {};
        sortOptions[sortField] = sortDirection;
        const totalResults = await user_model_js_1.User.countDocuments(filter);
        const totalPages = Math.ceil(totalResults / limitNum) || 1;
        const employees = await user_model_js_1.User.find(filter)
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
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to fetch employees',
        });
    }
};
exports.getAllEmployees = getAllEmployees;
/**
 * @desc    Get single employee details by ID
 * @route   GET /api/employees/:id
 * @access  Private (Super Admin, HR Manager, or Self)
 */
const getEmployeeById = async (req, res) => {
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
        const employee = await user_model_js_1.User.findById(id)
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
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to fetch employee details',
        });
    }
};
exports.getEmployeeById = getEmployeeById;
/**
 * @desc    Create a new employee (with field validation)
 * @route   POST /api/employees
 * @access  Private (Super Admin & HR Manager)
 */
const createEmployee = async (req, res) => {
    try {
        // Payload Validation
        const validation = (0, validation_utils_js_1.validateEmployeePayload)(req.body, true);
        if (!validation.isValid) {
            res.status(400).json({
                status: 'error',
                message: validation.error,
            });
            return;
        }
        const { employeeId, name, email, password, phone, department, designation, position, salary, joiningDate, status, role, manager, profileImage, address, } = req.body;
        const existing = await user_model_js_1.User.findOne({ email: email.toLowerCase() });
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
        const newEmployee = new user_model_js_1.User({
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
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to create employee',
        });
    }
};
exports.createEmployee = createEmployee;
/**
 * @desc    Update employee details
 * @route   PUT /api/employees/:id
 * @access  Private (Super Admin, HR Manager, or Self limited)
 */
const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUser = req.user;
        if (!currentUser) {
            res.status(401).json({ status: 'error', message: 'Not authenticated' });
            return;
        }
        const employee = await user_model_js_1.User.findById(id);
        if (!employee || employee.isDeleted) {
            res.status(404).json({ status: 'error', message: 'Employee not found' });
            return;
        }
        // Payload Validation
        const validation = (0, validation_utils_js_1.validateEmployeePayload)(req.body, false);
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
            if (phone !== undefined)
                employee.phone = phone;
            if (address !== undefined)
                employee.address = address;
            if (profileImage !== undefined)
                employee.profileImage = profileImage;
            await employee.save();
            res.status(200).json({
                status: 'success',
                message: 'Profile updated successfully',
                employee,
            });
            return;
        }
        const { employeeId, name, email, phone, department, designation, position, salary, joiningDate, status, role, manager, profileImage, address, } = req.body;
        // Prevent circular reporting manager assignments
        if (manager !== undefined && manager !== null && manager !== '') {
            const managerId = Array.isArray(manager) ? String(manager[0]) : String(manager);
            const isCircular = await (0, hierarchy_utils_js_1.willCauseCircularReporting)(String(id), managerId);
            if (isCircular) {
                res.status(400).json({
                    status: 'error',
                    message: 'Circular reporting detected! An employee cannot report to themselves or a subordinate.',
                });
                return;
            }
            employee.manager = managerId;
        }
        else if (manager === null || manager === '') {
            employee.manager = null;
        }
        if (employeeId !== undefined)
            employee.employeeId = employeeId;
        if (name !== undefined)
            employee.name = name;
        if (email !== undefined)
            employee.email = email.toLowerCase();
        if (phone !== undefined)
            employee.phone = phone;
        if (department !== undefined)
            employee.department = department;
        if (designation !== undefined) {
            employee.designation = designation;
            employee.position = designation;
        }
        if (position !== undefined) {
            employee.position = position;
            employee.designation = position;
        }
        if (salary !== undefined)
            employee.salary = Number(salary);
        if (joiningDate !== undefined)
            employee.joiningDate = new Date(joiningDate);
        if (status !== undefined)
            employee.status = status;
        if (profileImage !== undefined)
            employee.profileImage = profileImage;
        if (address !== undefined)
            employee.address = address;
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
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to update employee',
        });
    }
};
exports.updateEmployee = updateEmployee;
/**
 * @desc    PATCH /api/employees/:id/manager
 * @access  Private (Super Admin & HR Manager)
 */
const updateEmployeeManager = async (req, res) => {
    try {
        const { id } = req.params;
        const { managerId, manager } = req.body;
        const targetManagerId = managerId !== undefined ? managerId : manager;
        const employee = await user_model_js_1.User.findById(id);
        if (!employee || employee.isDeleted) {
            res.status(404).json({ status: 'error', message: 'Employee not found' });
            return;
        }
        if (targetManagerId) {
            const cleanManagerId = String(targetManagerId);
            const isCircular = await (0, hierarchy_utils_js_1.willCauseCircularReporting)(String(id), cleanManagerId);
            if (isCircular) {
                res.status(400).json({
                    status: 'error',
                    message: 'Circular reporting detected! An employee cannot report to themselves or a subordinate.',
                });
                return;
            }
            employee.manager = cleanManagerId;
        }
        else {
            employee.manager = null;
        }
        await employee.save();
        await employee.populate('manager', 'name email role position designation');
        res.status(200).json({
            status: 'success',
            message: 'Reporting manager updated successfully',
            employee,
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to update reporting manager',
        });
    }
};
exports.updateEmployeeManager = updateEmployeeManager;
/**
 * @desc    GET /api/employees/:id/reportees
 * @access  Private
 */
const getEmployeeReportees = async (req, res) => {
    try {
        const { id } = req.params;
        const reportees = await user_model_js_1.User.find({ manager: id, isDeleted: false })
            .select('-refreshTokens')
            .sort({ name: 1 });
        res.status(200).json({
            status: 'success',
            results: reportees.length,
            reportees,
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to fetch reportees',
        });
    }
};
exports.getEmployeeReportees = getEmployeeReportees;
/**
 * @desc    Soft Delete employee record
 * @route   DELETE /api/employees/:id
 * @access  Private (Super Admin Only)
 */
const deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        if (req.user?.id === id) {
            res.status(400).json({
                status: 'error',
                message: 'Super Admin cannot delete their own active account',
            });
            return;
        }
        const employee = await user_model_js_1.User.findById(id);
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
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to delete employee',
        });
    }
};
exports.deleteEmployee = deleteEmployee;
/**
 * @desc    Restore soft-deleted employee
 * @route   PATCH /api/employees/:id/restore
 * @access  Private (Super Admin Only)
 */
const restoreEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const employee = await user_model_js_1.User.findById(id);
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
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to restore employee',
        });
    }
};
exports.restoreEmployee = restoreEmployee;
/**
 * @desc    Export active employees to CSV stream
 * @route   GET /api/employees/export/csv
 * @access  Private (Super Admin & HR Manager)
 */
const exportEmployeesCSV = async (_req, res) => {
    try {
        const employees = await user_model_js_1.User.find({ isDeleted: false })
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
            typeof emp.manager === 'object' && emp.manager ? `"${emp.manager.name}"` : '',
        ]);
        const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=employees_export.csv');
        res.status(200).send(csvContent);
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to export employees CSV',
        });
    }
};
exports.exportEmployeesCSV = exportEmployeesCSV;
/**
 * @desc    Import bulk employees from CSV JSON array
 * @route   POST /api/employees/import/csv
 * @access  Private (Super Admin & HR Manager)
 */
const importEmployeesCSV = async (req, res) => {
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
            const existing = await user_model_js_1.User.findOne({ email: String(email).toLowerCase() });
            if (existing) {
                skippedCount++;
                continue;
            }
            const newEmp = new user_model_js_1.User({
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
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to import CSV records',
        });
    }
};
exports.importEmployeesCSV = importEmployeesCSV;
//# sourceMappingURL=employee.controller.js.map