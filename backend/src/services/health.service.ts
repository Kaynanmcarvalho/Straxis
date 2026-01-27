/**
 * Health Service
 * 
 * Monitora a saúde dos serviços externos (IA, WhatsApp, Firebase)
 */

import { firestore } from '../config/firebase.config';
import { retryWithBackoff } from '../utils/retry.util';

export interface ServiceHealth {
  service: 'firebase' | 'openai' | 'gemini' | 'whatsapp';
  status: 'healthy' | 'degraded' | 'down';
  responseTime?: number;
  lastCheck: Date;
  errorRate?: number;
  message?: string;
}

export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'down';
  services: ServiceHealth[];
  timestamp: Date;
}

class HealthService {
  /**
   * Verifica a saúde de todos os serviços
   */
  async checkAllServices(): Promise<SystemHealth> {
    const services: ServiceHealth[] = [];

    // Verificar Firebase
    services.push(await this.checkFirebase());

    // Verificar OpenAI (se configurado)
    if (process.env.OPENAI_API_KEY) {
      services.push(await this.checkOpenAI());
    }

    // Verificar Gemini (se configurado)
    if (process.env.GEMINI_API_KEY) {
      services.push(await this.checkGemini());
    }

    // Verificar WhatsApp
    services.push(await this.checkWhatsApp());

    // Determinar status geral
    const overall = this.determineOverallStatus(services);

    return {
      overall,
      services,
      timestamp: new Date()
    };
  }

  /**
   * Verifica saúde do Firebase
   */
  private async checkFirebase(): Promise<ServiceHealth> {
    const startTime = Date.now();
    
    try {
      // Tentar uma operação simples no Firestore
      await firestore.collection('_health_check').limit(1).get();
      
      const responseTime = Date.now() - startTime;

      return {
        service: 'firebase',
        status: responseTime < 1000 ? 'healthy' : 'degraded',
        responseTime,
        lastCheck: new Date()
      };
    } catch (error) {
      return {
        service: 'firebase',
        status: 'down',
        responseTime: Date.now() - startTime,
        lastCheck: new Date(),
        message: (error as Error).message
      };
    }
  }

  /**
   * Verifica saúde do OpenAI
   */
  private async checkOpenAI(): Promise<ServiceHealth> {
    const startTime = Date.now();
    
    try {
      // Importar dinamicamente
      const { openaiService } = await import('./openai.service');
      
      // Inicializar com API key
      openaiService.initialize(process.env.OPENAI_API_KEY!, 'gpt-3.5-turbo');
      
      // Fazer uma query simples
      await retryWithBackoff(
        async () => await openaiService.query('test', 'health check'),
        { maxAttempts: 2 }
      );
      
      const responseTime = Date.now() - startTime;

      return {
        service: 'openai',
        status: responseTime < 5000 ? 'healthy' : 'degraded',
        responseTime,
        lastCheck: new Date()
      };
    } catch (error) {
      return {
        service: 'openai',
        status: 'down',
        responseTime: Date.now() - startTime,
        lastCheck: new Date(),
        message: (error as Error).message
      };
    }
  }

  /**
   * Verifica saúde do Gemini
   */
  private async checkGemini(): Promise<ServiceHealth> {
    const startTime = Date.now();
    
    try {
      // Importar dinamicamente
      const { geminiService } = await import('./gemini.service');
      
      // Inicializar com API key
      geminiService.initialize(process.env.GEMINI_API_KEY!, 'gemini-pro');
      
      // Fazer uma query simples
      await retryWithBackoff(
        async () => await geminiService.query('test', 'health check'),
        { maxAttempts: 2 }
      );
      
      const responseTime = Date.now() - startTime;

      return {
        service: 'gemini',
        status: responseTime < 5000 ? 'healthy' : 'degraded',
        responseTime,
        lastCheck: new Date()
      };
    } catch (error) {
      return {
        service: 'gemini',
        status: 'down',
        responseTime: Date.now() - startTime,
        lastCheck: new Date(),
        message: (error as Error).message
      };
    }
  }

  /**
   * Verifica saúde do WhatsApp
   */
  private async checkWhatsApp(): Promise<ServiceHealth> {
    try {
      // Verificar se há sessões ativas
      const snapshot = await firestore
        .collectionGroup('whatsappSessions')
        .where('connected', '==', true)
        .limit(1)
        .get();

      const hasActiveSessions = !snapshot.empty;

      return {
        service: 'whatsapp',
        status: hasActiveSessions ? 'healthy' : 'degraded',
        lastCheck: new Date(),
        message: hasActiveSessions 
          ? 'Sessões ativas encontradas' 
          : 'Nenhuma sessão ativa'
      };
    } catch (error) {
      return {
        service: 'whatsapp',
        status: 'down',
        lastCheck: new Date(),
        message: (error as Error).message
      };
    }
  }

  /**
   * Determina o status geral baseado nos serviços individuais
   */
  private determineOverallStatus(services: ServiceHealth[]): 'healthy' | 'degraded' | 'down' {
    const downCount = services.filter(s => s.status === 'down').length;
    const degradedCount = services.filter(s => s.status === 'degraded').length;

    if (downCount > 0) {
      return 'down';
    }

    if (degradedCount > 0) {
      return 'degraded';
    }

    return 'healthy';
  }

  /**
   * Calcula taxa de erro de um serviço em um período
   */
  async getErrorRate(
    service: 'ia' | 'whatsapp',
    companyId: string,
    hours: number = 1
  ): Promise<number> {
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    // Buscar logs de erro
    const errorLogs = await firestore
      .collection('logs')
      .where('companyId', '==', companyId)
      .where('type', '==', service === 'ia' ? 'ia_usage' : 'whatsapp')
      .where('action', '==', 'failure')
      .where('timestamp', '>=', startTime)
      .get();

    // Buscar logs totais
    const totalLogs = await firestore
      .collection('logs')
      .where('companyId', '==', companyId)
      .where('type', '==', service === 'ia' ? 'ia_usage' : 'whatsapp')
      .where('timestamp', '>=', startTime)
      .get();

    if (totalLogs.size === 0) {
      return 0;
    }

    return (errorLogs.size / totalLogs.size) * 100;
  }
}

export const healthService = new HealthService();
