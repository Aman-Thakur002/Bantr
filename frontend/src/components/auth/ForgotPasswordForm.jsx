import { useState } from 'react';
import { authAPI } from '../../lib/api';

export default function ForgotPasswordForm({ onBack }) {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await authAPI.forgotPassword(identifier);
      setSent(true);
    } catch (error) {
      console.error('Forgot password error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Check Your Email</h2>
        <p className="text-gray-600 mb-4">
          If an account exists, we've sent a password reset link.
        </p>
        <button onClick={onBack} className="text-blue-600 hover:underline">
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold text-center mb-6">Reset Password</h2>
      
      <input
        type="text"
        placeholder="Email or Phone"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        className="w-full p-3 border rounded-lg"
        required
      />
      
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Sending...' : 'Send Reset Link'}
      </button>
      
      <button
        type="button"
        onClick={onBack}
        className="w-full text-gray-600 hover:underline"
      >
        Back to Login
      </button>
    </form>
  );
}