import { createContext, useState, useEffect } from 'react';
import { hexToRgbString } from '../utils/colors';

const ThemeContext = createContext();

const darkColors = {
  primary: '#646cff',
  background: '#1a1a1a',
  card: '#242424',
  text: 'rgba(255, 255, 255, 0.87)',
  textSecondary: 'rgba(255, 255, 255, 0.6)',
};

const lightColors = {
  primary: '#535bf2',
  background: '#ffffff',
  card: '#f9f9f9',
  text: '#213547',
  textSecondary: '#333333',
};

const initialTheme = {
  mode: 'dark',
  colors: darkColors,
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('app-theme');
      return savedTheme ? JSON.parse(savedTheme) : initialTheme;
    } catch (error) {
      console.error("Failed to parse theme from localStorage", error);
      return initialTheme;
    }
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme.mode);

    // Apply colors as CSS variables, including RGB versions for transparency
    for (const [key, value] of Object.entries(theme.colors)) {
      root.style.setProperty(`--color-${key}`, value);
      const rgbString = hexToRgbString(value);
      if (rgbString) {
        root.style.setProperty(`--color-${key}-rgb`, rgbString);
      }
    }

    try {
      localStorage.setItem('app-theme', JSON.stringify(theme));
    } catch (error) {
      console.error("Failed to save theme to localStorage", error);
    }
  }, [theme]);

  const toggleMode = () => {
    setTheme(prevTheme => {
      const newMode = prevTheme.mode === 'light' ? 'dark' : 'light';
      return { ...prevTheme, mode: newMode, colors: newMode === 'light' ? lightColors : darkColors };
    });
  };

  const applyThemeColors = (newColors) => {
    setTheme(prevTheme => ({
      ...prevTheme,
      colors: { ...prevTheme.colors, ...newColors },
    }));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleMode, applyThemeColors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
