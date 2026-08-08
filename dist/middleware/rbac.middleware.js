"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restrictRoleAssignment = void 0;
/**
 * Middleware ensuring that only super_admin can assign super_admin or hr_manager roles,
 * and hr_manager cannot create or elevate users to super_admin.
 */
const restrictRoleAssignment = (req, res, next) => {
    const targetRole = req.body.role;
    if (targetRole) {
        if (targetRole === 'super_admin' && req.user?.role !== 'super_admin') {
            res.status(403).json({
                status: 'error',
                code: 'FORBIDDEN',
                message: 'Only Super Admin can assign the Super Admin role',
            });
            return;
        }
    }
    next();
};
exports.restrictRoleAssignment = restrictRoleAssignment;
//# sourceMappingURL=rbac.middleware.js.map