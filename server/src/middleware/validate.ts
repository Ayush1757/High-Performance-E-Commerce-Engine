import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError, ZodIssue } from 'zod';

/**
 * Middleware factory that validates request body against a Zod schema.
 * Returns 400 with structured error messages on validation failure.
 */
export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string[]> = {};
        (error as ZodError).issues.forEach((issue: ZodIssue) => {
          const path = issue.path.join('.');
          if (!errors[path]) {
            errors[path] = [];
          }
          errors[path].push(issue.message);
        });

        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
        });
        return;
      }
      next(error);
    }
  };
};

/**
 * Middleware factory that validates request query params against a Zod schema.
 */
export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.query = schema.parse(req.query) as typeof req.query;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string[]> = {};
        (error as ZodError).issues.forEach((issue: ZodIssue) => {
          const path = issue.path.join('.');
          if (!errors[path]) {
            errors[path] = [];
          }
          errors[path].push(issue.message);
        });

        res.status(400).json({
          success: false,
          message: 'Invalid query parameters',
          errors,
        });
        return;
      }
      next(error);
    }
  };
};
