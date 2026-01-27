/**
 * Health Routes
 * 
 * Rotas para verificar saúde dos serviços
 */

import { Router } from 'express';
import { healthController } from '../controllers/health.controller';
import { authMiddleware, requireAdmin } from '../middleware/auth.middleware';
import { tenantMiddleware } from '../middleware/tenant.middleware';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);
router.use(tenantMiddleware);

/**
 * GET /api/health
 * Verifica saúde de todos os serviços (Admin apenas)
 */
router.get('/', requireAdmin, healthController.checkHealth.bind(healthController));

/**
 * GET /api/health/company/:companyId
 * Verifica saúde dos serviços para uma empresa específica
 */
router.get('/company/:companyId', healthController.checkCompanyHealth.bind(healthController));

export default router;
