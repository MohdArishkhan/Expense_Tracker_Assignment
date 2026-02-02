import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ExpenseService } from '../services/expenseService';
import { asyncHandler } from '../middleware/errorHandler';
import { sendSuccess, sendCreated } from '../utils/response';
import {
  validateData,
  expenseCreateSchema,
  paginationSchema,
} from '../utils/validators';
import { getPaginationOptions, calculatePaginationMetadata } from '../utils/pagination';
import { IExpense } from '../types';

export class ExpenseController {
  /**
   * POST /expenses - Create a new expense
   */
  static createExpense = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const expenseData = validateData<IExpense>(
        req.body,
        expenseCreateSchema
      );

      const expense = await ExpenseService.createExpense(expenseData);

      sendCreated(res, expense, 'Expense created successfully');
    }
  );

  /**
   * GET /expenses/:id - Get expense by ID
   */
  static getExpense = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;

      const expense = await ExpenseService.getExpenseById(id);

      sendSuccess(res, expense, 'Expense retrieved successfully');
    }
  );

  /**
   * GET /users/:userId/expenses - Get all expenses for a user
   */
  static getUserExpenses = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { userId } = req.params;
      const paginationData = validateData<{ page: number; limit: number }>(
        {
          page: req.query.page,
          limit: req.query.limit,
        },
        paginationSchema
      );

      const { page, limit, skip } = getPaginationOptions(
        paginationData.page,
        paginationData.limit
      );

      const { expenses, total } = await ExpenseService.getUserExpenses(
        userId,
        {
          limit,
          skip,
          category: req.query.category as string | undefined,
          startDate: req.query.startDate
            ? new Date(req.query.startDate as string)
            : undefined,
          endDate: req.query.endDate
            ? new Date(req.query.endDate as string)
            : undefined,
        }
      );

      const pagination = calculatePaginationMetadata(page, limit, total);

      res.status(StatusCodes.OK).json({
        success: true,
        message: 'User expenses retrieved successfully',
        data: expenses,
        pagination,
      });
    }
  );

  /**
   * GET /users/:userId/summary - Get monthly expense summary
   */
  static getExpenseSummary = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { userId } = req.params;

      const summary = await ExpenseService.getMonthlyExpenseSummary(userId);

      sendSuccess(res, summary, 'Expense summary retrieved successfully');
    }
  );

  /**
   * PUT /expenses/:id - Update expense
   */
  static updateExpense = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;
      const updateData = validateData<Partial<IExpense>>(
        req.body,
        expenseCreateSchema.fork(
          ['userId', 'title', 'amount', 'category', 'date'],
          (schema) => schema.optional()
        )
      );

      const expense = await ExpenseService.updateExpense(id, updateData);

      sendSuccess(res, expense, 'Expense updated successfully');
    }
  );

  /**
   * DELETE /expenses/:id - Delete expense
   */
  static deleteExpense = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;

      await ExpenseService.deleteExpense(id);

      sendSuccess(res, null, 'Expense deleted successfully');
    }
  );
}
