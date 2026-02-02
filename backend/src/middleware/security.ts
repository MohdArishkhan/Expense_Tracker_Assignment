import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';

export const securityMiddleware = [
  // Security headers
  helmet(),

  // CORS configuration
  cors({
    origin: process.env.CORS_ORIGIN || [
      'http://localhost:3000',
      'http://localhost:5000',
    ],
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),

  // Request size limit middleware
  (req: Request, res: Response, next: NextFunction): void => {
    // Prevent request body size attacks
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      const contentLength = req.get('content-length');
      if (contentLength && parseInt(contentLength, 10) > 10 * 1024 * 1024) {
        res.status(413).json({
          success: false,
          message: 'Payload too large',
          statusCode: 413,
        });
        return;
      }
    }
    next();
  },

  // X-Content-Type-Options header
  (_req: Request, res: Response, next: NextFunction): void => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  },
];
