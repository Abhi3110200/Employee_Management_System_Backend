"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDirectReports = exports.getHierarchyTree = void 0;
const user_model_js_1 = require("../models/user.model.js");
/**
 * Helper to recursively build tree nodes for an employee and their direct reports
 */
const buildTreeNode = async (employee) => {
    const reports = await user_model_js_1.User.find({ manager: employee._id })
        .select('-refreshTokens')
        .sort({ name: 1 });
    const childrenNodes = [];
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
const getHierarchyTree = async (_req, res) => {
    try {
        // Find top-level managers (manager is null or role is super_admin without manager)
        const rootEmployees = await user_model_js_1.User.find({
            $or: [{ manager: null }, { manager: { $exists: false } }],
        })
            .select('-refreshTokens')
            .sort({ role: 1, name: 1 });
        const tree = [];
        for (const root of rootEmployees) {
            const node = await buildTreeNode(root);
            tree.push(node);
        }
        res.status(200).json({
            status: 'success',
            tree,
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to generate organizational tree',
        });
    }
};
exports.getHierarchyTree = getHierarchyTree;
/**
 * @desc    Get direct reports for a specific manager ID
 * @route   GET /api/employees/:id/direct-reports
 * @access  Private
 */
const getDirectReports = async (req, res) => {
    try {
        const { id } = req.params;
        const manager = await user_model_js_1.User.findById(id).select('name email role designation');
        if (!manager) {
            res.status(404).json({
                status: 'error',
                message: 'Manager record not found',
            });
            return;
        }
        const directReports = await user_model_js_1.User.find({ manager: id })
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
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to fetch direct reports',
        });
    }
};
exports.getDirectReports = getDirectReports;
//# sourceMappingURL=hierarchy.controller.js.map