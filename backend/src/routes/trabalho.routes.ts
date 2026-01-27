import { Router } from 'express';
import { TrabalhoController } from '../controllers/trabalho.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { tenantMiddleware } from '../middleware/tenant.middleware';

const router = Router();

// Todas as rotas de trabalho requerem autenticação
router.use(authMiddleware);
router.use(tenantMiddleware);

/**
 * GET /api/trabalhos
 * Lista trabalhos da empresa
 */
router.get('/', TrabalhoController.list);

/**
 * GET /api/trabalhos/:id
 * Busca trabalho por ID
 */
router.get('/:id', TrabalhoController.getById);

/**
 * POST /api/trabalhos
 * Cria novo trabalho
 */
router.post('/', TrabalhoController.create);

/**
 * PUT /api/trabalhos/:id
 * Atualiza trabalho
 */
router.put('/:id', TrabalhoController.update);

/**
 * DELETE /api/trabalhos/:id
 * Deleta trabalho (soft delete)
 */
router.delete('/:id', TrabalhoController.delete);

export default router;
