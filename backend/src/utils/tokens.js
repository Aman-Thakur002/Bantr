import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

// Generate access and refresh tokens
export const generateTokens = (payload) => {
  // Handle different payload formats
  const tokenPayload = {
    userId: payload.userId || payload.id,
    tokenVersion: payload.tokenVersion || 0
  };

  const accessToken = jwt.sign(tokenPayload, config.JWT_ACCESS_SECRET, {
    expiresIn: config.JWT_ACCESS_TTL,
  });

  const refreshToken = jwt.sign(tokenPayload, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_TTL,
  });

  return { accessToken, refreshToken };
};

// Verify access token
export const verifyAccessToken = (token) => {
  return jwt.verify(token, config.JWT_ACCESS_SECRET);
};

// Verify refresh token
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, config.JWT_REFRESH_SECRET);
};

// Decode token without verification
export const decodeToken = (token) => {
  return jwt.decode(token);
};

// Extract token from Authorization header
export const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
};