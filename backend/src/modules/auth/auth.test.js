import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import * as authService from './auth.service.js';
import User from '../users/user.model.js';

let mongoServer;

// Test data
const userData = {
  name: 'Test User',
  phone: '+1234567890',
  email: 'test@example.com',
  password: 'password123',
};

// Setup and Teardown
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
});

// Test suite for Authentication Service
describe('Auth Service', () => {
  // Test for user registration
  it('should register a new user successfully', async () => {
    const result = await authService.register(userData);
    expect(result.user).toBeDefined();
    expect(result.tokens).toBeDefined();
    expect(result.user.name).toBe(userData.name);
    const dbUser = await User.findById(result.user._id);
    expect(dbUser).toBeDefined();
  });

  it('should not register a user with a duplicate phone number', async () => {
    await authService.register(userData);
    await expect(authService.register({ ...userData, email: 'new@test.com' })).rejects.toThrow('User with this email or phone already exists');
  });

  // Test for user login
  it('should login an existing user successfully', async () => {
    await authService.register(userData);
    const result = await authService.login({ identifier: userData.email, password: userData.password });
    expect(result.user).toBeDefined();
    expect(result.tokens).toBeDefined();
  });

  it('should not login with incorrect password', async () => {
    await authService.register(userData);
    await expect(authService.login({ identifier: userData.email, password: 'wrongpassword' })).rejects.toThrow('Invalid credentials');
  });

  // Test for password reset flow
  describe('Password Reset', () => {
    let user;

    beforeEach(async () => {
      const result = await authService.register(userData);
      user = result.user;
    });

    it('should generate a password reset token', async () => {
      const resetToken = await authService.forgotPassword(userData.email);
      expect(resetToken).toBeDefined();
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.passwordResetToken).toBeDefined();
    });

    it('should reset password with a valid token', async () => {
      const resetToken = await authService.forgotPassword(userData.email);
      const newPassword = 'newpassword123';

      await authService.resetPassword({ token: resetToken, newPassword });

      // Try logging in with the new password
      const loginResult = await authService.login({ identifier: userData.email, password: newPassword });
      expect(loginResult.user).toBeDefined();

      // The old password should no longer work
      await expect(authService.login({ identifier: userData.email, password: userData.password })).rejects.toThrow('Invalid credentials');
    });

    it('should not reset password with an invalid token', async () => {
      const newPassword = 'newpassword123';
      await expect(authService.resetPassword({ token: 'invalidtoken', newPassword })).rejects.toThrow('Token is invalid or has expired');
    });

    it('should not reset password with an expired token', async () => {
      const resetToken = await authService.forgotPassword(userData.email);
      const newPassword = 'newpassword123';

      // Manually expire the token in the database
      await User.updateOne({ _id: user._id }, { passwordResetExpires: new Date(Date.now() - 1000) });

      await expect(authService.resetPassword({ token: resetToken, newPassword })).rejects.toThrow('Token is invalid or has expired');
    });
  });
});
