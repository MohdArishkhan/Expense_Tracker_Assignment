import { Router } from 'express';
import { userRoutes } from './userRoutes';
import { expenseRoutes } from './expenseRoutes';

export const createRoutes = (app: Router): void => {
  // Mount user routes
  app.use('/users', userRoutes);
  
  // Mount expense routes
  app.use('/expenses', expenseRoutes);
};
