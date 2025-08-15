import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../contexts/ToastContext';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(name, phone, email, password);
      addToast('Account created successfully!', 'success');
      navigate('/'); // Navigate to a dashboard or home page after signup
    } catch (err) {
      addToast(err.response?.data?.message || 'An error occurred during signup.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold" style={{ color: 'var(--color-text)' }}>Create an Account</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>Join us today!</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          id="signup-name"
          label="Full Name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={loading}
        />
        <Input
          id="signup-phone"
          label="Phone Number"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          disabled={loading}
        />
        <Input
          id="signup-email"
          label="Email (Optional)"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
        <Input
          id="signup-password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>
      <div className="text-center mt-6">
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--color-primary)' }} className="font-semibold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </Card>
  );
};

export default SignupPage;
