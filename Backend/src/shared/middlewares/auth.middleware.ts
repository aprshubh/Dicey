import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt.util';
import { ApiError } from '../errors/apiError';
import { HttpStatus } from '../constants/httpStatus';
import { UserRole } from '../../features/auth/auth.interface';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
      };
    }
  }
}

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    let token: string | undefined;

    // 1. Check Authorization Bearer header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
    // 2. Fallback to HttpOnly cookie if present
    else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, 'Authentication token missing. Please log in.');
    }

    const decoded = verifyAccessToken(token) as TokenPayload;

    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role as UserRole,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const authorizeRoles = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new ApiError(HttpStatus.UNAUTHORIZED, 'Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          HttpStatus.FORBIDDEN,
          `Access forbidden: User role '${req.user.role}' is not authorized to access this resource`
        )
      );
    }

    next();
  };
};
