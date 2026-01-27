import React from 'react';
import toast, { Toaster, ToastOptions } from 'react-hot-toast';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

// Toast Provider Component
export const ToastProvider: React.FC = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'var(--color-background-paper)',
          color: 'var(--color-text-primary)',
          border: '1px solid var(--color-neutral-200)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px',
          boxShadow: 'var(--shadow-lg)',
        },
        success: {
          iconTheme: {
            primary: 'var(--color-success-500)',
            secondary: 'white',
          },
        },
        error: {
          iconTheme: {
            primary: 'var(--color-error-500)',
            secondary: 'white',
          },
        },
      }}
    />
  );
};

// Custom toast functions with icons
interface ToastMessage {
  title?: string;
  message: string;
}

const createToast = (
  content: string | ToastMessage,
  icon: React.ReactNode,
  options?: ToastOptions
) => {
  const isString = typeof content === 'string';
  const title = !isString ? content.title : undefined;
  const message = isString ? content : content.message;

  return toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-white dark:bg-neutral-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">{icon}</div>
            <div className="ml-3 flex-1">
              {title && (
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {title}
                </p>
              )}
              <p className={`text-sm text-neutral-600 dark:text-neutral-400 ${title ? 'mt-1' : ''}`}>
                {message}
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-neutral-200 dark:border-neutral-700">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-500 dark:hover:text-neutral-300 focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    ),
    options
  );
};

// Success toast
export const showSuccess = (content: string | ToastMessage, options?: ToastOptions) => {
  return createToast(
    content,
    <CheckCircle className="w-5 h-5 text-success-500" />,
    options
  );
};

// Error toast
export const showError = (content: string | ToastMessage, options?: ToastOptions) => {
  return createToast(
    content,
    <XCircle className="w-5 h-5 text-error-500" />,
    options
  );
};

// Warning toast
export const showWarning = (content: string | ToastMessage, options?: ToastOptions) => {
  return createToast(
    content,
    <AlertCircle className="w-5 h-5 text-warning-500" />,
    options
  );
};

// Info toast
export const showInfo = (content: string | ToastMessage, options?: ToastOptions) => {
  return createToast(
    content,
    <Info className="w-5 h-5 text-info-500" />,
    options
  );
};

// Promise toast (for async operations)
export const showPromise = <T,>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: any) => string);
  },
  options?: ToastOptions
) => {
  return toast.promise(
    promise,
    {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    },
    options
  );
};

// Loading toast
export const showLoading = (message: string, options?: ToastOptions) => {
  return toast.loading(message, options);
};

// Dismiss toast
export const dismissToast = (toastId?: string) => {
  if (toastId) {
    toast.dismiss(toastId);
  } else {
    toast.dismiss();
  }
};

// Dismiss all toasts
export const dismissAllToasts = () => {
  toast.dismiss();
};

// Export default toast for custom usage
export { toast };
