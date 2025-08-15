import http from 'http';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import app from './app.js';
import { config } from './config/env.js';
import { logger } from './config/logger.js';
import { initializeSocket } from './sockets/io.js';
import { createGracefulShutdown } from './utils/gracefulShutdown.js';

// Create an HTTP server from the Express app
const server = http.createServer(app);

// Initialize Socket.IO with CORS configuration
const io = new Server(server, {
  cors: {
    origin: config.clientUrl,
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH']
  }
});

// Keep track of active connections for a graceful shutdown
const connections = new Set();
server.on('connection', (connection) => {
  connections.add(connection);
  connection.on('close', () => {
    connections.delete(connection);
  });
});

// Initialize Socket.IO event handlers
const socketIO = initializeSocket(io);

// Set up graceful shutdown to properly close server and database connections
createGracefulShutdown(server, io, connections);

/**
 * Connects to the MongoDB database and starts the HTTP server.
 */
const startServer = async () => {
  try {
    // Establish connection to MongoDB
    await mongoose.connect(config.mongoUri);
    logger.info('Successfully connected to MongoDB');

    // Start listening for incoming requests
    server.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`);
    });
  } catch (error) {
    logger.error('Failed to connect to MongoDB or start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();