import React from 'react';
import { motion } from 'framer-motion';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const Card = ({ children, className }) => {
  const cardBgColor = 'var(--color-card)';

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className={`
        w-full max-w-md p-8 rounded-2xl shadow-lg
        border border-white/10
        ${className}
      `}
      style={{
        // Glassmorphism effect
        backgroundColor: 'rgba(var(--color-card-rgb), 0.5)', // Assuming card color is available as RGB
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      {children}
    </motion.div>
  );
};

// A helper function to convert hex to rgb values needs to be created in utils
// For now, I'll assume the ThemeContext will also provide RGB versions of colors.
// I will update the ThemeContext later to add this.

export default Card;
