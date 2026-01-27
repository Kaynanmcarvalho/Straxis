import { Router } from 'express';
import { WhatsAppController } from '../controllers/whatsapp.controller';
import { authMiddleware, requireOwner } from '../middleware/auth.middleware';
import { tenantMiddleware } from '../middleware/tenant.middleware';
import { 
  whatsappDailyRateLimit, 
  whatsappMinuteRateLimit,
  whatsappCooldownRateLimit,
  combineRateLimits
} from '../middleware/rateLimit.middleware';

const router = Router();

// Todas as rotas de WhatsApp requerem autenticação e permissão de Dono
router.use(authMiddleware);
router.use(tenantMiddleware);
router.use(requireOwner);

/**
 * POST /api/whatsapp/connect
 * Conecta ao WhatsApp
 */
router.post('/connect', WhatsAppController.connect);

/**
 * POST /api/whatsapp/disconnect
 * Desconecta do WhatsApp
 */
router.post('/disconnect', WhatsAppController.disconnect);

/**
 * GET /api/whatsapp/status
 * Obtém status da conexão
 */
router.get('/status', WhatsAppController.getStatus);

/**
 * POST /api/whatsapp/send
 * Envia mensagem
 * Rate limits: diário, por minuto e cooldown
 */
router.post(
  '/send', 
  combineRateLimits(
    whatsappDailyRateLimit,
    whatsappMinuteRateLimit,
    whatsappCooldownRateLimit
  ),
  WhatsAppController.sendMessage
);

/**
 * GET /api/whatsapp/messages
 * Lista mensagens
 */
router.get('/messages', WhatsAppController.getMessages);

export default router;
