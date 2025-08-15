const API_BASE = 'http://localhost:3000/api/v1';

class ApiClient {
  constructor() {
    this.accessToken = null;
  }

  setAccessToken(token) {
    this.accessToken = token;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.accessToken && {
          Authorization: `Bearer ${this.accessToken}`,
        }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'Network error',
      }));
      throw new Error(error.message || 'API request failed');
    }

    return response.json();
  }

  // Authentication
  async register(data) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  async refreshToken(refreshToken) {
    return this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async resetPassword(email) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async sendMagicLink(email) {
    return this.request('/auth/magic-link', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async sendOTP(email, type) {
    return this.request('/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify({ email, type }),
    });
  }

  async verifyOTP(email, otp, type) {
    return this.request('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ email, otp, type }),
    });
  }

  // Users
  async getProfile() {
    return this.request('/users/profile');
  }

  async updateProfile(data) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.request('/users/avatar', {
      method: 'POST',
      body: formData,
      headers: {},
    });
  }

  async searchUsers(query, page = 1, limit = 10) {
    return this.request(`/users/search?q=${query}&page=${page}&limit=${limit}`);
  }

  async getUserById(userId) {
    return this.request(`/users/${userId}`);
  }

  async getContacts(page = 1, limit = 20) {
    return this.request(`/users/contacts?page=${page}&limit=${limit}`);
  }

  async addContact(userId, nickname) {
    return this.request('/users/contacts', {
      method: 'POST',
      body: JSON.stringify({ userId, nickname }),
    });
  }

  async updateContact(userId, nickname) {
    return this.request(`/users/contacts/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ nickname }),
    });
  }

  async deleteContact(userId) {
    return this.request(`/users/contacts/${userId}`, { method: 'DELETE' });
  }

  async blockContact(userId) {
    return this.request(`/users/contacts/${userId}/block`, { method: 'PUT' });
  }

  async unblockContact(userId) {
    return this.request(`/users/contacts/${userId}/unblock`, { method: 'PUT' });
  }

  // Conversations
  async getConversations(page = 1, limit = 20, type) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(type && { type }),
    });
    return this.request(`/conversations?${params}`);
  }

  async createConversation(data) {
    return this.request('/conversations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getConversation(id) {
    return this.request(`/conversations/${id}`);
  }

  async updateConversation(id, data) {
    return this.request(`/conversations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async addParticipant(conversationId, userId) {
    return this.request(`/conversations/${conversationId}/participants`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async removeParticipant(conversationId, userId) {
    return this.request(`/conversations/${conversationId}/participants/${userId}`, {
      method: 'DELETE',
    });
  }

  async leaveConversation(conversationId) {
    return this.request(`/conversations/${conversationId}/leave`, {
      method: 'POST',
    });
  }

  async deleteConversation(conversationId) {
    return this.request(`/conversations/${conversationId}`, {
      method: 'DELETE',
    });
  }

  // Messages
  async getMessages(conversationId, page = 1, limit = 50) {
    return this.request(
      `/messages?conversationId=${conversationId}&page=${page}&limit=${limit}`
    );
  }

  async sendMessage(data) {
    return this.request('/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMessage(id, content) {
    return this.request(`/messages/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
  }

  async deleteMessage(id) {
    return this.request(`/messages/${id}`, { method: 'DELETE' });
  }

  async markAsRead(id) {
    return this.request(`/messages/${id}/read`, { method: 'PUT' });
  }

  async reactToMessage(id, emoji) {
    return this.request(`/messages/${id}/react`, {
      method: 'POST',
      body: JSON.stringify({ emoji }),
    });
  }

  async searchMessages(query, conversationId, page = 1, limit = 20) {
    return this.request(
      `/messages/search?q=${query}&conversationId=${conversationId}&page=${page}&limit=${limit}`
    );
  }

  // Attachments
  async uploadFile(file, type) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    return this.request('/attachments/upload', {
      method: 'POST',
      body: formData,
      headers: {},
    });
  }

  async getAttachment(id) {
    return this.request(`/attachments/${id}`);
  }

  async deleteAttachment(id) {
    return this.request(`/attachments/${id}`, { method: 'DELETE' });
  }

  async getUserAttachments(type, page = 1, limit = 20) {
    return this.request(`/attachments?type=${type}&page=${page}&limit=${limit}`);
  }

  // Calls
  async initiateCall(data) {
    return this.request('/calls', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCall(callId) {
    return this.request(`/calls/${callId}`);
  }

  async joinCall(callId) {
    return this.request(`/calls/${callId}/join`, { method: 'POST' });
  }

  async endCall(callId) {
    return this.request(`/calls/${callId}/end`, { method: 'POST' });
  }

  async getCallHistory(page = 1, limit = 20, type) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(type && { type }),
    });
    return this.request(`/calls?${params}`);
  }

  // AI Features
  async chatWithAI(message, conversationId, provider = 'openai') {
    return this.request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, conversationId, provider }),
    });
  }

  async generateImage(prompt, size = '1024x1024', provider = 'openai') {
    return this.request('/ai/image/generate', {
      method: 'POST',
      body: JSON.stringify({ prompt, size, provider }),
    });
  }

  async analyzeImage(image, prompt = 'What do you see in this image?') {
    const formData = new FormData();
    formData.append('image', image);
    formData.append('prompt', prompt);
    return this.request('/ai/image/analyze', {
      method: 'POST',
      body: formData,
      headers: {},
    });
  }

  async translateText(text, from, to) {
    return this.request('/ai/translate', {
      method: 'POST',
      body: JSON.stringify({ text, from, to }),
    });
  }

  // Games
  async startTicTacToe(conversationId, opponent) {
    return this.request('/games/tictactoe/start', {
      method: 'POST',
      body: JSON.stringify({ conversationId, opponent }),
    });
  }

  async makeMove(gameId, position) {
    return this.request('/games/tictactoe/move', {
      method: 'POST',
      body: JSON.stringify({ gameId, position }),
    });
  }

  async getGameState(gameId) {
    return this.request(`/games/tictactoe/${gameId}`);
  }

  // Admin
  async getAllUsers(page = 1, limit = 20, status, role) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status }),
      ...(role && { role }),
    });
    return this.request(`/admin/users?${params}`);
  }

  async updateUserStatus(userId, status, reason) {
    return this.request(`/admin/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, reason }),
    });
  }

  async updateUserRole(userId, role) {
    return this.request(`/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }

  async getSystemStats() {
    return this.request('/admin/stats');
  }
}

export const apiClient = new ApiClient();