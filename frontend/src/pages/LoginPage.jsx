import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../contexts/ToastContext';

const LoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(identifier, password);
      addToast('Login successful!', 'success');
      navigate('/'); // Navigate to a dashboard or home page after login
    } catch (err) {
      addToast(err.response?.data?.message || 'An error occurred during login.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold" style={{ color: 'var(--color-text)' }}>Welcome Back</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>Sign in to continue</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          id="login-identifier"
          label="Email or Phone"
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
          disabled={loading}
        />
        <Input
          id="login-password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </form>
      <div className="text-center mt-6">
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--color-primary)' }} className="font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </Card>
  );
};

export default LoginPage;
