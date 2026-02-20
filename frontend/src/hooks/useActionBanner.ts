/**
 * Hook customizado para gerenciar ActionBanner
 */

import { useState } from 'react';

interface BannerConfig {
  tipo: 'success' | 'error' | 'confirm';
  titulo: string;
  mensagem?: string;
  acoes?: Array<{
    label: string;
    onClick: () => void;
    primary?: boolean;
    destructive?: boolean;
  }>;
}

interface UseActionBannerResult {
  bannerConfig: BannerConfig | null;
  showSuccess: (titulo: string, mensagem?: string) => void;
  showError: (titulo: string, mensagem?: string) => void;
  showConfirm: (
    titulo: string,
    mensagem: string,
    onConfirm: () => void,
    onCancel?: () => void,
    confirmLabel?: string,
    destructive?: boolean
  ) => void;
  dismiss: () => void;
}

export function useActionBanner(): UseActionBannerResult {
  const [bannerConfig, setBannerConfig] = useState<BannerConfig | null>(null);

  const showSuccess = (titulo: string, mensagem?: string) => {
    setBannerConfig({
      tipo: 'success',
      titulo,
      mensagem
    });
  };

  const showError = (titulo: string, mensagem?: string) => {
    setBannerConfig({
      tipo: 'error',
      titulo,
      mensagem
    });
  };

  const showConfirm = (
    titulo: string,
    mensagem: string,
    onConfirm: () => void,
    onCancel?: () => void,
    confirmLabel: string = 'Confirmar',
    destructive: boolean = false
  ) => {
    setBannerConfig({
      tipo: 'confirm',
      titulo,
      mensagem,
      acoes: [
        {
          label: 'Cancelar',
          onClick: () => {
            if (onCancel) onCancel();
            setBannerConfig(null);
          }
        },
        {
          label: confirmLabel,
          onClick: () => {
            onConfirm();
            setBannerConfig(null);
          },
          primary: true,
          destructive
        }
      ]
    });
  };

  const dismiss = () => {
    setBannerConfig(null);
  };

  return {
    bannerConfig,
    showSuccess,
    showError,
    showConfirm,
    dismiss
  };
}
