import { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';

// Custom morgan token for response time in milliseconds
morgan.token('ms', (_req: Request, res: Response) => {
  if (!res.getHeader('X-Response-Time')) return '';
  return res.getHeader('X-Response-Time') as string;
});

// Custom format string
const morganFormat =
  ':method :url :status :response-time ms - :res[content-length]';

export const requestLogger = morgan(morganFormat, {
  skip: (req: Request, _res: Response) => {
    // Skip health check endpoint
    return req.path === '/health';
  },
});

export const responseTimeMiddleware = (
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = Date.now();

  // Override res.json to capture response time
  const originalJson = res.json;

  res.json = function (data) {
    const duration = Date.now() - start;
    res.setHeader('X-Response-Time', `${duration}`);
    return originalJson.call(this, data);
  };

  next();
};
