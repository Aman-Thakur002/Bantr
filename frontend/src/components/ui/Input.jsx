import React from 'react';
import { cn } from '../../lib/utils';
import useThemeStore from '../../stores/useThemeStore';

const Input = React.forwardRef(({
  className,
  type = 'text',
  error,
  label,
  ...props
}, ref) => {
  const { glassMorphism } = useThemeStore();
  
  const baseClasses = 'w-full px-3 py-2 text-sm transition-all duration-200 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50';
  
  const glassClasses = glassMorphism
    ? 'bg-white/10 border-white/20 backdrop-blur-md text-gray-800 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400'
    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white';
  
  const errorClasses = error 
    ? 'border-red-500 focus:ring-red-500/20' 
    : 'focus:border-primary';

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <input
        type={type}
        className={cn(
          baseClasses,
          glassClasses,
          errorClasses,
          className
        )}
        ref={ref}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;