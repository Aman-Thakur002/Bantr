import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

if (!SOCKET_URL) {
  throw new Error('VITE_SOCKET_URL environment variable is required');
}

let socket = null;
let isConnected = false;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;

// Event listeners storage
const eventListeners = new Map();

// Connection management
export const connectSocket = (token) => {
  if (socket) {
    disconnectSocket();
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: maxReconnectAttempts,
    reconnectionDelay: 1000,
  });

  setupSocketListeners();
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    isConnected = false;
    reconnectAttempts = 0;
  }
};

export const getSocket = () => socket;
export const isSocketConnected = () => isConnected;

// Event management
export const emitEvent = (event, data) => {
  if (socket && isConnected) {
    socket.emit(event, data);
  } else {
    console.warn('Socket not connected. Cannot emit event:', event);
  }
};

export const onEvent = (event, callback) => {
  if (socket) {
    socket.on(event, callback);
    
    // Store listener for cleanup
    if (!eventListeners.has(event)) {
      eventListeners.set(event, new Set());
    }
    eventListeners.get(event).add(callback);
  }
};

export const offEvent = (event, callback) => {
  if (socket) {
    socket.off(event, callback);
    
    // Remove from stored listeners
    if (eventListeners.has(event)) {
      eventListeners.get(event).delete(callback);
    }
  }
};

export const removeAllListeners = (event) => {
  if (socket) {
    socket.removeAllListeners(event);
    eventListeners.delete(event);
  }
};

// Setup default socket listeners
const setupSocketListeners = () => {
  socket.on('connect', () => {
    isConnected = true;
    reconnectAttempts = 0;
    console.log('Connected to server');
  });

  socket.on('disconnect', (reason) => {
    isConnected = false;
    console.log('Disconnected from server:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
    reconnectAttempts++;
    
    if (reconnectAttempts >= maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      disconnectSocket();
    }
  });

  socket.on('reconnect', (attemptNumber) => {
    console.log('Reconnected after', attemptNumber, 'attempts');
    isConnected = true;
    reconnectAttempts = 0;
  });

  socket.on('reconnect_error', (error) => {
    console.error('Reconnection error:', error);
  });
};

// Chat-specific events
export const joinConversation = (conversationId) => {
  emitEvent('join_conversation', { conversationId });
};

export const leaveConversation = (conversationId) => {
  emitEvent('leave_conversation', { conversationId });
};

export const sendMessage = (messageData) => {
  emitEvent('send_message', messageData);
};

export const markMessageAsRead = (messageId) => {
  emitEvent('mark_as_read', { messageId });
};

export const startTyping = (conversationId) => {
  emitEvent('typing_start', { conversationId });
};

export const stopTyping = (conversationId) => {
  emitEvent('typing_stop', { conversationId });
};

// Presence events
export const updatePresence = (status) => {
  emitEvent('presence_update', { status });
};

// Call events
export const initiateCall = (callData) => {
  emitEvent('call_initiate', callData);
};

export const joinCall = (callId) => {
  emitEvent('call_join', { callId });
};

export const endCall = (callId) => {
  emitEvent('call_end', { callId });
};

// Game events
export const startGame = (gameData) => {
  emitEvent('game_start', gameData);
};

export const makeGameMove = (moveData) => {
  emitEvent('game_move', moveData);
};

// Event listeners for incoming events
export const onNewMessage = (callback) => onEvent('new_message', callback);
export const onMessageUpdate = (callback) => onEvent('message_updated', callback);
export const onMessageDelete = (callback) => onEvent('message_deleted', callback);
export const onTypingStart = (callback) => onEvent('typing_start', callback);
export const onTypingStop = (callback) => onEvent('typing_stop', callback);
export const onUserOnline = (callback) => onEvent('user_online', callback);
export const onUserOffline = (callback) => onEvent('user_offline', callback);
export const onCallIncoming = (callback) => onEvent('call_incoming', callback);
export const onCallEnded = (callback) => onEvent('call_ended', callback);
export const onGameUpdate = (callback) => onEvent('game_update', callback);

// Cleanup function
export const cleanupSocket = () => {
  // Remove all custom listeners
  eventListeners.forEach((callbacks, event) => {
    callbacks.forEach(callback => {
      socket?.off(event, callback);
    });
  });
  eventListeners.clear();
  
  disconnectSocket();
};

// Hook for React components
export const useSocket = () => {
  return {
    socket,
    isConnected,
    connect: connectSocket,
    disconnect: disconnectSocket,
    emit: emitEvent,
    on: onEvent,
    off: offEvent,
    // Chat methods
    joinConversation,
    leaveConversation,
    sendMessage,
    markMessageAsRead,
    startTyping,
    stopTyping,
    // Presence methods
    updatePresence,
    // Call methods
    initiateCall,
    joinCall,
    endCall,
    // Game methods
    startGame,
    makeGameMove,
  };
};

export default {
  connect: connectSocket,
  disconnect: disconnectSocket,
  emit: emitEvent,
  on: onEvent,
  off: offEvent,
  isConnected: isSocketConnected,
  getSocket,
  useSocket,
  cleanupSocket,
};