import { logger } from '../config/logger.js';

export const createGracefulShutdown = (server, io, connections = new Set()) => {
  const gracefulShutdown = async (signal) => {
   console.log(`Received ${signal}. Starting graceful shutdown...`);
    
    const shutdownTimeout = setTimeout(() => {
      logger.error('Graceful shutdown timeout. Forcing exit.');
      process.exit(1);
    }, 30000);

    try {
      // Stop accepting new connections
      server.close(async (err) => {
        if (err) {
          logger.error('Error closing server:', err);
          clearTimeout(shutdownTimeout);
          process.exit(1);
        }

       console.log('HTTP server closed');

        try {
          // Close all active connections
          for (const connection of connections) {
            connection.destroy();
          }
          connections.clear();

          // Close Socket.IO
          if (io) {
            io.close(() => {
             console.log('Socket.IO server closed');
            });
          }

          // Close database connection
          const mongoose = await import('mongoose');
          await mongoose.default.connection.close();
         console.log('Database connection closed');

          clearTimeout(shutdownTimeout);
         console.log('Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          logger.error('Error during graceful shutdown:', error);
          clearTimeout(shutdownTimeout);
          process.exit(1);
        }
      });
    } catch (error) {
      logger.error('Error initiating graceful shutdown:', error);
      clearTimeout(shutdownTimeout);
      process.exit(1);
    }
  };

  // Handle shutdown signals
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    gracefulShutdown('uncaughtException');
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('unhandledRejection');
  });

  return gracefulShutdown;
};