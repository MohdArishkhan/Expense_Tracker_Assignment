import Expense, { IExpenseDocument } from '../models/Expense';
import User from '../models/User';
import { IExpense, IExpenseSummary } from '../types';
import { NotFoundError, ValidationError } from '../utils/errors';

export class ExpenseService {
  /**
   * Create a new expense
   */
  static async createExpense(expenseData: IExpense): Promise<IExpenseDocument> {
    try {
      // Validate user exists
      const user = await User.findById(expenseData.userId);
      if (!user) {
        throw new NotFoundError('User');
      }

      const expense = new Expense(expenseData);
      await expense.save();
      await expense.populate('userId', 'name email monthlyBudget');

      return expense;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      if ((error as any).name === 'ValidationError') {
        throw new ValidationError((error as Error).message);
      }
      throw error;
    }
  }

  /**
   * Get expense by ID
   */
  static async getExpenseById(expenseId: string): Promise<IExpenseDocument> {
    const expense = await Expense.findById(expenseId).populate(
      'userId',
      'name email monthlyBudget'
    );

    if (!expense) {
      throw new NotFoundError('Expense');
    }

    return expense;
  }

  /**
   * Get all expenses for a user with optional filtering and pagination
   */
  static async getUserExpenses(
    userId: string,
    options: {
      limit: number;
      skip: number;
      category?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<{ expenses: IExpenseDocument[]; total: number }> {
    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    const query: any = { userId };

    if (options.category) {
      query.category = options.category;
    }

    if (options.startDate || options.endDate) {
      query.date = {};
      if (options.startDate) {
        query.date.$gte = options.startDate;
      }
      if (options.endDate) {
        query.date.$lte = options.endDate;
      }
    }

    const [expenses, total] = await Promise.all([
      Expense.find(query)
        .limit(options.limit)
        .skip(options.skip)
        .sort({ date: -1 })
        .populate('userId', 'name email monthlyBudget'),
      Expense.countDocuments(query),
    ]);

    return { expenses, total };
  }

  /**
   * Get monthly expense summary for a user
   */
  static async getMonthlyExpenseSummary(
    userId: string
  ): Promise<IExpenseSummary> {
    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    // Get current month date range
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Aggregate expenses for the current month
    const expenses = await Expense.aggregate([
      {
        $match: {
          userId: user._id,
          date: {
            $gte: startOfMonth,
            $lte: endOfMonth,
          },
        },
      },
      {
        $group: {
          _id: '$category',
          amount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const totalExpenses = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    const expenseCount = expenses.reduce((sum, expense) => sum + expense.count, 0);
    const remainingBudget = Math.max(0, user.monthlyBudget - totalExpenses);

    const expensesByCategory = expenses.reduce(
      (acc: Record<string, number>, expense) => {
        acc[expense._id] = expense.amount;
        return acc;
      },
      {}
    );

    return {
      totalExpenses: parseFloat(totalExpenses.toFixed(2)),
      remainingBudget: parseFloat(remainingBudget.toFixed(2)),
      expenseCount,
      monthlyBudget: user.monthlyBudget,
      expensesByCategory,
    };
  }

  /**
   * Update expense
   */
  static async updateExpense(
    expenseId: string,
    updateData: Partial<IExpense>
  ): Promise<IExpenseDocument> {
    const expense = await Expense.findByIdAndUpdate(expenseId, updateData, {
      new: true,
      runValidators: true,
    }).populate('userId', 'name email monthlyBudget');

    if (!expense) {
      throw new NotFoundError('Expense');
    }

    return expense;
  }

  /**
   * Delete expense
   */
  static async deleteExpense(expenseId: string): Promise<void> {
    const expense = await Expense.findByIdAndDelete(expenseId);

    if (!expense) {
      throw new NotFoundError('Expense');
    }
  }

  /**
   * Delete all expenses for a user (useful for user deletion)
   */
  static async deleteUserExpenses(userId: string): Promise<void> {
    await Expense.deleteMany({ userId });
  }
}
