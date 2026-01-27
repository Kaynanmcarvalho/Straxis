/**
 * Health Controller
 * 
 * Endpoints para verificar saúde dos serviços
 */

import { Request, Response } from 'express';
import { healthService } from '../services/health.service';

interface AuthRequest extends Request {
  auth?: {
    userId: string;
    companyId: string;
    role: string;
  };
}

export class HealthController {
  /**
   * GET /api/health
   * Verifica saúde de todos os serviços (Admin apenas)
   */
  async checkHealth(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { role } = req.auth || {};

      // Apenas Admin_Plataforma pode acessar
      if (role !== 'admin_platform') {
        res.status(403).json({
          error: 'Forbidden',
          message: 'Apenas Admin da Plataforma pode acessar health check'
        });
        return;
      }

      const health = await healthService.checkAllServices();

      res.json(health);
    } catch (error) {
      console.error('Error checking health:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Erro ao verificar saúde dos serviços'
      });
    }
  }

  /**
   * GET /api/health/company/:companyId
   * Verifica saúde dos serviços para uma empresa específica
   */
  async checkCompanyHealth(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;
      const { role, companyId: userCompanyId } = req.auth || {};

      // Apenas Admin_Plataforma ou Dono da própria empresa
      if (role !== 'admin_platform' && companyId !== userCompanyId) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'Sem permissão para acessar esta empresa'
        });
        return;
      }

      // Verificar taxa de erro de IA e WhatsApp
      const iaErrorRate = await healthService.getErrorRate('ia', companyId, 1);
      const whatsappErrorRate = await healthService.getErrorRate('whatsapp', companyId, 1);

      res.json({
        companyId,
        services: {
          ia: {
            errorRate: iaErrorRate,
            status: iaErrorRate < 5 ? 'healthy' : iaErrorRate < 20 ? 'degraded' : 'down'
          },
          whatsapp: {
            errorRate: whatsappErrorRate,
            status: whatsappErrorRate < 5 ? 'healthy' : whatsappErrorRate < 20 ? 'degraded' : 'down'
          }
        },
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error checking company health:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Erro ao verificar saúde dos serviços da empresa'
      });
    }
  }
}

export const healthController = new HealthController();
