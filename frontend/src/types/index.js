// User types and interfaces
export const UserRole = {
  USER: 'user',
  MODERATOR: 'moderator', 
  ADMIN: 'admin'
};

export const UserStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended'
};

export const ConversationType = {
  PRIVATE: 'private',
  GROUP: 'group'
};

export const MessageType = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
  AUDIO: 'audio',
  VIDEO: 'video',
  GAME: 'game',
  AI: 'ai'
};

export const AttachmentType = {
  IMAGE: 'image',
  VIDEO: 'video', 
  AUDIO: 'audio',
  DOCUMENT: 'document'
};

export const CallType = {
  VOICE: 'voice',
  VIDEO: 'video'
};

export const CallStatus = {
  PENDING: 'pending',
  ACTIVE: 'active',
  ENDED: 'ended'
};

export const GameType = {
  TICTACTOE: 'tictactoe'
};

export const GameStatus = {
  WAITING: 'waiting',
  ACTIVE: 'active', 
  COMPLETED: 'completed'
};

export const ThemeMode = {
  LIGHT: 'light',
  DARK: 'dark'
};