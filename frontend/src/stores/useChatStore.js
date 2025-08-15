import { create } from 'zustand';
import { apiClient } from '../lib/api';
import { socketManager } from '../lib/socket';

const useChatStore = create((set, get) => ({
  // State
  conversations: [],
  activeConversation: null,
  messages: {},
  onlineUsers: [],
  typingUsers: {},
  isLoading: false,
  error: null,

  // Actions
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Conversations
  fetchConversations: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiClient.getConversations();
      set({ conversations: response.data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  createConversation: async (data) => {
    try {
      const response = await apiClient.createConversation(data);
      const newConversation = response.data;
      
      set(state => ({
        conversations: [newConversation, ...state.conversations],
      }));
      
      return newConversation;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  setActiveConversation: (conversationId) => {
    set({ activeConversation: conversationId });
    
    // Join conversation room for real-time updates
    if (conversationId) {
      socketManager.emit('join-conversation', { conversationId });
    }
  },

  updateConversation: async (conversationId, data) => {
    try {
      const response = await apiClient.updateConversation(conversationId, data);
      
      set(state => ({
        conversations: state.conversations.map(conv =>
          conv._id === conversationId ? { ...conv, ...response.data } : conv
        ),
      }));
      
      return response;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteConversation: async (conversationId) => {
    try {
      await apiClient.deleteConversation(conversationId);
      
      set(state => ({
        conversations: state.conversations.filter(conv => conv._id !== conversationId),
        activeConversation: state.activeConversation === conversationId ? null : state.activeConversation,
        messages: { ...state.messages, [conversationId]: undefined },
      }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // Messages
  fetchMessages: async (conversationId, page = 1) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiClient.getMessages(conversationId, page);
      
      set(state => ({
        messages: {
          ...state.messages,
          [conversationId]: page === 1 
            ? response.data 
            : [...(state.messages[conversationId] || []), ...response.data],
        },
        isLoading: false,
      }));
      
      return response;
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    try {
      const response = await apiClient.sendMessage(messageData);
      const newMessage = response.data;
      
      set(state => ({
        messages: {
          ...state.messages,
          [messageData.conversationId]: [
            ...(state.messages[messageData.conversationId] || []),
            newMessage,
          ],
        },
      }));

      // Emit to socket for real-time
      socketManager.emit('send-message', newMessage);
      
      return newMessage;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  updateMessage: async (messageId, content) => {
    try {
      const response = await apiClient.updateMessage(messageId, content);
      const updatedMessage = response.data;
      
      set(state => ({
        messages: Object.keys(state.messages).reduce((acc, convId) => {
          acc[convId] = state.messages[convId].map(msg =>
            msg._id === messageId ? updatedMessage : msg
          );
          return acc;
        }, {}),
      }));
      
      return updatedMessage;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteMessage: async (messageId) => {
    try {
      await apiClient.deleteMessage(messageId);
      
      set(state => ({
        messages: Object.keys(state.messages).reduce((acc, convId) => {
          acc[convId] = state.messages[convId].filter(msg => msg._id !== messageId);
          return acc;
        }, {}),
      }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  reactToMessage: async (messageId, emoji) => {
    try {
      const response = await apiClient.reactToMessage(messageId, emoji);
      const updatedMessage = response.data;
      
      set(state => ({
        messages: Object.keys(state.messages).reduce((acc, convId) => {
          acc[convId] = state.messages[convId].map(msg =>
            msg._id === messageId ? updatedMessage : msg
          );
          return acc;
        }, {}),
      }));
      
      return updatedMessage;
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  // Real-time updates
  handleNewMessage: (message) => {
    set(state => ({
      messages: {
        ...state.messages,
        [message.conversationId]: [
          ...(state.messages[message.conversationId] || []),
          message,
        ],
      },
    }));
  },

  handleMessageUpdate: (updatedMessage) => {
    set(state => ({
      messages: Object.keys(state.messages).reduce((acc, convId) => {
        acc[convId] = state.messages[convId].map(msg =>
          msg._id === updatedMessage._id ? updatedMessage : msg
        );
        return acc;
      }, {}),
    }));
  },

  handleMessageDelete: (messageId) => {
    set(state => ({
      messages: Object.keys(state.messages).reduce((acc, convId) => {
        acc[convId] = state.messages[convId].filter(msg => msg._id !== messageId);
        return acc;
      }, {}),
    }));
  },

  setOnlineUsers: (users) => set({ onlineUsers: users }),
  
  setTypingUsers: (conversationId, users) => {
    set(state => ({
      typingUsers: {
        ...state.typingUsers,
        [conversationId]: users,
      },
    }));
  },

  startTyping: (conversationId) => {
    socketManager.emit('typing-start', { conversationId });
  },

  stopTyping: (conversationId) => {
    socketManager.emit('typing-stop', { conversationId });
  },

  // Initialize socket listeners
  initializeSocket: () => {
    socketManager.on('message-received', get().handleNewMessage);
    socketManager.on('message-updated', get().handleMessageUpdate);
    socketManager.on('message-deleted', get().handleMessageDelete);
    socketManager.on('users-online', get().setOnlineUsers);
    socketManager.on('typing-users', ({ conversationId, users }) => {
      get().setTypingUsers(conversationId, users);
    });
  },

  // Cleanup
  cleanup: () => {
    socketManager.off('message-received');
    socketManager.off('message-updated');
    socketManager.off('message-deleted');
    socketManager.off('users-online');
    socketManager.off('typing-users');
  },
}));

export default useChatStore;