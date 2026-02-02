import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { sendError } from '../utils/response';
import { AppError } from '../utils/errors';
import { config } from '../config/env';

export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('[ERROR]', {
    name: error.name,
    message: error.message,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Handle AppError instances
  if (error instanceof AppError) {
    sendError(
      res,
      error.statusCode,
      error.message,
      error.message
    );
    return;
  }

  // Handle MongoDB validation errors
  if (error.name === 'ValidationError') {
    const messages = Object.values((error as any).errors)
      .map((err: any) => err.message)
      .join(', ');

    sendError(
      res,
      StatusCodes.BAD_REQUEST,
      messages,
      'Validation failed'
    );
    return;
  }

  // Handle MongoDB cast errors
  if (error.name === 'CastError') {
    sendError(
      res,
      StatusCodes.BAD_REQUEST,
      'Invalid ID format',
      'Bad request'
    );
    return;
  }

  // Handle MongoDB duplicate key errors
  if ((error as any).code === 11000) {
    const field = Object.keys((error as any).keyPattern)[0];
    sendError(
      res,
      StatusCodes.CONFLICT,
      `${field} already exists`,
      'Conflict'
    );
    return;
  }

  // Default error response
  const statusCode = (error as any).statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const message =
    config.isDevelopment && error.message
      ? error.message
      : 'Internal Server Error';

  sendError(res, statusCode, message, 'An error occurred');
};

export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
