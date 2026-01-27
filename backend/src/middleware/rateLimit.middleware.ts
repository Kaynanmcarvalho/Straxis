/**
 * Rate Limit Middleware
 * 
 * Aplica rate limiting em endpoints de WhatsApp e IA
 */

import { Request, Response, NextFunction } from 'express';
import { rateLimitService } from '../services/rateLimit.service';
import { RateLimitType } from '../models/rateLimit.model';

interface AuthRequest extends Request {
  auth?: {
    userId: string;
    companyId: string;
    role: string;
  };
}

/**
 * Middleware genérico de rate limiting
 */
export function rateLimitMiddleware(type: RateLimitType) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { companyId, userId } = req.auth || {};

      if (!companyId) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Autenticação necessária'
        });
      }

      // Extrair phoneNumber se for WhatsApp
      const phoneNumber = type.includes('whatsapp') 
        ? req.body?.phoneNumber || req.query?.phoneNumber as string
        : undefined;

      // Verificar rate limit
      const result = await rateLimitService.checkRateLimit(
        companyId,
        type,
        userId,
        phoneNumber
      );

      if (!result.allowed) {
        // Registrar que o limite foi atingido
        await rateLimitService.logRateLimitExceeded(
          companyId,
          type,
          userId,
          phoneNumber
        );

        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: 'Limite de requisições atingido. Tente novamente mais tarde.',
          retryAfter: result.retryAfter,
          resetAt: result.resetAt
        });
      }

      // Incrementar contador
      await rateLimitService.incrementRateLimit(
        companyId,
        type,
        userId,
        phoneNumber
      );

      // Adicionar headers de rate limit
      if (result.remaining !== undefined) {
        res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
      }
      if (result.resetAt) {
        res.setHeader('X-RateLimit-Reset', result.resetAt.toISOString());
      }

      next();
    } catch (error) {
      console.error('Rate limit middleware error:', error);
      // Em caso de erro, permitir a requisição (fail open)
      next();
    }
  };
}

/**
 * Middleware específico para WhatsApp (diário)
 */
export const whatsappDailyRateLimit = rateLimitMiddleware('whatsapp_daily');

/**
 * Middleware específico para WhatsApp (por minuto)
 */
export const whatsappMinuteRateLimit = rateLimitMiddleware('whatsapp_minute');

/**
 * Middleware específico para WhatsApp (cooldown)
 */
export const whatsappCooldownRateLimit = rateLimitMiddleware('whatsapp_cooldown');

/**
 * Middleware específico para IA (por minuto)
 */
export const iaMinuteRateLimit = rateLimitMiddleware('ia_minute');

/**
 * Middleware específico para IA (diário por usuário)
 */
export const iaDailyRateLimit = rateLimitMiddleware('ia_daily');

/**
 * Combina múltiplos middlewares de rate limit
 */
export function combineRateLimits(...middlewares: any[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    let index = 0;

    const runNext = async () => {
      if (index >= middlewares.length) {
        return next();
      }

      const middleware = middlewares[index++];
      await middleware(req, res, runNext);
    };

    await runNext();
  };
}
