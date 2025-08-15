import React from 'react';
import { cn } from '../../lib/utils';
import useThemeStore from '../../stores/useThemeStore';

const GlassCard = ({ 
  children, 
  className, 
  variant = 'default',
  blur = 'md',
  ...props 
}) => {
  const { glassMorphism } = useThemeStore();
  
  const variants = {
    default: 'bg-white/10 border-white/20',
    strong: 'bg-white/20 border-white/30',
    subtle: 'bg-white/5 border-white/10',
    solid: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
  };
  
  const blurLevels = {
    none: '',
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl',
  };
  
  const baseClasses = 'rounded-xl border transition-all duration-200';
  const glassClasses = glassMorphism 
    ? `${variants[variant]} ${blurLevels[blur]} backdrop-saturate-150`
    : variants.solid;
  
  return (
    <div 
      className={cn(baseClasses, glassClasses, className)} 
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;