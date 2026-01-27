import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 shadow-sm',
  secondary: 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-400 dark:bg-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-600',
  outline: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-50 active:bg-primary-100 dark:hover:bg-primary-900/20',
  ghost: 'text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200 dark:text-neutral-300 dark:hover:bg-neutral-800',
  danger: 'bg-error-500 text-white hover:bg-error-600 active:bg-error-700 shadow-sm',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  disabled,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;
  
  return (
    <button
      className={combinedClassName}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : icon ? (
        icon
      ) : null}
      {children}
    </button>
  );
};
