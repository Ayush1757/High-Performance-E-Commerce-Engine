import { Response } from 'express';

/**
 * Standard API response envelope.
 * All API responses use this format for consistency.
 */
interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

/** Send a success response */
export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode: number = 200,
  message?: string
): void => {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
    ...(message && { message }),
  };
  res.status(statusCode).json(response);
};

/** Send an error response */
export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 500,
  errors?: Record<string, string[]>
): void => {
  const response: ApiErrorResponse = {
    success: false,
    message,
    ...(errors && { errors }),
  };
  res.status(statusCode).json(response);
};

/**
 * Custom application error class with status code.
 * Use this to throw typed errors that the global error handler can interpret.
 */
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
