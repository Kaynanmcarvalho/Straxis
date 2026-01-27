import { Router } from 'express';
import { LogController } from '../controllers/log.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { tenantMiddleware } from '../middleware/tenant.middleware';

const router = Router();

// Todas as rotas de log requerem autenticação
router.use(authMiddleware);
router.use(tenantMiddleware);

/**
 * GET /api/logs
 * Lista logs com filtros
 */
router.get('/', LogController.list);

/**
 * GET /api/logs/company/:companyId
 * Lista logs de uma empresa
 */
router.get('/company/:companyId', LogController.getByCompany);

/**
 * GET /api/logs/user/:userId
 * Lista logs de um usuário
 */
router.get('/user/:userId', LogController.getByUser);

/**
 * GET /api/logs/type/:type
 * Lista logs por tipo
 */
router.get('/type/:type', LogController.getByType);

export default router;
