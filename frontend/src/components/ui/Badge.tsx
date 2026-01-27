import React from 'react';

export type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'neutral';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-success-50 text-success-700 border-success-200 dark:bg-success-900/20 dark:text-success-500 dark:border-success-800',
  error: 'bg-error-50 text-error-700 border-error-200 dark:bg-error-900/20 dark:text-error-500 dark:border-error-800',
  warning: 'bg-warning-50 text-warning-700 border-warning-200 dark:bg-warning-900/20 dark:text-warning-500 dark:border-warning-800',
  info: 'bg-info-50 text-info-700 border-info-200 dark:bg-info-900/20 dark:text-info-500 dark:border-info-800',
  neutral: 'bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  icon,
  children,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center gap-1 font-medium rounded-full border';
  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;
  
  return (
    <span className={combinedClassName} {...props}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
