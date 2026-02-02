import mongoose, { Schema, Document, Model } from 'mongoose';
import { IUser } from '../types';

export interface IUserDocument extends IUser, Document {
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true, 
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    monthlyBudget: {
      type: Number,
      required: [true, 'Monthly budget is required'],
      min: [0.01, 'Monthly budget must be greater than 0'],
    },
  },
  {
    timestamps: true, 
    versionKey: false, 
  }
);


userSchema.pre('save', async function (next) {
  // Normalize email to lowercase
  if (this.email) {
    this.email = this.email.toLowerCase().trim();
  }

  // Check for duplicate email (excluding current document)
  if (this.isModified('email')) {
    const existingUser = await mongoose.model<IUserDocument>('User').findOne({
      email: this.email,
      _id: { $ne: this._id },
    });

    if (existingUser) {
      throw new Error('Email already in use');
    }
  }

  next();
});

userSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
  try {
    // Fixed: Use 'userId' instead of 'user'
    await mongoose.model('Expense').deleteMany({ userId: this._id });
    next();
  } catch (error: any) {
    next(error);
  }
});


userSchema.post('save', function () {
  if (this.isNew) {
    console.log(`[AUDIT] New user created: ${this._id} (${this.email})`);
  }
});

userSchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  },
});

const User: Model<IUserDocument> = mongoose.model<IUserDocument>('User', userSchema);

export default User;