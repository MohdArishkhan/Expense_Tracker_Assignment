import mongoose from 'mongoose';

export interface IUser {
  name: string;
  email: string;
  monthlyBudget: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IExpense {
  userId: mongoose.Types.ObjectId;
  title: string;
  amount: number;
  category: string;
  date: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IExpenseSummary {
  totalExpenses: number;
  remainingBudget: number;
  expenseCount: number;
  monthlyBudget: number;
  expensesByCategory?: Record<string, number>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  statusCode: number;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
