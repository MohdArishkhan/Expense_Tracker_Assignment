import { Router } from 'express';
import { ExpenseController } from '../controllers/expenseController';

export const expenseRoutes = Router();

/**
 * @route   POST /api/v1/expenses
 * @desc    Create a new expense
 * @access  Public
 */
expenseRoutes.post('/', ExpenseController.createExpense);

/**
 * @route   GET /api/v1/expenses/:id
 * @desc    Get expense by ID
 * @access  Public
 */
expenseRoutes.get('/:id', ExpenseController.getExpense);

/**
 * @route   PUT /api/v1/expenses/:id
 * @desc    Update expense
 * @access  Public
 */
expenseRoutes.put('/:id', ExpenseController.updateExpense);

/**
 * @route   DELETE /api/v1/expenses/:id
 * @desc    Delete expense
 * @access  Public
 */
expenseRoutes.delete('/:id', ExpenseController.deleteExpense);

// User-specific expense routes (nested under users)
// These are registered separately in user routes as follows:
// GET /api/v1/users/:userId/expenses
// GET /api/v1/users/:userId/summary
