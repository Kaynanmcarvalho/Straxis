import { Router } from 'express';
import { EmpresaController } from '../controllers/empresa.controller';
import { authMiddleware, requireAdminPlatform } from '../middleware/auth.middleware';

const router = Router();

// Todas as rotas de empresa requerem autenticação
router.use(authMiddleware);

/**
 * POST /api/empresas/create-platform
 * Cria empresa plataforma com primeiro admin (apenas admin_platform)
 */
router.post('/create-platform', requireAdminPlatform, EmpresaController.createPlatformCompany);

/**
 * POST /api/empresas/create-client
 * Cria empresa cliente com primeiro owner (apenas admin_platform)
 */
router.post('/create-client', requireAdminPlatform, EmpresaController.createClientCompany);

/**
 * GET /api/empresas/:id/funcoes
 * Busca funções da empresa (owner pode acessar sua própria empresa)
 */
router.get('/:id/funcoes', EmpresaController.getFuncoes);

/**
 * PUT /api/empresas/:id/funcoes
 * Atualiza funções da empresa (owner pode atualizar sua própria empresa)
 */
router.put('/:id/funcoes', EmpresaController.updateFuncoes);

// Rotas administrativas requerem permissão de Admin
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
