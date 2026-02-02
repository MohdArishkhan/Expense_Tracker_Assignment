import { Router } from 'express';
import { UserController } from '../controllers/userController';

export const userRoutes = Router();

/**
 * @route   POST /api/v1/users
 * @desc    Create a new user
 * @access  Public
 */
userRoutes.post('/', UserController.createUser);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user by ID
 * @access  Public
 */
userRoutes.get('/:id', UserController.getUser);

/**
 * @route   PUT /api/v1/users/:id
 * @desc    Update user
 * @access  Public
 */
userRoutes.put('/:id', UserController.updateUser);

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Delete user
 * @access  Public
 */
userRoutes.delete('/:id', UserController.deleteUser);

/**
 * @route   GET /api/v1/users
 * @desc    Get all users with pagination
 * @access  Public
 */
userRoutes.get('/', UserController.getAllUsers);
