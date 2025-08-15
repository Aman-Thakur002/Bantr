import * as authService from './auth.service.js';
import { success } from '../../utils/response.js';

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

export async function login(req, res) {
  const { identifier, password } = req.body;
  
  const result = await authService.login({ identifier, password });

  res.json(success(result, 'Login successful'));
}

export async function refresh(req, res) {
  const { refreshToken } = req.body;
  
  const result = await authService.refresh(refreshToken);

  res.json(success(result, 'Tokens refreshed'));
}

export async function logout(req, res) {
  await authService.logout(req.user._id);

  res.json(success(null, 'Logout successful'));
}

export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  
  await authService.changePassword(req.user._id, {
    currentPassword,
    newPassword,
  });

  res.json(success(null, 'Password changed successfully'));
}

export async function forgotPassword(req, res) {
  res.json(success(null, 'Password reset instructions sent'));
}

export async function resetPassword(req, res) {
  res.json(success(null, 'Password reset successful'));
}