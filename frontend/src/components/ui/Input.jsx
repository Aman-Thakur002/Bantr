import React from 'react';
import { motion } from 'framer-motion';

const Input = ({ id, label, type = 'text', ...props }) => {
  const primaryColor = 'var(--color-primary)';
  const textColor = 'var(--color-text)';
  const bgColor = 'var(--color-background)';

  return (
    <div className="relative w-full">
      <motion.input
        id={id}
        type={type}
        {...props}
        className="w-full px-4 py-3 bg-transparent border-2 rounded-lg peer focus:outline-none"
        style={{
          borderColor: 'rgba(var(--color-text-rgb), 0.2)',
          color: textColor,
        }}
        whileFocus={{
          borderColor: primaryColor,
          boxShadow: `0 0 0 2px ${primaryColor}40`, // 25% opacity
        }}
        placeholder=" " // Required for the label animation to work
      />
      <label
        htmlFor={id}
        className="absolute left-4 transition-all duration-300 pointer-events-none
                   peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base
                   peer-focus:-top-2.5 peer-focus:text-sm
                   -top-2.5 text-sm"
        style={{
          color: 'rgba(var(--color-text-rgb), 0.5)',
          backgroundColor: bgColor
        }}
      >
        {label}
      </label>
    </div>
  );
};

export default Input;
