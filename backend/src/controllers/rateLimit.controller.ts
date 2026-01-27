/**
 * Rate Limit Controller
 * 
 * Gerencia configuração de rate limits por empresa
 */

import { Request, Response } from 'express';
import { firestore } from '../config/firebase.config';
import { RateLimits, DEFAULT_RATE_LIMITS } from '../models/rateLimit.model';
import { logService } from '../services/log.service';

interface AuthRequest extends Request {
  auth?: {
    userId: string;
    companyId: string;
    role: string;
  };
}

export class RateLimitController {
  /**
   * GET /api/rate-limits/:companyId
   * Obtém configuração de rate limits de uma empresa
   */
  async getRateLimits(req: AuthRequest, res: Response): Promise<void> {
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

      const companyDoc = await firestore.collection('companies').doc(companyId).get();

      if (!companyDoc.exists) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Empresa não encontrada'
        });
        return;
      }

      const companyData = companyDoc.data();
      const rateLimits = companyData?.config?.rateLimits || DEFAULT_RATE_LIMITS;

      res.json({
        companyId,
        rateLimits
      });
    } catch (error) {
      console.error('Error getting rate limits:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Erro ao obter configuração de rate limits'
      });
    }
  }

  /**
   * PUT /api/rate-limits/:companyId
   * Atualiza configuração de rate limits de uma empresa (Admin apenas)
   */
  async updateRateLimits(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;
      const { role, userId } = req.auth || {};
      const rateLimits: Partial<RateLimits> = req.body;

      // Apenas Admin_Plataforma pode alterar
      if (role !== 'admin_platform') {
        res.status(403).json({
          error: 'Forbidden',
          message: 'Apenas Admin da Plataforma pode alterar rate limits'
        });
        return;
      }

      // Validar valores
      const validatedLimits = this.validateRateLimits(rateLimits);
      if (!validatedLimits.valid) {
        res.status(400).json({
          error: 'Bad Request',
          message: validatedLimits.error
        });
        return;
      }

      const companyRef = firestore.collection('companies').doc(companyId);
      const companyDoc = await companyRef.get();

      if (!companyDoc.exists) {
        res.status(404).json({
          error: 'Not Found',
          message: 'Empresa não encontrada'
        });
        return;
      }

      // Atualizar rate limits
      await companyRef.update({
        'config.rateLimits': {
          ...DEFAULT_RATE_LIMITS,
          ...rateLimits
        },
        updatedAt: new Date()
      });

      // Registrar em logs
      await logService.create({
        companyId,
        userId,
        type: 'critical_change',
        action: 'rate_limits_updated',
        details: {
          newLimits: rateLimits,
          updatedBy: userId
        }
      });

      res.json({
        message: 'Rate limits atualizados com sucesso',
        rateLimits: {
          ...DEFAULT_RATE_LIMITS,
          ...rateLimits
        }
      });
    } catch (error) {
      console.error('Error updating rate limits:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Erro ao atualizar rate limits'
      });
    }
  }

  /**
   * Valida os valores de rate limits
   */
  private validateRateLimits(limits: Partial<RateLimits>): { valid: boolean; error?: string } {
    if (limits.whatsappMessagesPerDay !== undefined) {
      if (!Number.isInteger(limits.whatsappMessagesPerDay) || limits.whatsappMessagesPerDay < 1) {
        return { valid: false, error: 'whatsappMessagesPerDay deve ser um inteiro positivo' };
      }
    }

    if (limits.whatsappMessagesPerMinute !== undefined) {
      if (!Number.isInteger(limits.whatsappMessagesPerMinute) || limits.whatsappMessagesPerMinute < 1) {
        return { valid: false, error: 'whatsappMessagesPerMinute deve ser um inteiro positivo' };
      }
    }

    if (limits.whatsappCooldownSeconds !== undefined) {
      if (!Number.isInteger(limits.whatsappCooldownSeconds) || limits.whatsappCooldownSeconds < 0) {
        return { valid: false, error: 'whatsappCooldownSeconds deve ser um inteiro não-negativo' };
      }
    }

    if (limits.iaRequestsPerMinute !== undefined) {
      if (!Number.isInteger(limits.iaRequestsPerMinute) || limits.iaRequestsPerMinute < 1) {
        return { valid: false, error: 'iaRequestsPerMinute deve ser um inteiro positivo' };
      }
    }

    if (limits.iaRequestsPerDayPerUser !== undefined) {
      if (!Number.isInteger(limits.iaRequestsPerDayPerUser) || limits.iaRequestsPerDayPerUser < 1) {
        return { valid: false, error: 'iaRequestsPerDayPerUser deve ser um inteiro positivo' };
      }
    }

    return { valid: true };
  }
}

export const rateLimitController = new RateLimitController();
