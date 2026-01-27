import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Carregando...',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };
  
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} text-primary-500 animate-spin mb-3`} />
      {message && (
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {message}
        </p>
      )}
    </div>
  );
};

// Loading spinner for buttons
interface ButtonLoadingProps {
  size?: 'sm' | 'md';
}

export const ButtonLoading: React.FC<ButtonLoadingProps> = ({ size = 'sm' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
  };
  
  return (
    <Loader2 className={`${sizeClasses[size]} animate-spin`} />
  );
};

// Full page loading
export const PageLoading: React.FC<{ message?: string }> = ({ message }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
      <LoadingState message={message} size="lg" />
    </div>
  );
};

// Inline loading
export const InlineLoading: React.FC<{ message?: string }> = ({ message }) => {
  return (
    <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
      <Loader2 className="w-4 h-4 animate-spin" />
      {message && <span>{message}</span>}
    </div>
  );
};

// Overlay loading
interface OverlayLoadingProps {
  message?: string;
  transparent?: boolean;
}

export const OverlayLoading: React.FC<OverlayLoadingProps> = ({
  message,
  transparent = false,
}) => {
  return (
    <div
      className={`absolute inset-0 flex items-center justify-center z-50 ${
        transparent ? 'bg-white/50 dark:bg-neutral-900/50' : 'bg-white dark:bg-neutral-900'
      }`}
    >
      <LoadingState message={message} size="lg" />
    </div>
  );
};
