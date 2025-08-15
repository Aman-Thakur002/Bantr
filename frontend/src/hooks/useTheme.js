import { useContext } from 'react';
import ThemeContext from '../contexts/ThemeContext';

/**
 * Custom hook for accessing the theme context.
 * Provides access to the current theme, and functions to update it.
 * @returns {{
 *  theme: object,
 *  toggleMode: () => void,
 *  applyThemeColors: (newColors: object) => void
 * }}
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
