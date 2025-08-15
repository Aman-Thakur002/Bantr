import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

export function generateTokens(payload) {
  const accessToken = jwt.sign(payload, config.JWT_ACCESS_SECRET, {
    expiresIn: config.JWT_ACCESS_TTL,
  });

  const refreshToken = jwt.sign(payload, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_TTL,
  });

  return { accessToken, refreshToken };
}

export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, config.JWT_ACCESS_SECRET);
  } catch (error) {
    throw new Error('Invalid access token');
  }
}

export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, config.JWT_REFRESH_SECRET);
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
}

export function extractTokenFromHeader(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}