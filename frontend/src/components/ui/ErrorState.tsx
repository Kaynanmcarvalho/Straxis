import React from 'react';
import { AlertCircle, XCircle, WifiOff, ServerCrash } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title: string;
  message: string;
  type?: 'error' | 'warning' | 'network' | 'server';
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  type = 'error',
  actionLabel,
  onAction,
  className = '',
}) => {
  const icons = {
    error: XCircle,
    warning: AlertCircle,
    network: WifiOff,
    server: ServerCrash,
  };
  
  const colors = {
    error: 'text-error-500',
    warning: 'text-warning-500',
    network: 'text-info-500',
    server: 'text-error-500',
  };
  
  const bgColors = {
    error: 'bg-error-50 dark:bg-error-900/20',
    warning: 'bg-warning-50 dark:bg-warning-900/20',
    network: 'bg-info-50 dark:bg-info-900/20',
    server: 'bg-error-50 dark:bg-error-900/20',
  };
  
  const Icon = icons[type];
  
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      <div className={`mb-4 p-4 ${bgColors[type]} rounded-full`}>
        <Icon className={`w-12 h-12 ${colors[type]}`} />
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

// Preset error states
export const NetworkError: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <ErrorState
    type="network"
    title="Sem conexão"
    message="Não foi possível conectar ao servidor. Verifique sua conexão com a internet."
    actionLabel="Tentar Novamente"
    onAction={onRetry}
  />
);

export const ServerError: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <ErrorState
    type="server"
    title="Erro no servidor"
    message="Ocorreu um erro ao processar sua solicitação. Tente novamente em alguns instantes."
    actionLabel="Tentar Novamente"
    onAction={onRetry}
  />
);

export const PermissionError: React.FC = () => (
  <ErrorState
    type="warning"
    title="Sem permissão"
    message="Você não tem permissão para acessar este recurso. Entre em contato com o administrador."
  />
);

export const NotFoundError: React.FC<{ onGoBack?: () => void }> = ({ onGoBack }) => (
  <ErrorState
    type="warning"
    title="Não encontrado"
    message="O recurso que você está procurando não foi encontrado."
    actionLabel="Voltar"
    onAction={onGoBack}
  />
);

// Inline error message
interface InlineErrorProps {
  message: string;
  className?: string;
}

export const InlineError: React.FC<InlineErrorProps> = ({ message, className = '' }) => (
  <div className={`flex items-center gap-2 text-sm text-error-600 dark:text-error-400 ${className}`}>
    <AlertCircle className="w-4 h-4 flex-shrink-0" />
    <span>{message}</span>
  </div>
);

// Form field error
export const FieldError: React.FC<{ message: string }> = ({ message }) => (
  <p className="mt-1 text-xs text-error-600 dark:text-error-400">
    {message}
  </p>
);
