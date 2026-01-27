/**
 * Rate Limit Cleanup Job
 * 
 * Job para limpar contadores de rate limit expirados
 * Deve ser executado periodicamente (ex: a cada hora)
 */

import { rateLimitService } from '../services/rateLimit.service';

export async function rateLimitCleanupJob(): Promise<void> {
  try {
    console.log('[RateLimitCleanup] Iniciando limpeza de contadores expirados...');
    
    const deletedCount = await rateLimitService.cleanupExpiredCounters();
    
    console.log(`[RateLimitCleanup] ${deletedCount} contadores expirados removidos`);
  } catch (error) {
    console.error('[RateLimitCleanup] Erro ao limpar contadores:', error);
  }
}

/**
 * Agenda o job para executar a cada hora
 */
export function scheduleRateLimitCleanup(): void {
  // Executar imediatamente
  rateLimitCleanupJob();
  
  // Executar a cada hora
  setInterval(rateLimitCleanupJob, 60 * 60 * 1000);
  
  console.log('[RateLimitCleanup] Job agendado para executar a cada hora');
}
