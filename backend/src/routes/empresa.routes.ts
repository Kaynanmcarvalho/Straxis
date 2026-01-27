import { Router } from 'express';
import { EmpresaController } from '../controllers/empresa.controller';
import { authMiddleware, requireAdminPlatform } from '../middleware/auth.middleware';

const router = Router();

// Todas as rotas de empresa requerem autenticação e permissão de Admin
router.use(authMiddleware);
router.use(requireAdminPlatform);

/**
 * GET /api/empresas
 * Lista todas as empresas
 */
router.get('/', EmpresaController.list);

/**
 * GET /api/empresas/:id
 * Busca empresa por ID
 */
router.get('/:id', EmpresaController.getById);

/**
 * POST /api/empresas
 * Cria nova empresa
 */
router.post('/', EmpresaController.create);

/**
 * PUT /api/empresas/:id
 * Atualiza empresa
 */
router.put('/:id', EmpresaController.update);

/**
 * DELETE /api/empresas/:id
 * Deleta empresa (soft delete)
 */
router.delete('/:id', EmpresaController.delete);

/**
 * PATCH /api/empresas/:id/activate
 * Ativa empresa
 */
router.patch('/:id/activate', EmpresaController.activate);

/**
 * PATCH /api/empresas/:id/deactivate
 * Desativa empresa
 */
router.patch('/:id/deactivate', EmpresaController.deactivate);

export default router;
