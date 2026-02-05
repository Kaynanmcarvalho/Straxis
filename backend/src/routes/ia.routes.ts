import { Router } from 'express';
import { iaController } from '../controllers/ia.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { tenantMiddleware } from '../middleware/tenant.middleware';
import { 
  iaMinuteRateLimit, 
  iaDailyRateLimit,
  combineRateLimits
} from '../middleware/rateLimit.middleware';

const router = Router();

// Todas as rotas de IA requerem autenticação
router.use(authMiddleware);
router.use(tenantMiddleware);

// POST /api/ia/query - Processar consulta com IA
// Rate limits: por minuto (empresa) e diário (usuário)
router.post(
  '/query', 
  combineRateLimits(iaMinuteRateLimit, iaDailyRateLimit),
  iaController.query.bind(iaController)
);

// GET /api/ia/config - Obter configuração de IA
router.get('/config', iaController.getConfig.bind(iaController));

// GET /api/ia/usage - Obter uso de IA da empresa
router.get('/usage', iaController.getUsage.bind(iaController));

// GET /api/ia/usage/company/:companyId - Obter uso de IA por empresa (Admin apenas)
router.get('/usage/company/:companyId', iaController.getUsageByCompany.bind(iaController));

// GET /api/ia/usage/user/:userId - Obter uso de IA por usuário
router.get('/usage/user/:userId', iaController.getUsageByUser.bind(iaController));

// PUT /api/ia/config - Atualizar configuração de IA
router.put('/config', iaController.updateConfig.bind(iaController));

// PUT /api/ia/prompt - Atualizar prompt personalizado
router.put('/prompt', iaController.updatePrompt.bind(iaController));

// POST /api/ia/local/models - Buscar modelos disponíveis de IA local
router.post('/local/models', iaController.getLocalModels.bind(iaController));

// POST /api/ia/local/health - Verificar saúde do servidor local
router.post('/local/health', iaController.checkLocalHealth.bind(iaController));

export default router;
