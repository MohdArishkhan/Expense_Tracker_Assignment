import User, { IUserDocument } from '../models/User';
import { IUser } from '../types';
import { NotFoundError, ConflictError, ValidationError } from '../utils/errors';

export class UserService {
  /**
   * Create a new user
   */
  static async createUser(userData: IUser): Promise<IUserDocument> {
    try {
      const existingUser = await User.findOne({ email: userData.email });

      if (existingUser) {
        throw new ConflictError('Email already in use');
      }

      const user = new User(userData);
      await user.save();

      return user;
    } catch (error) {
      if (error instanceof ConflictError) {
        throw error;
      }
      if ((error as any).name === 'ValidationError') {
        throw new ValidationError((error as Error).message);
      }
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<IUserDocument> {
    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError('User');
    }

    return user;
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email: string): Promise<IUserDocument | null> {
    return User.findOne({ email: email.toLowerCase() });
  }

  /**
   * Update user
   */
  static async updateUser(
    userId: string,
    updateData: Partial<IUser>
  ): Promise<IUserDocument> {
    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    return user;
  }

  /**
   * Delete user
   */
  static async deleteUser(userId: string): Promise<void> {
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      throw new NotFoundError('User');
    }
  }

  /**
   * Get all users (with pagination)
   */
  static async getAllUsers(
    limit: number = 10,
    skip: number = 0
  ): Promise<{ users: IUserDocument[]; total: number }> {
    const [users, total] = await Promise.all([
      User.find().limit(limit).skip(skip).sort({ createdAt: -1 }),
      User.countDocuments(),
    ]);

    return { users, total };
  }
}
