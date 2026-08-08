"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.protect = void 0;
const token_utils_js_1 = require("../utils/token.utils.js");
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
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({
                status: 'error',
                code: 'FORBIDDEN',
                message: `User role '${req.user?.role || 'unknown'}' is not authorized to access this resource`,
            });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
//# sourceMappingURL=auth.middleware.js.map