import React from 'react';
import { cn } from '../../lib/utils';

const Avatar = ({ 
  src, 
  alt, 
  size = 'md', 
  className,
  fallback,
  online = false,
  ...props 
}) => {
  const sizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20',
  };
  
  const textSizes = {
    xs: 'text-xs',
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
    '2xl': 'text-xl',
  };

  return (
    <div className={cn('relative', className)}>
      <div className={cn(
        'rounded-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary to-secondary shadow-lg',
        sizes[size]
      )} {...props}>
        {src ? (
          <img 
            src={src} 
            alt={alt} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className={cn(
            'w-full h-full flex items-center justify-center text-white font-medium',
            textSizes[size],
            src ? 'hidden' : 'flex'
          )}
        >
          {fallback || '?'}
        </div>
      </div>
      {online && (
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full shadow-sm"></div>
      )}
    </div>
  );
};

export default Avatar;