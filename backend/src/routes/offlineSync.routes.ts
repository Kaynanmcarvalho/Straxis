/**
 * Offline Sync Routes
 * 
 * Rotas para sincronização offline
 */

import { Router } from 'express';
import { offlineSyncController } from '../controllers/offlineSync.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { tenantMiddleware } from '../middleware/tenant.middleware';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);
router.use(tenantMiddleware);

/**
 * POST /api/offline-sync/queue
 * Adiciona operação à fila de sincronização
 */
router.post('/queue', offlineSyncController.queueOperation.bind(offlineSyncController));

/**
 * POST /api/offline-sync/sync
 * Sincroniza todas as operações pendentes
 */
router.post('/sync', offlineSyncController.syncOperations.bind(offlineSyncController));

/**
 * GET /api/offline-sync/pending
 * Obtém operações pendentes do usuário
 */
router.get('/pending', offlineSyncController.getPendingOperations.bind(offlineSyncController));

export default router;
