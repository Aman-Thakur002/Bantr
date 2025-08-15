import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const defaultThemes = {
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    primary: '#3b82f6',
    secondary: '#1d4ed8',
    accent: '#06b6d4',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    background: '#f8fafc',
    surface: '#ffffff',
    text: '#1e293b',
    textSecondary: '#64748b',
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset',
    primary: '#f97316',
    secondary: '#ea580c',
    accent: '#f59e0b',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    background: '#fef7ed',
    surface: '#ffffff',
    text: '#1e293b',
    textSecondary: '#64748b',
  },
  forest: {
    id: 'forest',
    name: 'Forest',
    primary: '#16a34a',
    secondary: '#15803d',
    accent: '#22c55e',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    background: '#f0fdf4',
    surface: '#ffffff',
    text: '#1e293b',
    textSecondary: '#64748b',
  },
  purple: {
    id: 'purple',
    name: 'Purple',
    primary: '#8b5cf6',
    secondary: '#7c3aed',
    accent: '#a855f7',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    background: '#faf5ff',
    surface: '#ffffff',
    text: '#1e293b',
    textSecondary: '#64748b',
  },
  rose: {
    id: 'rose',
    name: 'Rose',
    primary: '#e11d48',
    secondary: '#be123c',
    accent: '#f43f5e',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    background: '#fdf2f8',
    surface: '#ffffff',
    text: '#1e293b',
    textSecondary: '#64748b',
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald',
    primary: '#059669',
    secondary: '#047857',
    accent: '#10b981',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    background: '#ecfdf5',
    surface: '#ffffff',
    text: '#1e293b',
    textSecondary: '#64748b',
  },
};

const useThemeStore = create(
  persist(
    (set, get) => ({
      // State
      mode: 'light', // 'light' | 'dark'
      activeTheme: 'ocean',
      customThemes: {},
      glassMorphism: true,

      // Getters
      getCurrentTheme: () => {
        const { activeTheme, customThemes } = get();
        return customThemes[activeTheme] || defaultThemes[activeTheme] || defaultThemes.ocean;
      },

      getAllThemes: () => {
        const { customThemes } = get();
        return { ...defaultThemes, ...customThemes };
      },

      // Actions
      setMode: (mode) => {
        set({ mode });
        document.documentElement.classList.toggle('dark', mode === 'dark');
      },

      toggleMode: () => {
        const { mode } = get();
        const newMode = mode === 'light' ? 'dark' : 'light';
        get().setMode(newMode);
      },

      setActiveTheme: (themeId) => {
        set({ activeTheme: themeId });
        get().applyTheme();
      },

      addCustomTheme: (theme) => {
        set(state => ({
          customThemes: {
            ...state.customThemes,
            [theme.id]: theme,
          },
        }));
      },

      removeCustomTheme: (themeId) => {
        set(state => {
          const { [themeId]: removed, ...rest } = state.customThemes;
          return { customThemes: rest };
        });
      },

      updateCustomTheme: (themeId, updates) => {
        set(state => ({
          customThemes: {
            ...state.customThemes,
            [themeId]: {
              ...state.customThemes[themeId],
              ...updates,
            },
          },
        }));
      },

      setGlassMorphism: (enabled) => {
        set({ glassMorphism: enabled });
      },

      // Apply theme to CSS variables
      applyTheme: () => {
        const theme = get().getCurrentTheme();
        const root = document.documentElement;
        
        Object.entries(theme).forEach(([key, value]) => {
          if (key !== 'id' && key !== 'name') {
            root.style.setProperty(`--color-${key}`, value);
          }
        });
      },

      // Initialize theme
      initialize: () => {
        const { mode } = get();
        document.documentElement.classList.toggle('dark', mode === 'dark');
        get().applyTheme();
      },
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({
        mode: state.mode,
        activeTheme: state.activeTheme,
        customThemes: state.customThemes,
        glassMorphism: state.glassMorphism,
      }),
    }
  )
);

export default useThemeStore;