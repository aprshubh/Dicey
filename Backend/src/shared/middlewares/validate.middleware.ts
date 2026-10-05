import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny } from 'zod';

export interface RequestValidationSchema {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

export const validateRequest = (schema: RequestValidationSchema) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }
      if (schema.query) {
        const parsedQuery = await schema.query.parseAsync(req.query);
        req.query = parsedQuery as unknown as typeof req.query;
      }
      if (schema.params) {
        const parsedParams = await schema.params.parseAsync(req.params);
        req.params = parsedParams as unknown as typeof req.params;
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
