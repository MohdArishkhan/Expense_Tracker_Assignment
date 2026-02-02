import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ApiResponse, PaginatedResponse } from '../types';

export const sendSuccess = <T = any>(
  res: Response,
  data: T,
  message: string = 'Success',
  statusCode: StatusCodes = StatusCodes.OK
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    statusCode,
  };
  return res.status(statusCode).json(response);
};

export const sendPaginatedSuccess = <T = any>(
  res: Response,
  data: T[],
  pagination: PaginatedResponse<T>['pagination'],
  message: string = 'Success',
  statusCode: StatusCodes = StatusCodes.OK
): Response => {
  const response: PaginatedResponse<T> & { success: boolean; message: string } =
    {
      success: true,
      message,
      data,
      pagination,
    };
  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  statusCode: StatusCodes = StatusCodes.INTERNAL_SERVER_ERROR,
  error: string = 'Internal Server Error',
  message: string = 'An error occurred'
): Response => {
  const response: ApiResponse = {
    success: false,
    message,
    error,
    statusCode,
  };
  return res.status(statusCode).json(response);
};

export const sendCreated = <T = any>(
  res: Response,
  data: T,
  message: string = 'Created successfully'
): Response => {
  return sendSuccess(res, data, message, StatusCodes.CREATED);
};
