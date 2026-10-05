import http from 'http';
import app from './app';
import { env } from './shared/config/env.config';
import { connectDatabase, disconnectDatabase } from './shared/config/db.config';
import { initSocketServer } from './shared/socket/socket.server';
import { logger } from './shared/utils/logger';

let httpServer: http.Server;

const startServer = async (): Promise<void> => {
  try {
    // 1. Connect to Database
    await connectDatabase();

    // 2. Create Node HTTP Server wrapping Express app
    httpServer = http.createServer(app);

    // 3. Initialize Socket.IO Server
    initSocketServer(httpServer);

    // 4. Start Server listening
    httpServer.listen(env.PORT, '0.0.0.0', () => {
      logger.info(`🚀 Server running in [${env.NODE_ENV}] mode on port ${env.PORT}`);
      logger.info(`🔗 Base URL: http://localhost:${env.PORT}`);
      logger.info(`🩺 Health check: http://localhost:${env.PORT}/health`);
      logger.info(`🔐 Auth endpoint: http://localhost:${env.PORT}/api/v1/auth`);
      logger.info(`🎲 Ludo endpoint: http://localhost:${env.PORT}/api/v1/ludo`);
      logger.info(`⚡ WebSockets: ws://localhost:${env.PORT}`);
    });
  } catch (error) {
    logger.error('Failed to initialize server:', error);
    process.exit(1);
  }
};

// Graceful Shutdown handler
const handleGracefulShutdown = async (signal: string): Promise<void> => {
  logger.warn(`🛑 Received ${signal}. Starting graceful shutdown...`);

  if (httpServer) {
    httpServer.close(async () => {
      logger.info('🛑 HTTP & WebSocket server closed.');
      await disconnectDatabase();
      logger.info('🛑 Database connections closed.');
      process.exit(0);
    });
  } else {
    await disconnectDatabase();
    process.exit(0);
  }

  // Force exit after 10 seconds timeout
  setTimeout(() => {
    logger.error('⚠️ Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason: unknown) => {
  logger.error('💥 Unhandled Rejection detected:', reason);
});

process.on('uncaughtException', (error: Error) => {
  logger.error('💥 Uncaught Exception detected:', error);
  process.exit(1);
});

startServer();
