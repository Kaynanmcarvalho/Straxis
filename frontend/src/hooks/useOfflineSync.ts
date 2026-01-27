/**
 * useOfflineSync Hook
 * 
 * Hook para gerenciar sincronização offline
 */

import { useState, useEffect, useCallback } from 'react';
import { offlineQueueService } from '../services/offlineQueue.service';
import { apiService } from '../services/api.service';

interface OfflineSyncState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncAt: Date | null;
  syncError: string | null;
}

export function useOfflineSync() {
  const [state, setState] = useState<OfflineSyncState>({
    isOnline: navigator.onLine,
    isSyncing: false,
    pendingCount: 0,
    lastSyncAt: null,
    syncError: null
  });

  /**
   * Atualiza contagem de operações pendentes
   */
  const updatePendingCount = useCallback(async () => {
    try {
      const count = await offlineQueueService.getPendingCount();
      setState(prev => ({ ...prev, pendingCount: count }));
    } catch (error) {
      console.error('Error updating pending count:', error);
    }
  }, []);

  /**
   * Sincroniza operações pendentes
   */
  const sync = useCallback(async () => {
    if (state.isSyncing || !state.isOnline) {
      return;
    }

    setState(prev => ({ ...prev, isSyncing: true, syncError: null }));

    try {
      const result = await offlineQueueService.syncWithServer(apiService);
      
      setState(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncAt: new Date(),
        syncError: result.failed > 0 
          ? `${result.failed} operações falharam` 
          : null
      }));

      await updatePendingCount();
    } catch (error) {
      console.error('Error syncing:', error);
      setState(prev => ({
        ...prev,
        isSyncing: false,
        syncError: 'Erro ao sincronizar operações'
      }));
    }
  }, [state.isSyncing, state.isOnline, updatePendingCount]);

  /**
   * Adiciona operação à fila
   */
  const queueOperation = useCallback(async (
    type: 'create' | 'update' | 'delete',
    collection: string,
    documentId: string,
    data?: any
  ) => {
    try {
      await offlineQueueService.queueOperation(type, collection, documentId, data);
      await updatePendingCount();

      // Se estiver online, tentar sincronizar imediatamente
      if (state.isOnline) {
        setTimeout(() => sync(), 1000);
      }
    } catch (error) {
      console.error('Error queueing operation:', error);
      throw error;
    }
  }, [state.isOnline, sync, updatePendingCount]);

  /**
   * Monitora mudanças de conectividade
   */
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }));
      // Sincronizar quando voltar online
      setTimeout(() => sync(), 2000);
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Atualizar contagem inicial
    updatePendingCount();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [sync, updatePendingCount]);

  /**
   * Sincronização periódica (a cada 5 minutos se online)
   */
  useEffect(() => {
    if (!state.isOnline) return;

    const interval = setInterval(() => {
      if (state.pendingCount > 0) {
        sync();
      }
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [state.isOnline, state.pendingCount, sync]);

  return {
    ...state,
    sync,
    queueOperation,
    updatePendingCount
  };
}
