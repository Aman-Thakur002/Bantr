import User from '../modules/users/user.model.js';
import logger from '../config/logger.js';

// Online users tracking
const onlineUsers = new Map();

export function setupPresenceEvents(io) {
  io.on('connection', (socket) => {
    
    // Add user to online list
    onlineUsers.set(socket.userId, {
      socketId: socket.id,
      userId: socket.userId,
      userName: socket.user.name,
      status: 'online',
      lastSeen: new Date(),
    });

    // Broadcast user online status
    socket.broadcast.emit('presence:online', {
      userId: socket.userId,
      userName: socket.user.name,
      status: 'online',
    });

    // Handle status updates
    socket.on('presence:status', async (data) => {
      try {
        const { status } = data;

        if (!['online', 'away', 'offline'].includes(status)) {
          return socket.emit('error', { message: 'Invalid status' });
        }

        // Update user status in database
        await User.findByIdAndUpdate(socket.userId, {
          status,
          lastSeenAt: status === 'offline' ? new Date() : undefined,
        });

        // Update online users map
        if (onlineUsers.has(socket.userId)) {
          onlineUsers.get(socket.userId).status = status;
          onlineUsers.get(socket.userId).lastSeen = new Date();
        }

        // Broadcast status change
        socket.broadcast.emit('presence:status', {
          userId: socket.userId,
          userName: socket.user.name,
          status,
          lastSeen: new Date(),
        });

        logger.debug(`User ${socket.userId} status changed to ${status}`);
      } catch (error) {
        logger.error('Error updating user status:', error);
        socket.emit('error', { message: 'Failed to update status' });
      }
    });

    // Handle last seen updates
    socket.on('presence:heartbeat', () => {
      if (onlineUsers.has(socket.userId)) {
        onlineUsers.get(socket.userId).lastSeen = new Date();
      }

      // Update database periodically (throttled)
      if (!socket.lastHeartbeatUpdate || Date.now() - socket.lastHeartbeatUpdate > 30000) {
        User.findByIdAndUpdate(socket.userId, {
          lastSeenAt: new Date(),
        }).catch(err => logger.error('Failed to update last seen:', err));
        
        socket.lastHeartbeatUpdate = Date.now();
      }
    });

    // Handle getting online users
    socket.on('presence:get_online', (data) => {
      try {
        const { userIds } = data;

        if (!Array.isArray(userIds)) {
          return socket.emit('error', { message: 'User IDs must be an array' });
        }

        const onlineStatuses = userIds.map(userId => {
          const onlineUser = onlineUsers.get(userId);
          return {
            userId,
            isOnline: !!onlineUser,
            status: onlineUser?.status || 'offline',
            lastSeen: onlineUser?.lastSeen || null,
          };
        });

        socket.emit('presence:online_status', onlineStatuses);
      } catch (error) {
        logger.error('Error getting online users:', error);
        socket.emit('error', { message: 'Failed to get online users' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', async (reason) => {
      try {
        // Remove from online users
        onlineUsers.delete(socket.userId);

        // Update user status to offline
        await User.findByIdAndUpdate(socket.userId, {
          status: 'offline',
          lastSeenAt: new Date(),
        });

        // Broadcast user offline status
        socket.broadcast.emit('presence:offline', {
          userId: socket.userId,
          userName: socket.user.name,
          lastSeen: new Date(),
        });

        logger.debug(`User ${socket.userId} went offline (${reason})`);
      } catch (error) {
        logger.error('Error handling user disconnect:', error);
      }
    });
  });

  // Periodic cleanup of stale online users
  setInterval(() => {
    const now = Date.now();
    const staleTimeout = 60000; // 1 minute

    for (const [userId, user] of onlineUsers.entries()) {
      if (now - user.lastSeen.getTime() > staleTimeout) {
        onlineUsers.delete(userId);
        
        // Update database
        User.findByIdAndUpdate(userId, {
          status: 'offline',
          lastSeenAt: new Date(),
        }).catch(err => logger.error('Failed to update stale user status:', err));

        // Broadcast offline status
        io.emit('presence:offline', {
          userId,
          userName: user.userName,
          lastSeen: user.lastSeen,
        });

        logger.debug(`Cleaned up stale user: ${userId}`);
      }
    }
  }, 30000); // Check every 30 seconds

  // Get current online users count
  const getOnlineUsersCount = () => onlineUsers.size;

  // Get online users list
  const getOnlineUsers = () => Array.from(onlineUsers.values());

  return {
    getOnlineUsersCount,
    getOnlineUsers,
  };
};