import Message from '../modules/messages/message.model.js';
import Conversation from '../modules/conversations/conversation.model.js';
import logger from '../config/logger.js';

// Typing indicators storage
const typingUsers = new Map();

export function setupChatEvents(io) {
  io.on('connection', (socket) => {
    
    // Handle message sending
    socket.on('chat:send', async (data) => {
      try {
        const { conversationId, text, attachments, replyTo } = data;

        // Validate conversation membership
        const conversation = await Conversation.findOne({
          _id: conversationId,
          members: socket.userId,
        });

        if (!conversation) {
          return socket.emit('error', { message: 'Conversation not found' });
        }

        // Create message
        const message = await Message.create({
          conversationId,
          senderId: socket.userId,
          text,
          attachments: attachments || [],
          replyTo,
          status: 'sent',
        });

        // Update conversation last message time
        conversation.lastMessageAt = new Date();
        await conversation.save();

        // Populate message
        const populatedMessage = await Message.findById(message._id)
          .populate('senderId', 'name avatarUrl')
          .populate('attachments')
          .populate('replyTo', 'text senderId')
          .populate('replyTo.senderId', 'name avatarUrl');

        // Emit to conversation members
        io.to(`conv:${conversationId}`).emit('chat:new', populatedMessage);

        // Send delivery receipts to sender
        socket.emit('chat:delivered', { messageId: message._id });

        logger.debug(`Message sent in conversation ${conversationId} by user ${socket.userId}`);
      } catch (error) {
        logger.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('chat:typing', (data) => {
      try {
        const { conversationId, isTyping } = data;

        if (!conversationId) {
          return socket.emit('error', { message: 'Conversation ID required' });
        }

        const key = `${conversationId}:${socket.userId}`;

        if (isTyping) {
          // Add user to typing list
          typingUsers.set(key, {
            userId: socket.userId,
            userName: socket.user.name,
            conversationId,
            timestamp: Date.now(),
          });

          // Auto-remove after 3 seconds
          setTimeout(() => {
            typingUsers.delete(key);
            socket.to(`conv:${conversationId}`).emit('chat:typing', {
              conversationId,
              userId: socket.userId,
              isTyping: false,
            });
          }, 3000);
        } else {
          // Remove user from typing list
          typingUsers.delete(key);
        }

        // Broadcast typing status to other conversation members
        socket.to(`conv:${conversationId}`).emit('chat:typing', {
          conversationId,
          userId: socket.userId,
          userName: socket.user.name,
          isTyping,
        });

      } catch (error) {
        logger.error('Error handling typing indicator:', error);
      }
    });

    // Handle message read receipts
    socket.on('chat:read', async (data) => {
      try {
        const { messageIds, conversationId } = data;

        if (!Array.isArray(messageIds) || !conversationId) {
          return socket.emit('error', { message: 'Invalid read receipt data' });
        }

        // Update messages as read
        await Message.updateMany(
          {
            _id: { $in: messageIds },
            conversationId,
            senderId: { $ne: socket.userId },
            'readBy.userId': { $ne: socket.userId },
          },
          {
            $push: {
              readBy: {
                userId: socket.userId,
                readAt: new Date(),
              },
            },
          }
        );

        // Emit read receipts to conversation members
        socket.to(`conv:${conversationId}`).emit('chat:read', {
          messageIds,
          userId: socket.userId,
          userName: socket.user.name,
          readAt: new Date(),
        });

        logger.debug(`Read receipts sent for ${messageIds.length} messages by user ${socket.userId}`);
      } catch (error) {
        logger.error('Error handling read receipts:', error);
        socket.emit('error', { message: 'Failed to send read receipts' });
      }
    });

    // Handle message reactions
    socket.on('chat:react', async (data) => {
      try {
        const { messageId, emoji } = data;

        const message = await Message.findById(messageId);
        if (!message) {
          return socket.emit('error', { message: 'Message not found' });
        }

        // Verify conversation membership
        const conversation = await Conversation.findOne({
          _id: message.conversationId,
          members: socket.userId,
        });

        if (!conversation) {
          return socket.emit('error', { message: 'Access denied' });
        }

        // Add reaction
        const reactionAdded = message.addReaction(socket.userId, emoji);
        await message.save();

        // Emit reaction update to conversation members
        io.to(`conv:${message.conversationId}`).emit('chat:reaction', {
          messageId,
          userId: socket.userId,
          userName: socket.user.name,
          emoji,
          reactions: message.reactions,
          action: reactionAdded ? 'add' : 'update',
        });

      } catch (error) {
        logger.error('Error handling message reaction:', error);
        socket.emit('error', { message: 'Failed to add reaction' });
      }
    });

    // Handle message editing
    socket.on('chat:edit', async (data) => {
      try {
        const { messageId, text } = data;

        const message = await Message.findOne({
          _id: messageId,
          senderId: socket.userId,
        });

        if (!message) {
          return socket.emit('error', { message: 'Message not found or access denied' });
        }

        // Check edit time limit (24 hours)
        const hoursSinceCreated = (Date.now() - message.createdAt) / (1000 * 60 * 60);
        if (hoursSinceCreated > 24) {
          return socket.emit('error', { message: 'Message can only be edited within 24 hours' });
        }

        // Update message
        message.text = text;
        message.edited = true;
        message.editedAt = new Date();
        await message.save();

        // Populate and emit updated message
        const populatedMessage = await Message.findById(messageId)
          .populate('senderId', 'name avatarUrl')
          .populate('attachments')
          .populate('replyTo', 'text senderId')
          .populate('replyTo.senderId', 'name avatarUrl');

        io.to(`conv:${message.conversationId}`).emit('chat:edited', populatedMessage);

      } catch (error) {
        logger.error('Error editing message:', error);
        socket.emit('error', { message: 'Failed to edit message' });
      }
    });

    // Clean up typing indicators on disconnect
    socket.on('disconnect', () => {
      // Remove all typing indicators for this user
      for (const [key, typing] of typingUsers.entries()) {
        if (typing.userId === socket.userId) {
          typingUsers.delete(key);
          socket.to(`conv:${typing.conversationId}`).emit('chat:typing', {
            conversationId: typing.conversationId,
            userId: socket.userId,
            isTyping: false,
          });
        }
      }
    });
  });

  // Clean up old typing indicators periodically
  setInterval(() => {
    const now = Date.now();
    const timeout = 5000; // 5 seconds

    for (const [key, typing] of typingUsers.entries()) {
      if (now - typing.timestamp > timeout) {
        typingUsers.delete(key);
        io.to(`conv:${typing.conversationId}`).emit('chat:typing', {
          conversationId: typing.conversationId,
          userId: typing.userId,
          isTyping: false,
        });
      }
    }
  }, 2000); // Check every 2 seconds
};