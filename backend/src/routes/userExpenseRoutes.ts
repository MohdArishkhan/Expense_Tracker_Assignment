import { Router } from 'express';
import { ExpenseController } from '../controllers/expenseController';

export const userExpenseRoutes = Router({ mergeParams: true });

/**
 * @route   GET /api/v1/users/:userId/expenses
 * @desc    Get all expenses for a user
 * @access  Public
 */
userExpenseRoutes.get('/expenses', ExpenseController.getUserExpenses);

/**
 * @route   GET /api/v1/users/:userId/summary
 * @desc    Get monthly expense summary for a user
 * @access  Public
 */
userExpenseRoutes.get('/summary', ExpenseController.getExpenseSummary);
