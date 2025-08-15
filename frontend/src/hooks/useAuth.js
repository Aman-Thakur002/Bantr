import { useContext } from 'react';
import AuthContext from '../contexts/AuthContext';

/**
 * Custom hook for accessing the auth context.
 * @returns {{
 *  user: object | null,
 *  loading: boolean,
 *  login: (identifier, password) => Promise<object>,
 *  signup: (name, phone, email, password) => Promise<object>,
 *  logout: () => void
 * }}
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
