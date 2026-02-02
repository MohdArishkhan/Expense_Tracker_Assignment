import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { UserService } from '../services/userService';
import { ExpenseService } from '../services/expenseService';
import { asyncHandler } from '../middleware/errorHandler';
import { sendSuccess, sendCreated } from '../utils/response';
import { validateData, userCreateSchema, paginationSchema } from '../utils/validators';
import { getPaginationOptions, calculatePaginationMetadata } from '../utils/pagination';
import { IUser } from '../types';

export class UserController {
  /**
   * POST /users - Create a new user
   */
  static createUser = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userData = validateData<IUser>(req.body, userCreateSchema);

      const user = await UserService.createUser(userData);

      sendCreated(res, user, 'User created successfully');
    }
  );

  /**
   * GET /users/:id - Get user by ID
   */
  static getUser = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;

      const user = await UserService.getUserById(id);

      sendSuccess(res, user, 'User retrieved successfully');
    }
  );

  /**
   * GET /users - Get all users with pagination
   */
  static getAllUsers = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
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

      const { users, total } = await UserService.getAllUsers(limit, skip);
      const pagination = calculatePaginationMetadata(page, limit, total);

      res.status(StatusCodes.OK).json({
        success: true,
        message: 'Users retrieved successfully',
        data: users,
        pagination,
      });
    }
  );

  /**
   * PUT /users/:id - Update user
   */
  static updateUser = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;
      const updateData = validateData<Partial<IUser>>(
        req.body,
        userCreateSchema.fork(
          ['email', 'monthlyBudget', 'name'],
          (schema) => schema.optional()
        )
      );

      const user = await UserService.updateUser(id, updateData);

      sendSuccess(res, user, 'User updated successfully');
    }
  );

  /**
   * DELETE /users/:id - Delete user
   */
  static deleteUser = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;

      // Delete all expenses associated with the user
      await ExpenseService.deleteUserExpenses(id);

      // Delete the user
      await UserService.deleteUser(id);

      sendSuccess(res, null, 'User deleted successfully');
    }
  );
}
