import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware, requireOwner, requireAdminPlatform } from '../middleware/auth.middleware';
import { tenantMiddleware } from '../middleware/tenant.middleware';

const router = Router();

// Todas as rotas de usuário requerem autenticação
router.use(authMiddleware);
router.use(tenantMiddleware);

/**
 * Middleware para verificar se é Admin ou Dono
 */
const requireAdminOrOwner = (req: any, res: any, next: any) => {
  if (req.auth?.role === 'admin_platform' || req.auth?.role === 'owner') {
    next();
  } else {
    res.status(403).json({
      error: 'Acesso negado. Apenas Admin ou Dono da Empresa podem acessar.',
      code: 1003,
    });
  }
};

/**
 * GET /api/usuarios
 * Lista usuários da empresa
 */
router.get('/', requireAdminOrOwner, UserController.list);

/**
 * GET /api/usuarios/:id
 * Busca usuário por ID
 */
router.get('/:id', requireAdminOrOwner, UserController.getById);

/**
 * POST /api/usuarios
 * Cria novo usuário
 */
router.post('/', requireAdminOrOwner, UserController.create);

/**
 * PUT /api/usuarios/:id
 * Atualiza usuário
 */
router.put('/:id', requireAdminOrOwner, UserController.update);

/**
 * DELETE /api/usuarios/:id
 * Deleta usuário (soft delete)
 */
router.delete('/:id', requireAdminOrOwner, UserController.delete);

/**
 * PATCH /api/usuarios/:id/activate
 * Ativa usuário
 */
router.patch('/:id/activate', requireAdminOrOwner, UserController.activate);

/**
 * PATCH /api/usuarios/:id/deactivate
 * Desativa usuário
 */
router.patch('/:id/deactivate', requireAdminOrOwner, UserController.deactivate);

/**
 * PATCH /api/usuarios/:id/permissions
 * Atualiza permissões do usuário
 */
router.patch('/:id/permissions', requireAdminOrOwner, UserController.updatePermissions);

export default router;
