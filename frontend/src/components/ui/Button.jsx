import React from 'react';
import { cn } from '../../lib/utils';
import useThemeStore from '../../stores/useThemeStore';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  loading,
  ...props
}) => {
  const { glassMorphism } = useThemeStore();
  
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: glassMorphism 
      ? 'bg-primary/80 hover:bg-primary/90 text-white border border-primary/20 backdrop-blur-md shadow-lg'
      : 'bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg',
    secondary: glassMorphism
      ? 'bg-white/10 hover:bg-white/20 text-gray-700 dark:text-white border border-white/20 backdrop-blur-md'
      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white',
    outline: glassMorphism
      ? 'border-2 border-primary/30 text-primary hover:bg-primary/10 backdrop-blur-md'
      : 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
    ghost: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
    danger: glassMorphism
      ? 'bg-red-500/80 hover:bg-red-500/90 text-white border border-red-500/20 backdrop-blur-md shadow-lg'
      : 'bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  
  return (
    <button
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : null}
      {children}
    </button>
  );
};

export default Button;