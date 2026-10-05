import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../errors/apiError';

export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  next(ApiError.notFound(`Cannot ${req.method} ${req.originalUrl} - Route not found`));
};
