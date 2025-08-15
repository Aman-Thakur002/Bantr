import React from 'react';
import { motion } from 'framer-motion';
import Avatar from '../ui/Avatar';
import GlassCard from '../ui/GlassCard';

const TypingIndicator = ({ users }) => {
  const getTypingText = () => {
    if (users.length === 1) {
      return `${users[0].firstName} is typing...`;
    } else if (users.length === 2) {
      return `${users[0].firstName} and ${users[1].firstName} are typing...`;
    } else {
      return `${users.length} people are typing...`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex items-end space-x-2"
    >
      <Avatar
        src={users[0]?.avatar}
        fallback={`${users[0]?.firstName?.[0]}${users[0]?.lastName?.[0]}`}
        size="sm"
      />
      
      <GlassCard className="px-4 py-2 shadow-md">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {getTypingText()}
          </span>
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full"
              />
            ))}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default TypingIndicator;