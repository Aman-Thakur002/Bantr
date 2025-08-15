import * as authService from './auth.service.js';
import { success } from '../../utils/response.js';

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export async function register(req, res) {
  const { name, email, phone, password } = req.body;
  
  const result = await authService.register({
    name,
    email,
    phone,
    password,
  });

  res.status(201).json(success(result, 'User registered successfully'));
}

/**
 * @desc    Authenticate a user and get tokens
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export async function login(req, res) {
  const { identifier, password } = req.body;
  
  const result = await authService.login({ identifier, password });

  res.json(success(result, 'Login successful'));
}

/**
 * @desc    Refresh access token
 * @route   POST /api/v1/auth/refresh
 * @access  Public
 */
export async function refresh(req, res) {
  const { refreshToken } = req.body;
  
  const result = await authService.refresh(refreshToken);

  res.json(success(result, 'Tokens refreshed'));
}

/**
 * @desc    Logout user
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
export async function logout(req, res) {
  await authService.logout(req.user._id);

  res.json(success(null, 'Logout successful'));
}

/**
 * @desc    Change user password
 * @route   POST /api/v1/auth/password/change
 * @access  Private
 */
export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  
  await authService.changePassword(req.user._id, {
    currentPassword,
    newPassword,
  });

  res.json(success(null, 'Password changed successfully'));
}

/**
 * @desc    Forgot password
 * @route   POST /api/v1/auth/password/forgot
 * @access  Public
 */
export async function forgotPassword(req, res) {
  const { identifier } = req.body;
  await authService.forgotPassword(identifier);
  res.json(success(null, 'If a user with that identifier exists, a password reset token has been created.'));
}

/**
 * @desc    Reset password
 * @route   POST /api/v1/auth/password/reset
 * @access  Public
 */
export async function resetPassword(req, res) {
  const { token, newPassword } = req.body;
  await authService.resetPassword({ token, newPassword });
  res.json(success(null, 'Password has been reset successfully.'));
}