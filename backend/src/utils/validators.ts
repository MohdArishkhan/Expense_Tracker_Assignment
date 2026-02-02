import Joi from 'joi';
import { ValidationError } from './errors';

export const userCreateSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name cannot exceed 100 characters',
  }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Invalid email format',
    }),
  monthlyBudget: Joi.number().greater(0).required().messages({
    'number.base': 'Monthly budget must be a number',
    'number.greater': 'Monthly budget must be greater than 0',
    'any.required': 'Monthly budget is required',
  }),
});

export const expenseCreateSchema = Joi.object({
  userId: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/).messages({
    'string.pattern.base': 'Invalid user ID format',
    'any.required': 'User ID is required',
  }),
  title: Joi.string().min(2).max(200).required().messages({
    'string.empty': 'Title is required',
    'string.min': 'Title must be at least 2 characters long',
    'string.max': 'Title cannot exceed 200 characters',
  }),
  amount: Joi.number().greater(0).required().messages({
    'number.base': 'Amount must be a number',
    'number.greater': 'Amount must be greater than 0',
    'any.required': 'Amount is required',
  }),
  category: Joi.string()
    .valid(
      'Food',
      'Travel',
      'Shopping',
      'Entertainment',
      'Utilities',
      'Healthcare',
      'Education',
      'Other'
    )
    .required()
    .messages({
      'any.only': 'Invalid category',
      'any.required': 'Category is required',
    }),
  date: Joi.date().max('now').required().messages({
    'date.base': 'Invalid date format',
    'date.max': 'Expense date cannot be in the future',
    'any.required': 'Date is required',
  }),
});

export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    'number.base': 'Page must be a number',
    'number.integer': 'Page must be an integer',
    'number.min': 'Page must be at least 1',
  }),
  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    'number.base': 'Limit must be a number',
    'number.integer': 'Limit must be an integer',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit cannot exceed 100',
  }),
});

export const validateData = <T>(data: unknown, schema: Joi.Schema): T => {
  const { error, value } = schema.validate(data, { abortEarly: false });

  if (error) {
    const messages = error.details.map((detail) => detail.message).join(', ');
    throw new ValidationError(messages);
  }

  return value as T;
};
