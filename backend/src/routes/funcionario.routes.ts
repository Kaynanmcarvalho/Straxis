import { Router } from 'express';
import { FuncionarioController } from '../controllers/funcionario.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { tenantMiddleware } from '../middleware/tenant.middleware';

const router = Router();
const funcionarioController = new FuncionarioController();

// Aplicar middlewares de autenticação e tenant
router.use(authMiddleware);
router.use(tenantMiddleware);

// Rotas de funcionários
router.get('/', funcionarioController.list.bind(funcionarioController));
router.get('/:id', funcionarioController.get.bind(funcionarioController));
router.post('/', funcionarioController.create.bind(funcionarioController));
router.put('/:id', funcionarioController.update.bind(funcionarioController));
router.delete('/:id', funcionarioController.delete.bind(funcionarioController));
router.get('/:id/stats', funcionarioController.getStats.bind(funcionarioController));

export default router;
