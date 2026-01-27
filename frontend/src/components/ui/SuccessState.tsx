import React from 'react';
import { CheckCircle, Check } from 'lucide-react';
import { Button } from './Button';

interface SuccessStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const SuccessState: React.FC<SuccessStateProps> = ({
  title,
  message,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      <div className="mb-4 p-4 bg-success-50 dark:bg-success-900/20 rounded-full">
        <CheckCircle className="w-12 h-12 text-success-500" />
      </div>
      
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
        {title}
      </h3>
      
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6 max-w-md">
        {message}
      </p>
      
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

// Inline success message
interface InlineSuccessProps {
  message: string;
  className?: string;
}

export const InlineSuccess: React.FC<InlineSuccessProps> = ({ message, className = '' }) => (
  <div className={`flex items-center gap-2 text-sm text-success-600 dark:text-success-400 ${className}`}>
    <CheckCircle className="w-4 h-4 flex-shrink-0" />
    <span>{message}</span>
  </div>
);

// Success badge
export const SuccessBadge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-flex items-center gap-1 px-2 py-1 bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300 text-xs font-medium rounded-full">
    <Check className="w-3 h-3" />
    {children}
  </span>
);

// Success banner
interface SuccessBannerProps {
  message: string;
  onDismiss?: () => void;
}

export const SuccessBanner: React.FC<SuccessBannerProps> = ({ message, onDismiss }) => (
  <div className="flex items-center justify-between p-4 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg">
    <div className="flex items-center gap-3">
      <CheckCircle className="w-5 h-5 text-success-500 flex-shrink-0" />
      <p className="text-sm text-success-800 dark:text-success-200">{message}</p>
    </div>
    {onDismiss && (
      <button
        onClick={onDismiss}
        className="text-success-600 hover:text-success-800 dark:text-success-400 dark:hover:text-success-200"
      >
        <span className="sr-only">Fechar</span>
        ×
      </button>
    )}
  </div>
);
