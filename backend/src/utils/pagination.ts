import { PaginationOptions } from '../types';

export const getPaginationOptions = (
  page: number = 1,
  limit: number = 10
): PaginationOptions => {
  const pageNum = Math.max(1, page);
  const limitNum = Math.min(Math.max(1, limit), 100);
  const skip = (pageNum - 1) * limitNum;

  return {
    page: pageNum,
    limit: limitNum,
    skip,
  };
};

export const calculatePaginationMetadata = (
  page: number,
  limit: number,
  total: number
) => {
  return {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  };
};
