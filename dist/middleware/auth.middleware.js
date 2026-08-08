"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.protect = void 0;
const token_utils_js_1 = require("../utils/token.utils.js");
const user_model_js_1 = require("../models/user.model.js");
const protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            res.status(401).json({
                status: 'error',
                code: 'UNAUTHORIZED',
                message: 'Authentication required. No token provided.',
            });
            return;
        }
        const decoded = (0, token_utils_js_1.verifyAccessToken)(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        if (error.name === 'TokenExpiredError') {
            res.status(401).json({
                status: 'error',
                code: 'TOKEN_EXPIRED',
                message: 'Access token expired',
            });
            return;
        }
        res.status(401).json({
            status: 'error',
            code: 'INVALID_TOKEN',
            message: 'Invalid access token',
        });
    }
};
exports.protect = protect;
/**
 * Authorization middleware that queries the database directly
 * to verify the user's current role stored in MongoDB.
 */
const authorize = (...roles) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                res.status(401).json({
                    status: 'error',
                    code: 'UNAUTHORIZED',
                    message: 'Not authenticated',
                });
                return;
            }
            // Query MongoDB directly to check current role assigned to the user
            const dbUser = await user_model_js_1.User.findById(req.user.id).select('role');
            if (!dbUser || !roles.includes(dbUser.role)) {
                res.status(403).json({
                    status: 'error',
                    code: 'FORBIDDEN',
                    message: `User role '${dbUser?.role || 'unknown'}' is not authorized to access this resource`,
                });
                return;
            }
            // Ensure req.user reflects latest DB role
            req.user.role = dbUser.role;
            next();
        }
        catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message || 'Authorization check failed',
            });
        }
    };
};
exports.authorize = authorize;
//# sourceMappingURL=auth.middleware.js.map