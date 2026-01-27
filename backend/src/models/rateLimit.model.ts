/**
 * Rate Limit Model
 * 
 * Estrutura para controlar limites de uso de WhatsApp e IA
 */

export type RateLimitType = 
  | 'whatsapp_daily' 
  | 'whatsapp_minute' 
  | 'whatsapp_cooldown'
  | 'ia_minute' 
  | 'ia_daily';

export interface RateLimitCounter {
  id: string;
  companyId: string;
  userId?: string;
  phoneNumber?: string;
  type: RateLimitType;
  count: number;
  windowStart: Date;
  lastRequest: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface RateLimits {
  whatsappMessagesPerDay: number;      // Padrão: 1000
  whatsappMessagesPerMinute: number;   // Padrão: 10
  whatsappCooldownSeconds: number;     // Padrão: 30
  iaRequestsPerMinute: number;         // Padrão: 60
  iaRequestsPerDayPerUser: number;     // Padrão: 500
}

export const DEFAULT_RATE_LIMITS: RateLimits = {
  whatsappMessagesPerDay: 1000,
  whatsappMessagesPerMinute: 10,
  whatsappCooldownSeconds: 30,
  iaRequestsPerMinute: 60,
  iaRequestsPerDayPerUser: 500,
};

export interface RateLimitResult {
  allowed: boolean;
  remaining?: number;
  resetAt?: Date;
  retryAfter?: number; // segundos
}
