import http from 'http';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import app from './app.js';
import { config } from './config/env.js';
import { logger } from './config/logger.js';
import { initializeSocket } from './sockets/io.js';
import { createGracefulShutdown } from './utils/gracefulShutdown.js';

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: config.clientUrl,
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH']
  }
});

// Track active connections for graceful shutdown
const connections = new Set();
server.on('connection', (connection) => {
  connections.add(connection);
  connection.on('close', () => {
    connections.delete(connection);
  });
});

// Setup Socket.IO
const socketIO = initializeSocket(server);

// Setup graceful shutdown
createGracefulShutdown(server, io, connections);

// Connect to database and start server
const startServer = async () => {
  try {
    await mongoose.connect(config.mongoUri);
   console.log('Connected to MongoDB');

    server.listen(config.port, () => {
     console.log(`Server running on port ${config.port}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();