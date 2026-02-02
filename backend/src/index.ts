import express, { Express, Router } from "express";
import { connectDatabase, disconnectDatabase } from "./config/database";
import { config } from "./config/env";
import { securityMiddleware } from "./middleware/security";
import { requestLogger, responseTimeMiddleware } from "./middleware/logger";
import { errorHandler } from "./middleware/errorHandler";
import { createRoutes } from "./routes/userExpenseMounts";
import { userExpenseRoutes } from "./routes/userExpenseRoutes";
import { globalRateLimiter } from "./middleware/ratelimiter";
import logger from "./utils/logger";

const app: Express = express();

const startServer = async (): Promise<void> => {
  try {
    // 1. Database Connection
    await connectDatabase();

    // 2. Global Middleware
    app.use(express.json({ limit: "10mb" }));
    app.use(express.urlencoded({ extended: true, limit: "10mb" }));
    app.use(requestLogger);
    app.use(responseTimeMiddleware);
    app.use(...securityMiddleware);
    app.use(globalRateLimiter);

    // 3. API Router Setup
    const apiRouter = Router();

    // Health check endpoint
    apiRouter.get("/health", (_req, res) => {
      res.status(200).json({
        success: true,
        message: "Server is healthy",
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv,
      });
    });

    
  
    apiRouter.use("/users/:userId", userExpenseRoutes);

    createRoutes(apiRouter);

    // Mount the versioned API path
    app.use(`/api/${config.apiVersion}`, apiRouter);

    // Global Error Handling
    // Must be placed AFTER all routes
    app.use(errorHandler);

    const server = app.listen(config.port, () => {
      logger.info(
        {
          event: "SERVER_STARTUP",
          env: config.nodeEnv,
          port: config.port,
          url: `http://${config.host}:${config.port}/api/${config.apiVersion}`,
        },
        "Expense Tracker Backend Server started successfully"
      );
    });

    // 6. Graceful Shutdown (Industry Best Practice)
    const gracefulShutdown = async (signal: string): Promise<void> => {
      logger.info(`[${signal}] Shutting down gracefully...`);
      server.close(async () => {
        await disconnectDatabase();
        logger.info("Database connection closed and server shut down.");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    process.on("uncaughtException", (error) => {
      logger.error({ error }, "[UNCAUGHT EXCEPTION]");
      process.exit(1);
    });

    process.on("unhandledRejection", (reason, promise) => {
      logger.error({ reason, promise }, "[UNHANDLED REJECTION]");
      process.exit(1);
    });

  } catch (error) {
    logger.error({ error }, "[STARTUP ERROR]");
    process.exit(1);
  }
};

startServer();