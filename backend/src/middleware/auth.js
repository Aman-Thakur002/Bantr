import { verifyAccessToken, extractTokenFromHeader } from '../utils/tokens.js';
import { AppError} from './errors.js';
import User from '../modules/users/user.model.js';

export async function authenticate(req, res, next) {
  const token = extractTokenFromHeader(req.headers.authorization);
  
  if (!token) {
    throw new AppError('Access token required', 401, 'TOKEN_REQUIRED');
  }

  try {
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.userId).select('-passwordHash');
    
    if (!user) {
      throw new AppError('User not found', 401, 'USER_NOT_FOUND');
    }

    req.user = user;
    next();
  } catch (error) {
    throw new AppError('Invalid token', 401, 'INVALID_TOKEN');
  }
};

export async function optional(req, res, next){
  const token = extractTokenFromHeader(req.headers.authorization);
  
  if (token) {
    try {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.userId).select('-passwordHash');
      req.user = user;
    } catch (error) {
      // Ignore invalid tokens for optional auth
    }
  }
  
  next();
};