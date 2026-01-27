import { useCallback } from 'react';
import {
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showPromise,
  showLoading,
  dismissToast,
  dismissAllToasts,
} from '../components/ui/Toast';
import { ToastOptions } from 'react-hot-toast';

interface ToastMessage {
  title?: string;
  message: string;
}

export const useToast = () => {
  const success = useCallback((content: string | ToastMessage, options?: ToastOptions) => {
    return showSuccess(content, options);
  }, []);

  const error = useCallback((content: string | ToastMessage, options?: ToastOptions) => {
    return showError(content, options);
  }, []);

  const warning = useCallback((content: string | ToastMessage, options?: ToastOptions) => {
    return showWarning(content, options);
  }, []);

  const info = useCallback((content: string | ToastMessage, options?: ToastOptions) => {
    return showInfo(content, options);
  }, []);

  const promise = useCallback(
    <T,>(
      promiseFunc: Promise<T>,
      messages: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: any) => string);
      },
      options?: ToastOptions
    ) => {
      return showPromise(promiseFunc, messages, options);
    },
    []
  );

  const loading = useCallback((message: string, options?: ToastOptions) => {
    return showLoading(message, options);
  }, []);

  const dismiss = useCallback((toastId?: string) => {
    dismissToast(toastId);
  }, []);

  const dismissAll = useCallback(() => {
    dismissAllToasts();
  }, []);

  return {
    success,
    error,
    warning,
    info,
    promise,
    loading,
    dismiss,
    dismissAll,
  };
};

// Preset toast messages for common actions
export const useActionToasts = () => {
  const toast = useToast();

  return {
    // CRUD operations
    created: (entity: string) =>
      toast.success({ title: 'Sucesso!', message: `${entity} criado com sucesso` }),
    
    updated: (entity: string) =>
      toast.success({ title: 'Sucesso!', message: `${entity} atualizado com sucesso` }),
    
    deleted: (entity: string) =>
      toast.success({ title: 'Sucesso!', message: `${entity} excluído com sucesso` }),
    
    restored: (entity: string) =>
      toast.success({ title: 'Sucesso!', message: `${entity} restaurado com sucesso` }),
    
    // Errors
    createError: (entity: string) =>
      toast.error({ title: 'Erro', message: `Erro ao criar ${entity}` }),
    
    updateError: (entity: string) =>
      toast.error({ title: 'Erro', message: `Erro ao atualizar ${entity}` }),
    
    deleteError: (entity: string) =>
      toast.error({ title: 'Erro', message: `Erro ao excluir ${entity}` }),
    
    loadError: (entity: string) =>
      toast.error({ title: 'Erro', message: `Erro ao carregar ${entity}` }),
    
    // Network
    networkError: () =>
      toast.error({
        title: 'Sem conexão',
        message: 'Verifique sua conexão com a internet',
      }),
    
    // Permissions
    permissionError: () =>
      toast.error({
        title: 'Sem permissão',
        message: 'Você não tem permissão para realizar esta ação',
      }),
    
    // Validation
    validationError: (message?: string) =>
      toast.warning({
        title: 'Atenção',
        message: message || 'Por favor, preencha todos os campos obrigatórios',
      }),
    
    // Success operations
    saved: () =>
      toast.success({ title: 'Sucesso!', message: 'Alterações salvas com sucesso' }),
    
    exported: (format: string) =>
      toast.success({ title: 'Sucesso!', message: `Relatório exportado em ${format}` }),
    
    sent: () =>
      toast.success({ title: 'Sucesso!', message: 'Mensagem enviada com sucesso' }),
    
    // Info
    processing: () =>
      toast.info({ title: 'Processando', message: 'Sua solicitação está sendo processada' }),
    
    // Warnings
    planExpired: () =>
      toast.warning({
        title: 'Plano Expirado',
        message: 'O plano da sua empresa expirou. Entre em contato com o administrador.',
      }),
    
    limitReached: (limit: string) =>
      toast.warning({
        title: 'Limite Atingido',
        message: `Você atingiu o limite de ${limit}`,
      }),
  };
};
