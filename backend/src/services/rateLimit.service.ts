/**
 * Rate Limit Service
 * 
 * Gerencia contadores de rate limiting para WhatsApp e IA
 */

import { firestore } from '../config/firebase.config';
import { 
  RateLimitCounter, 
  RateLimitType, 
  RateLimitResult,
  RateLimits,
  DEFAULT_RATE_LIMITS
} from '../models/rateLimit.model';
import { logService } from './log.service';

class RateLimitService {
  private readonly COLLECTION = 'rateLimitCounters';

  /**
   * Verifica se uma requisição está dentro do rate limit
   */
  async checkRateLimit(
    companyId: string,
    type: RateLimitType,
    userId?: string,
    phoneNumber?: string
  ): Promise<RateLimitResult> {
    const limits = await this.getCompanyLimits(companyId);
    const counterId = this.generateCounterId(companyId, type, userId, phoneNumber);
    
    const counterRef = firestore.collection(this.COLLECTION).doc(counterId);
    const counterDoc = await counterRef.get();

    const now = new Date();
    
    if (!counterDoc.exists) {
      // Primeiro acesso - permitir
      return { allowed: true };
    }

    const counter = counterDoc.data() as RateLimitCounter;
    const windowDuration = this.getWindowDuration(type);
    const limit = this.getLimit(type, limits);

    // Verificar se a janela expirou
    const windowEnd = new Date(counter.windowStart.getTime() + windowDuration);
    if (now > windowEnd) {
      // Janela expirou - resetar contador
      return { allowed: true };
    }

    // Verificar cooldown (apenas para WhatsApp)
    if (type === 'whatsapp_cooldown') {
      const timeSinceLastRequest = now.getTime() - counter.lastRequest.getTime();
      const cooldownMs = limits.whatsappCooldownSeconds * 1000;
      
      if (timeSinceLastRequest < cooldownMs) {
        const retryAfter = Math.ceil((cooldownMs - timeSinceLastRequest) / 1000);
        return {
          allowed: false,
          retryAfter,
          resetAt: new Date(counter.lastRequest.getTime() + cooldownMs)
        };
      }
      return { allowed: true };
    }

    // Verificar se atingiu o limite
    if (counter.count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: windowEnd,
        retryAfter: Math.ceil((windowEnd.getTime() - now.getTime()) / 1000)
      };
    }

    return {
      allowed: true,
      remaining: limit - counter.count,
      resetAt: windowEnd
    };
  }

  /**
   * Incrementa o contador de rate limit
   */
  async incrementRateLimit(
    companyId: string,
    type: RateLimitType,
    userId?: string,
    phoneNumber?: string
  ): Promise<void> {
    const counterId = this.generateCounterId(companyId, type, userId, phoneNumber);
    const counterRef = firestore.collection(this.COLLECTION).doc(counterId);
    const counterDoc = await counterRef.get();

    const now = new Date();

    if (!counterDoc.exists) {
      // Criar novo contador
      const newCounter: Omit<RateLimitCounter, 'id'> = {
        companyId,
        userId,
        phoneNumber,
        type,
        count: 1,
        windowStart: now,
        lastRequest: now,
        createdAt: now,
        updatedAt: now
      };
      await counterRef.set(newCounter);
      return;
    }

    const counter = counterDoc.data() as RateLimitCounter;
    const windowDuration = this.getWindowDuration(type);
    const windowEnd = new Date(counter.windowStart.getTime() + windowDuration);

    if (now > windowEnd) {
      // Janela expirou - resetar contador
      await counterRef.update({
        count: 1,
        windowStart: now,
        lastRequest: now,
        updatedAt: now
      });
    } else {
      // Incrementar contador
      await counterRef.update({
        count: counter.count + 1,
        lastRequest: now,
        updatedAt: now
      });
    }
  }

  /**
   * Obtém os limites configurados para uma empresa
   */
  private async getCompanyLimits(companyId: string): Promise<RateLimits> {
    const companyDoc = await firestore.collection('companies').doc(companyId).get();
    
    if (!companyDoc.exists) {
      return DEFAULT_RATE_LIMITS;
    }

    const companyData = companyDoc.data();
    return companyData?.config?.rateLimits || DEFAULT_RATE_LIMITS;
  }

  /**
   * Obtém o limite para um tipo específico
   */
  private getLimit(type: RateLimitType, limits: RateLimits): number {
    switch (type) {
      case 'whatsapp_daily':
        return limits.whatsappMessagesPerDay;
      case 'whatsapp_minute':
        return limits.whatsappMessagesPerMinute;
      case 'ia_minute':
        return limits.iaRequestsPerMinute;
      case 'ia_daily':
        return limits.iaRequestsPerDayPerUser;
      case 'whatsapp_cooldown':
        return 1; // Cooldown é binário
      default:
        return 0;
    }
  }

  /**
   * Obtém a duração da janela em milissegundos
   */
  private getWindowDuration(type: RateLimitType): number {
    switch (type) {
      case 'whatsapp_daily':
      case 'ia_daily':
        return 24 * 60 * 60 * 1000; // 24 horas
      case 'whatsapp_minute':
      case 'ia_minute':
        return 60 * 1000; // 1 minuto
      case 'whatsapp_cooldown':
        return 30 * 1000; // 30 segundos (padrão)
      default:
        return 0;
    }
  }

  /**
   * Gera ID único para o contador
   */
  private generateCounterId(
    companyId: string,
    type: RateLimitType,
    userId?: string,
    phoneNumber?: string
  ): string {
    const parts = [companyId, type];
    
    if (userId) {
      parts.push(userId);
    }
    
    if (phoneNumber) {
      parts.push(phoneNumber);
    }

    // Adicionar timestamp para janelas diárias/minutas
    const now = new Date();
    if (type.includes('daily')) {
      const day = now.toISOString().split('T')[0]; // YYYY-MM-DD
      parts.push(day);
    } else if (type.includes('minute')) {
      const minute = now.toISOString().substring(0, 16); // YYYY-MM-DDTHH:mm
      parts.push(minute);
    }

    return parts.join('_');
  }

  /**
   * Limpa contadores expirados (executar periodicamente)
   */
  async cleanupExpiredCounters(): Promise<number> {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const snapshot = await firestore
      .collection(this.COLLECTION)
      .where('updatedAt', '<', oneDayAgo)
      .get();

    const batch = firestore.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    return snapshot.size;
  }

  /**
   * Registra quando um rate limit é atingido
   */
  async logRateLimitExceeded(
    companyId: string,
    type: RateLimitType,
    userId?: string,
    phoneNumber?: string
  ): Promise<void> {
    await logService.create({
      companyId,
      userId: userId || null,
      type: 'critical_change',
      action: 'rate_limit_exceeded',
      details: {
        rateLimitType: type,
        phoneNumber: phoneNumber || null,
        timestamp: new Date()
      }
    });
  }
}

export const rateLimitService = new RateLimitService();
