import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

export const Modal: React.FC<ModalProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  size = 'md',
}) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-in fade-in" />
        <Dialog.Content
          className={`
            fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
            w-full ${sizeStyles[size]} max-h-[90vh]
            bg-background-paper rounded-lg shadow-xl
            p-6 z-50
            animate-in fade-in zoom-in-95
            overflow-y-auto
          `}
        >
          {title && (
            <Dialog.Title className="text-xl font-semibold text-text-primary mb-2">
              {title}
            </Dialog.Title>
          )}
          
          {description && (
            <Dialog.Description className="text-sm text-text-secondary mb-4">
              {description}
            </Dialog.Description>
          )}
          
          <div className="mt-4">
            {children}
          </div>
          
          <Dialog.Close asChild>
            <button
              className="absolute top-4 right-4 p-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export const ModalFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-end gap-3 mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700 ${className}`}>
      {children}
    </div>
  );
};
