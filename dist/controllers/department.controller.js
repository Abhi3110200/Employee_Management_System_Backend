"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDepartmentRoster = exports.createDepartment = exports.getDepartments = void 0;
const department_model_js_1 = require("../models/department.model.js");
const user_model_js_1 = require("../models/user.model.js");
const getDepartments = async (req, res) => {
    try {
        const departments = await department_model_js_1.DepartmentModel.find().sort({ name: 1 });
        res.status(200).json({
            status: 'success',
            count: departments.length,
            data: departments,
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to fetch departments',
        });
    }
};
exports.getDepartments = getDepartments;
const createDepartment = async (req, res) => {
    try {
        const { name, code, leadName, totalBudget } = req.body;
        const existing = await department_model_js_1.DepartmentModel.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
        if (existing) {
            res.status(400).json({
                status: 'error',
                message: `Department '${name}' already exists`,
            });
            return;
        }
        const newDept = await department_model_js_1.DepartmentModel.create({
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
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to create department',
        });
    }
};
exports.createDepartment = createDepartment;
const getDepartmentRoster = async (req, res) => {
    try {
        const { id } = req.params;
        const dept = await department_model_js_1.DepartmentModel.findById(id);
        if (!dept) {
            res.status(404).json({
                status: 'error',
                message: 'Department not found',
            });
            return;
        }
        const members = await user_model_js_1.User.find({ department: dept.name, isDeleted: false }).select('name email designation role profileImage');
        res.status(200).json({
            status: 'success',
            department: dept,
            count: members.length,
            members,
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to fetch department roster',
        });
    }
};
exports.getDepartmentRoster = getDepartmentRoster;
//# sourceMappingURL=department.controller.js.map