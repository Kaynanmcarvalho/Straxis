import { Router } from 'express';
import { AgendamentoController } from '../controllers/agendamento.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { tenantMiddleware } from '../middleware/tenant.middleware';

const router = Router();

// Todas as rotas de agendamento requerem autenticação
router.use(authMiddleware);
router.use(tenantMiddleware);

/**
 * GET /api/agendamentos
 * Lista agendamentos da empresa
 */
router.get('/', AgendamentoController.list);

/**
 * GET /api/agendamentos/disponibilidade
 * Verifica disponibilidade
 */
router.get('/disponibilidade', AgendamentoController.verificarDisponibilidade);

/**
 * GET /api/agendamentos/:id
 * Busca agendamento por ID
 */
router.get('/:id', AgendamentoController.getById);

/**
 * POST /api/agendamentos
 * Cria novo agendamento
 */
router.post('/', AgendamentoController.create);

/**
 * POST /api/agendamentos/:id/aprovar
 * Aprova agendamento
 */
router.post('/:id/aprovar', AgendamentoController.aprovar);

/**
 * POST /api/agendamentos/:id/rejeitar
 * Rejeita agendamento
 */
router.post('/:id/rejeitar', AgendamentoController.rejeitar);

/**
 * POST /api/agendamentos/:id/converter
 * Converte agendamento em trabalho
 */
router.post('/:id/converter', AgendamentoController.converter);

/**
 * PUT /api/agendamentos/:id
 * Atualiza agendamento
 */
router.put('/:id', AgendamentoController.update);

/**
 * DELETE /api/agendamentos/:id
 * Deleta agendamento (soft delete)
 */
router.delete('/:id', AgendamentoController.delete);

/**
 * PATCH /api/agendamentos/:id/status
 * Atualiza status do agendamento
 */
router.patch('/:id/status', AgendamentoController.updateStatus);

export default router;
