import { Router } from 'express';
import { RelatorioController } from '../controllers/relatorio.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { tenantMiddleware } from '../middleware/tenant.middleware';

const router = Router();

// Todas as rotas de relatório requerem autenticação
router.use(authMiddleware);
router.use(tenantMiddleware);

/**
 * GET /api/relatorios/diario
 * Relatório diário
 */
router.get('/diario', RelatorioController.diario);

/**
 * GET /api/relatorios/semanal
 * Relatório semanal
 */
router.get('/semanal', RelatorioController.semanal);

/**
 * GET /api/relatorios/mensal
 * Relatório mensal
 */
router.get('/mensal', RelatorioController.mensal);

/**
 * GET /api/relatorios/funcionario/:id
 * Relatório por funcionário
 */
router.get('/funcionario/:id', RelatorioController.porFuncionario);

export default router;
