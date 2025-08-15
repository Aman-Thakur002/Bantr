import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { motion } from 'framer-motion';

const predefinedThemes = [
  { name: 'Default', colors: { primary: '#646cff' } },
  { name: 'Forest', colors: { primary: '#22c55e' } },
  { name: 'Rose', colors: { primary: '#f43f5e' } },
  { name: 'Sky', colors: { primary: '#38bdf8' } },
];

const ThemeSwitcher = () => {
  const { theme, toggleMode, applyThemeColors } = useTheme();

  return (
    <div
      className="p-4 rounded-lg shadow-lg"
      style={{ backgroundColor: 'var(--color-card)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="font-semibold" style={{ color: 'var(--color-text)' }}>Theme</span>
        <button onClick={toggleMode} className="p-2 rounded bg-background text-text">
          Toggle {theme.mode === 'light' ? 'Dark' : 'Light'}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {predefinedThemes.map((preset) => (
          <motion.button
            key={preset.name}
            onClick={() => applyThemeColors(preset.colors)}
            className="p-2 text-sm text-left rounded"
            style={{
              backgroundColor: preset.colors.primary,
              color: 'white',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {preset.name}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default ThemeSwitcher;
