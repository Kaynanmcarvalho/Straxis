/**
 * Offline Sync Controller
 * 
 * Gerencia sincronização de operações offline
 */

import { Request, Response } from 'express';
import { offlineSyncService } from '../services/offlineSync.service';
import { PendingOperation } from '../models/documentVersion.model';

interface AuthRequest extends Request {
  auth?: {
    userId: string;
    companyId: string;
    role: string;
  };
}

export class OfflineSyncController {
  /**
   * POST /api/offline-sync/queue
   * Adiciona operação à fila de sincronização
   */
  async queueOperation(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { companyId, userId } = req.auth || {};
      const { type, collection, documentId, data } = req.body;

      if (!companyId || !userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Autenticação necessária'
        });
        return;
      }

      // Validar campos obrigatórios
      if (!type || !collection || !documentId) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Campos obrigatórios: type, collection, documentId'
        });
        return;
      }

      const operationId = await offlineSyncService.queueOperation({
        type,
        collection,
        documentId,
        data,
        timestamp: new Date(),
        userId,
        companyId
      });

      res.json({
        message: 'Operação adicionada à fila',
        operationId
      });
    } catch (error) {
      console.error('Error queueing operation:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Erro ao adicionar operação à fila'
      });
    }
  }

  /**
   * POST /api/offline-sync/sync
   * Sincroniza todas as operações pendentes
   */
  async syncOperations(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { companyId, userId } = req.auth || {};

      if (!companyId || !userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Autenticação necessária'
        });
        return;
      }

      const stats = await offlineSyncService.syncPendingOperations(companyId, userId);

      res.json({
        message: 'Sincronização concluída',
        stats
      });
    } catch (error) {
      console.error('Error syncing operations:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Erro ao sincronizar operações'
      });
    }
  }

  /**
   * GET /api/offline-sync/pending
   * Obtém operações pendentes do usuário
   */
  async getPendingOperations(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { companyId, userId } = req.auth || {};

      if (!companyId || !userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Autenticação necessária'
        });
        return;
      }

      const operations = await offlineSyncService.getPendingOperations(companyId, userId);

      res.json({
        operations,
        count: operations.length
      });
    } catch (error) {
      console.error('Error getting pending operations:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Erro ao obter operações pendentes'
      });
    }
  }
}

export const offlineSyncController = new OfflineSyncController();
