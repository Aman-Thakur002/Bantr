import { config } from './src/config/env.js';

const API_BASE = `http://localhost:${config.port}/api/v1`;

const testAPI = async () => {
  console.log('🧪 Testing API endpoints...\n');

  // Test health endpoint
  try {
    const response = await fetch(`${API_BASE}/health`);
    const data = await response.json();
    console.log('✅ Health check:', data.success ? 'PASS' : 'FAIL');
  } catch (error) {
    console.log('❌ Health check: FAIL -', error.message);
  }

  // Test auth endpoints
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    phone: '+1234567890',
    password: 'password123'
  };

  try {
    // Register
    const registerResponse = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    const registerData = await registerResponse.json();
    console.log('✅ Register:', registerData.success ? 'PASS' : 'FAIL');

    // Login
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: testUser.email,
        password: testUser.password
      })
    });
    const loginData = await loginResponse.json();
    console.log('✅ Login:', loginData.success ? 'PASS' : 'FAIL');

    if (loginData.success) {
      const { accessToken } = loginData.data.tokens;

      // Test protected endpoint
      const profileResponse = await fetch(`${API_BASE}/users/profile`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      const profileData = await profileResponse.json();
      console.log('✅ Protected route:', profileData.success ? 'PASS' : 'FAIL');

      // Forgot password
      const forgotResponse = await fetch(`${API_BASE}/auth/password/forgot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: testUser.email })
      });
      const forgotData = await forgotResponse.json();
      console.log('✅ Forgot password:', forgotData.success ? 'PASS' : 'FAIL');
    }

  } catch (error) {
    console.log('❌ Auth tests: FAIL -', error.message);
  }

  console.log('\n🎉 API testing complete!');
};

testAPI();