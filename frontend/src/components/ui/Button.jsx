import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ children, className, ...props }) => {
  const primaryColor = 'var(--color-primary)';

  return (
    <motion.button
      className={`w-full px-6 py-3 font-semibold text-white rounded-lg shadow-lg focus:outline-none ${className}`}
      style={{ backgroundColor: primaryColor }}
      whileHover={{ scale: 1.05, filter: 'brightness(1.1)' }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;
