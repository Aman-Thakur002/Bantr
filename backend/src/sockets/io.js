import { Server } from 'socket.io';
import { verifyAccessToken } from '../utils/tokens.js';
import User from '../modules/users/user.model.js';
import logger from '../config/logger.js';
import { config } from '../config/env.js';

// Rate limiting for socket events
const rateLimits = new Map();

export function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: config.CLIENT_ORIGIN,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.userId).select('-passwordHash');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      logger.error('Socket authentication failed:', error);
      next(new Error('Authentication failed'));
    }
  });

  // Rate limiting middleware
  const checkRateLimit = (socket, event, maxRequests = 10, windowMs = 60000) => {
    const key = `${socket.userId}:${event}`;
    const now = Date.now();
    
    if (!rateLimits.has(key)) {
      rateLimits.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    const limit = rateLimits.get(key);
    if (now > limit.resetTime) {
      limit.count = 1;
      limit.resetTime = now + windowMs;
      return true;
    }

    if (limit.count >= maxRequests) {
      return false;
    }

    limit.count++;
    return true;
  };

  io.on('connection', (socket) => {
   console.log(`User connected: ${socket.user.name} (${socket.userId})`);

    // Join user room for direct messaging
    socket.join(`user:${socket.userId}`);

    // Update user status to online
    User.findByIdAndUpdate(socket.userId, { 
      status: 'online',
      lastSeenAt: new Date(),
    }).catch(err => logger.error('Failed to update user status:', err));

    // Handle joining conversation rooms
    socket.on('join:conversation', (conversationId) => {
      if (!checkRateLimit(socket, 'join:conversation', 20)) {
        return socket.emit('error', { message: 'Rate limit exceeded' });
      }

      socket.join(`conv:${conversationId}`);
      logger.debug(`User ${socket.userId} joined conversation ${conversationId}`);
    });

    // Handle leaving conversation rooms
    socket.on('leave:conversation', (conversationId) => {
      socket.leave(`conv:${conversationId}`);
      logger.debug(`User ${socket.userId} left conversation ${conversationId}`);
    });

    // Handle joining game rooms
    socket.on('join:game', (gameId) => {
      if (!checkRateLimit(socket, 'join:game', 10)) {
        return socket.emit('error', { message: 'Rate limit exceeded' });
      }

      socket.join(`game:${gameId}`);
      logger.debug(`User ${socket.userId} joined game ${gameId}`);
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
     console.log(`User disconnected: ${socket.user.name} (${reason})`);
      
      // Update user status to offline
      User.findByIdAndUpdate(socket.userId, { 
        status: 'offline',
        lastSeenAt: new Date(),
      }).catch(err => logger.error('Failed to update user status:', err));
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error('Socket error:', error);
    });
  });

  // Cleanup rate limits periodically
  setInterval(() => {
    const now = Date.now();
    for (const [key, limit] of rateLimits.entries()) {
      if (now > limit.resetTime) {
        rateLimits.delete(key);
      }
    }
  }, 60000); // Clean up every minute

  return io;
}

export default initializeSocket;