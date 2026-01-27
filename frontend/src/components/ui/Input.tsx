import React from 'react';
import { AlertCircle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, className = '', ...props }, ref) => {
    const inputId = props.id || `input-${Math.random().toString(36).substr(2, 9)}`;
    
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-text-primary mb-1"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
              {icon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full px-3 py-2 
              ${icon ? 'pl-10' : ''}
              bg-background-paper
              border rounded-md
              ${error ? 'border-error-500 focus:ring-error-500' : 'border-neutral-300 dark:border-neutral-600 focus:ring-primary-500'}
              text-text-primary
              placeholder:text-text-disabled
              focus:outline-none focus:ring-2 focus:ring-offset-0
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-200
              ${className}
            `}
            {...props}
          />
          
          {error && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-error-500">
              <AlertCircle className="w-5 h-5" />
            </div>
          )}
        </div>
        
        {error && (
          <p className="mt-1 text-sm text-error-500 flex items-center gap-1">
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p className="mt-1 text-sm text-text-secondary">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
