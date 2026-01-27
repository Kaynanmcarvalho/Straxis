/**
 * Rate Limit Routes
 * 
 * Rotas para gerenciar configuração de rate limits
 */

import { Router } from 'express';
import { rateLimitController } from '../controllers/rateLimit.controller';
import { authMiddleware, requireAdmin } from '../middleware/auth.middleware';
import { tenantMiddleware } from '../middleware/tenant.middleware';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);
router.use(tenantMiddleware);

/**
 * GET /api/rate-limits/:companyId
 * Obtém configuração de rate limits de uma empresa
 */
router.get('/:companyId', rateLimitController.getRateLimits.bind(rateLimitController));

/**
 * PUT /api/rate-limits/:companyId
 * Atualiza configuração de rate limits (Admin apenas)
 */
router.put(
  '/:companyId',
  requireAdmin,
  rateLimitController.updateRateLimits.bind(rateLimitController)
);

export default router;
