const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error('VITE_API_BASE_URL environment variable is required');
}

// Token management
let accessToken = localStorage.getItem('accessToken');
let refreshToken = localStorage.getItem('refreshToken');

export const setTokens = (access, refresh) => {
  accessToken = access;
  refreshToken = refresh;
  if (access) localStorage.setItem('accessToken', access);
  if (refresh) localStorage.setItem('refreshToken', refresh);
};

export const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

export const getAccessToken = () => accessToken;

// HTTP request helper
const request = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };
  
  console.log('Making request to:', url);
  console.log('Request config:', config);

  // Add auth header if token exists
  if (accessToken && !options.skipAuth) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  try {
    const response = await fetch(url, config);
    
    // Handle token refresh on 401 - DISABLED
    // if (response.status === 401 && refreshToken && !options.skipRefresh) {
    //   const refreshed = await refreshAccessToken();
    //   if (refreshed) {
    //     config.headers.Authorization = `Bearer ${accessToken}`;
    //     return fetch(url, config);
    //   } else {
    //     clearTokens();
    //     throw new Error('Session expired');
    //   }
    // }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
};

// Token refresh
const refreshAccessToken = async () => {
  if (!refreshToken) return false;
  
  try {
    const response = await request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
      skipAuth: true,
      skipRefresh: true,
    });
    
    if (response.data?.tokens?.accessToken) {
      setTokens(response.data.tokens.accessToken, refreshToken);
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

// Auth API
export const authAPI = {
  register: (userData) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
    skipAuth: true,
  }),

  login: (identifier, password) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier, password }),
    skipAuth: true,
  }),

  logout: () => request('/auth/logout', { method: 'POST' }),

  changePassword: (currentPassword, newPassword) => request('/auth/password/change', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  }),

  forgotPassword: (identifier) => request('/auth/password/forgot', {
    method: 'POST',
    body: JSON.stringify({ identifier }),
    skipAuth: true,
  }),

  resetPassword: (token, newPassword) => request('/auth/password/reset', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
    skipAuth: true,
  }),

  refreshToken: (token) => request('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken: token }),
    skipAuth: true,
    skipRefresh: true,
  }),
};

// User API
export const userAPI = {
  getProfile: () => request('/users/profile'),
  
  updateProfile: (data) => request('/users/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return request('/users/avatar', {
      method: 'POST',
      body: formData,
      headers: {},
    });
  },

  searchUsers: (query, page = 1, limit = 10) => 
    request(`/users/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`),

  getUserById: (userId) => request(`/users/${userId}`),

  getContacts: (page = 1, limit = 20) => 
    request(`/users/contacts?page=${page}&limit=${limit}`),

  addContact: (userId, nickname) => request('/users/contacts', {
    method: 'POST',
    body: JSON.stringify({ userId, nickname }),
  }),

  updateContact: (userId, nickname) => request(`/users/contacts/${userId}`, {
    method: 'PUT',
    body: JSON.stringify({ nickname }),
  }),

  deleteContact: (userId) => request(`/users/contacts/${userId}`, {
    method: 'DELETE',
  }),

  blockContact: (userId) => request(`/users/contacts/${userId}/block`, {
    method: 'PUT',
  }),

  unblockContact: (userId) => request(`/users/contacts/${userId}/unblock`, {
    method: 'PUT',
  }),
};

// Conversation API
export const conversationAPI = {
  getConversations: (page = 1, limit = 20, type) => {
    const params = new URLSearchParams({ page, limit });
    if (type) params.append('type', type);
    return request(`/conversations?${params}`);
  },

  getConversation: (id) => request(`/conversations/${id}`),

  createConversation: (data) => request('/conversations', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  updateConversation: (id, data) => request(`/conversations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  deleteConversation: (id) => request(`/conversations/${id}`, {
    method: 'DELETE',
  }),

  addParticipant: (id, userId) => request(`/conversations/${id}/participants`, {
    method: 'POST',
    body: JSON.stringify({ userId }),
  }),

  removeParticipant: (id, userId) => request(`/conversations/${id}/participants/${userId}`, {
    method: 'DELETE',
  }),

  leaveConversation: (id) => request(`/conversations/${id}/leave`, {
    method: 'POST',
  }),
};

// Message API
export const messageAPI = {
  getMessages: (conversationId, page = 1, limit = 50) => 
    request(`/messages?conversationId=${conversationId}&page=${page}&limit=${limit}`),

  getMessage: (id) => request(`/messages/${id}`),

  sendMessage: (data) => request('/messages', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  updateMessage: (id, content) => request(`/messages/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ content }),
  }),

  deleteMessage: (id) => request(`/messages/${id}`, {
    method: 'DELETE',
  }),

  markAsRead: (id) => request(`/messages/${id}/read`, {
    method: 'PUT',
  }),

  reactToMessage: (id, emoji) => request(`/messages/${id}/react`, {
    method: 'POST',
    body: JSON.stringify({ emoji }),
  }),

  searchMessages: (query, conversationId, page = 1, limit = 20) => {
    const params = new URLSearchParams({ q: query, page, limit });
    if (conversationId) params.append('conversationId', conversationId);
    return request(`/messages/search?${params}`);
  },
};

// Attachment API
export const attachmentAPI = {
  upload: (file, type) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    return request('/attachments/upload', {
      method: 'POST',
      body: formData,
      headers: {},
    });
  },

  getAttachment: (id) => request(`/attachments/${id}`),

  deleteAttachment: (id) => request(`/attachments/${id}`, {
    method: 'DELETE',
  }),

  getUserAttachments: (type, page = 1, limit = 20) => {
    const params = new URLSearchParams({ page, limit });
    if (type) params.append('type', type);
    return request(`/attachments?${params}`);
  },
};

// Call API
export const callAPI = {
  initiateCall: (data) => request('/calls', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  getCall: (id) => request(`/calls/${id}`),

  joinCall: (id) => request(`/calls/${id}/join`, {
    method: 'POST',
  }),

  endCall: (id) => request(`/calls/${id}/end`, {
    method: 'POST',
  }),

  getCallHistory: (page = 1, limit = 20, type) => {
    const params = new URLSearchParams({ page, limit });
    if (type) params.append('type', type);
    return request(`/calls?${params}`);
  },
};

// AI API
export const aiAPI = {
  chat: (message, conversationId, provider = 'openai') => request('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ message, conversationId, provider }),
  }),

  generateImage: (prompt, size = '1024x1024', provider = 'openai') => request('/ai/image/generate', {
    method: 'POST',
    body: JSON.stringify({ prompt, size, provider }),
  }),

  analyzeImage: (image, prompt = 'What do you see in this image?') => {
    const formData = new FormData();
    formData.append('image', image);
    formData.append('prompt', prompt);
    return request('/ai/image/analyze', {
      method: 'POST',
      body: formData,
      headers: {},
    });
  },

  translate: (text, from, to) => request('/ai/translate', {
    method: 'POST',
    body: JSON.stringify({ text, from, to }),
  }),
};

// Game API
export const gameAPI = {
  createTicTacToe: (conversationId) => request('/games/tictactoe', {
    method: 'POST',
    body: JSON.stringify({ conversationId }),
  }),

  joinTicTacToe: (gameId) => request(`/games/tictactoe/${gameId}/join`, {
    method: 'POST',
  }),

  makeMove: (gameId, position) => request(`/games/tictactoe/${gameId}/move`, {
    method: 'POST',
    body: JSON.stringify({ position }),
  }),

  resetGame: (gameId) => request(`/games/tictactoe/${gameId}/reset`, {
    method: 'POST',
  }),

  getGame: (gameId) => request(`/games/tictactoe/${gameId}`),

  getConversationGames: (conversationId) => request(`/games/tictactoe?conversationId=${conversationId}`),
};

// Admin API
export const adminAPI = {
  getAllUsers: (page = 1, limit = 20, status, role) => {
    const params = new URLSearchParams({ page, limit });
    if (status) params.append('status', status);
    if (role) params.append('role', role);
    return request(`/admin/users?${params}`);
  },

  updateUserStatus: (userId, status, reason) => request(`/admin/users/${userId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, reason }),
  }),

  updateUserRole: (userId, role) => request(`/admin/users/${userId}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  }),

  getSystemStats: () => request('/admin/stats'),
};

export default {
  auth: authAPI,
  user: userAPI,
  conversation: conversationAPI,
  message: messageAPI,
  attachment: attachmentAPI,
  call: callAPI,
  ai: aiAPI,
  game: gameAPI,
  admin: adminAPI,
};