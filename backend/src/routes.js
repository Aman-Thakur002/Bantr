import { Router } from 'express';
import { success } from './utils/response.js';

// Import all module-specific routers
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/user.routes.js';
import conversationRoutes from './modules/conversations/conversation.routes.js';
import messageRoutes from './modules/messages/message.routes.js';
import attachmentRoutes from './modules/attachments/attachment.routes.js';
import callRoutes from './modules/calls/call.routes.js';
import aiRoutes from './modules/ai/ai.routes.js';
import gameRoutes from './modules/games/games.routes.js';

const router = Router();

/**
 * @desc    Health check endpoint
 * @route   GET /api/v1/health
 * @access  Public
 * @returns {object} 200 - An object with server status, timestamp, uptime, and memory usage
 */
router.get('/health', (req, res) => {
  res.json(success({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  }));
});

/**
 * @desc    API version and general info
 * @route   GET /api/v1/
 * @access  Public
 * @returns {object} 200 - An object with API name, version, and description
 */
router.get('/', (req, res) => {
  res.json(success({
    name: 'NeuroChat API',
    version: '1.0.0',
    description: 'WhatsApp-like chat app with AI features',
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      conversations: '/api/v1/conversations',
      messages: '/api/v1/messages',
      attachments: '/api/v1/attachments',
      calls: '/api/v1/calls',
      ai: '/api/v1/ai',
      games: '/api/v1/games',
    },
  }));
});

// Mount all module routers to their respective paths
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/conversations', conversationRoutes);
router.use('/messages', messageRoutes);
router.use('/attachments', attachmentRoutes);
router.use('/calls', callRoutes);
router.use('/ai', aiRoutes);
router.use('/games', gameRoutes);

export default router;