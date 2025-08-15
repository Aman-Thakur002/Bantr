import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on initial load
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          // You would typically have a /me or /profile endpoint to verify the token
          // and get fresh user data. I'll simulate this for now.
          // const { data } = await api.get('/users/profile');
          // For now, let's assume if a token exists, we can decode it or get user from local storage
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        } catch (error) {
          console.error("Session check failed", error);
          // Clear out stale data
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };
    checkLoggedIn();
  }, []);

  const login = async (identifier, password) => {
    const { data } = await api.post('/auth/login', { identifier, password });
    const { user, tokens } = data.data;

    localStorage.setItem('access_token', tokens.accessToken);
    localStorage.setItem('refresh_token', tokens.refreshToken);
    localStorage.setItem('user', JSON.stringify(user));

    setUser(user);
    return user;
  };

  const signup = async (name, phone, email, password) => {
    const { data } = await api.post('/auth/register', { name, phone, email, password });
    const { user, tokens } = data.data;

    localStorage.setItem('access_token', tokens.accessToken);
    localStorage.setItem('refresh_token', tokens.refreshToken);
    localStorage.setItem('user', JSON.stringify(user));

    setUser(user);
    return user;
  };

  const logout = () => {
    // In a real app, you might want to call a /auth/logout endpoint on the backend
    setUser(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
