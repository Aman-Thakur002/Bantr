import { AppError } from './errors.js';

// Central permissions mapping
const PERMISSIONS = {
  // User permissions
  'user:read': ['user', 'moderator', 'admin'],
  'user:write': ['user', 'moderator', 'admin'],
  'user:ban': ['admin'],
  'user:delete': ['admin'],

  // Conversation permissions
  'conversation:read': ['user', 'moderator', 'admin'],
  'conversation:write': ['user', 'moderator', 'admin'],
  'conversation:delete': ['moderator', 'admin'],
  'conversation:moderate': ['moderator', 'admin'],

  // Message permissions
  'message:read': ['user', 'moderator', 'admin'],
  'message:write': ['user', 'moderator', 'admin'],
  'message:delete': ['user', 'moderator', 'admin'],
  'message:moderate': ['moderator', 'admin'],

  // Admin permissions
  'admin:stats': ['admin'],
  'admin:users': ['admin'],
  'admin:moderate': ['moderator', 'admin'],

  // AI permissions
  'ai:use': ['user', 'moderator', 'admin'],
  'ai:moderate': ['moderator', 'admin'],
};

export function hasPermission(userRole, permission) {
  const allowedRoles = PERMISSIONS[permission];
  return allowedRoles && allowedRoles.includes(userRole);
}

export function requirePermission(...permissions) {
  return (req, res, next) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401, 'AUTH_REQUIRED');
    }

    const userRole = req.user.role;
    const hasRequiredPermission = permissions.some(permission => 
      hasPermission(userRole, permission)
    );

    if (!hasRequiredPermission) {
      throw new AppError('Insufficient permissions', 403, 'INSUFFICIENT_PERMISSIONS');
    }

    next();
  };
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401, 'AUTH_REQUIRED');
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError('Insufficient permissions', 403, 'INSUFFICIENT_PERMISSIONS');
    }

    next();
  };
}