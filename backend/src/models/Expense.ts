import mongoose, { Schema, Document, Model } from 'mongoose';
import { IExpense } from '../types';

export interface IExpenseDocument extends IExpense, Document {}

const EXPENSE_CATEGORIES = [
  'Food',
  'Travel',
  'Shopping',
  'Entertainment',
  'Utilities',
  'Healthcare',
  'Education',
  'Other',
];

const expenseSchema = new Schema<IExpenseDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Expense title/description is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters long'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: EXPENSE_CATEGORIES,
        message: `Category must be one of: ${EXPENSE_CATEGORIES.join(', ')}`,
      },
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
  },
  {
    timestamps: true,
    collection: 'expenses',
  }
);

// Indexes for better query performance
expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ userId: 1, category: 1 });
expenseSchema.index({ createdAt: -1 });


expenseSchema.pre('save', async function (next) {
  // Validate user exists
  const user = await mongoose.model('User').findById(this.userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Validate date is not in future
  if (this.date > new Date()) {
    throw new Error('Expense date cannot be in the future');
  }

  // Validate amount is positive
  if (this.amount <= 0) {
    throw new Error('Expense amount must be greater than 0');
  }

  // Normalize category (remove extra spaces)
  if (this.category) {
    this.category = this.category.trim();
  }

  next();
});

/**
 * Post-save hook: Log expense creation
 * Purpose: Audit trail for tracking expense additions
 */
expenseSchema.post('save', function () {
  if (this.isNew) {
    console.log(
      `[AUDIT] New expense created: ${this._id} | Amount: ${this.amount} | Category: ${this.category}`
    );
  }
});

const Expense: Model<IExpenseDocument> = mongoose.model<IExpenseDocument>(
  'Expense',
  expenseSchema
);

export default Expense;
