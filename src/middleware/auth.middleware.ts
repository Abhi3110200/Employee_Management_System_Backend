import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/token.utils.js';
import { User } from '../models/user.model.js';

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

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

    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error: any) {
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

/**
 * Authorization middleware that queries the database directly
 * to verify the user's current role stored in MongoDB.
 */
export const authorize = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
      const dbUser = await User.findById(req.user.id).select('role');
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
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: error.message || 'Authorization check failed',
      });
    }
  };
};
