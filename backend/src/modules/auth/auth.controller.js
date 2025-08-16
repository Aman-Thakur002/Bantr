import * as authService from './auth.service.js';
import { success } from '../../utils/response.js';

//------------------<< register user >>---------------------
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

//------------------<< login user >>---------------------
export async function login(req, res) {
  const { identifier, password } = req.body;
  
  const result = await authService.login({ identifier, password });

  res.json(success(result, 'Login successful'));
}

//---------------<< refresh tokens >>---------------------
export async function refresh(req, res) {
  const { refreshToken } = req.body;
  
  const result = await authService.refresh(refreshToken);

  res.json(success(result, 'Tokens refreshed'));
}

//------------------<< logout user >>---------------------
export async function logout(req, res) {
  await authService.logout(req.user._id);

  res.json(success(null, 'Logout successful'));
}

//------------------<< change password >>---------------------
export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  
  await authService.changePassword(req.user._id, {
    currentPassword,
    newPassword,
  });

  res.json(success(null, 'Password changed successfully'));
}

//------------------<< forgot password >>---------------------
export async function forgotPassword(req, res) {
  const { identifier } = req.body;
  await authService.forgotPassword(identifier);
  res.json(success(null, 'If a user with that identifier exists, a password reset token has been created.'));
}

//------------------<< reset password >>---------------------
export async function resetPassword(req, res) {
  const { token, newPassword } = req.body;
  await authService.resetPassword({ token, newPassword });
  res.json(success(null, 'Password has been reset successfully.'));
}