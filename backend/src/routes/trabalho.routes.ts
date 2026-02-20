import { Router } from 'express';
import { TrabalhoController } from '../controllers/trabalho.controller';
import { TrabalhoAgendaController } from '../controllers/trabalho-agenda.controller';
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
 * POST /api/trabalhos/from-agenda
 * Cria trabalho a partir de aprovação da agenda (idempotente)
 */
router.post('/from-agenda', TrabalhoAgendaController.createFromAgenda);

/**
 * DELETE /api/trabalhos/from-agenda/:agendaEventId
 * Cancela aprovação e reverte trabalho
 */
router.delete('/from-agenda/:agendaEventId', TrabalhoAgendaController.cancelFromAgenda);

/**
 * PUT /api/trabalhos/:id
 * Atualiza trabalho
 */
router.put('/:id', TrabalhoController.update);

/**
 * POST /api/trabalhos/:id/iniciar
 * Inicia trabalho
 */
router.post('/:id/iniciar', TrabalhoController.iniciar);

/**
 * POST /api/trabalhos/:id/pausar
 * Pausa trabalho
 */
router.post('/:id/pausar', TrabalhoController.pausar);

/**
 * POST /api/trabalhos/:id/retomar
 * Retoma trabalho pausado
 */
router.post('/:id/retomar', TrabalhoController.retomar);

/**
 * POST /api/trabalhos/:id/finalizar
 * Finaliza trabalho
 */
router.post('/:id/finalizar', TrabalhoController.finalizar);

/**
 * DELETE /api/trabalhos/:id
 * Deleta trabalho (soft delete)
 */
router.delete('/:id', TrabalhoController.delete);

export default router;
