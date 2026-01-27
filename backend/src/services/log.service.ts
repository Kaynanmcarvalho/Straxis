import { FirestoreService } from './firestore.service';
import { LogModel } from '../models/log.model';
import { Log } from '../types';

export class LogService {
  /**
   * Cria um novo log
   */
  static async createLog(logData: Partial<Log>): Promise<string> {
    try {
      const log = LogModel.create(logData);
      const logId = await FirestoreService.create('logs', LogModel.toFirestore(log));
      return logId;
    } catch (error) {
      console.error('Erro ao criar log:', error);
      throw error;
    }
  }

  /**
   * Registra log de acesso
   */
  static async logAccess(
    userId: string,
    companyId: string | null,
    action: string,
    details: Record<string, any> = {}
  ): Promise<void> {
    await this.createLog({
      companyId,
      userId,
      type: 'access',
      action,
      details,
    });
  }

  /**
   * Registra log de uso de IA
   */
  static async logIAUsage(
    userId: string,
    companyId: string,
    action: string,
    details: {
      provider: string;
      model: string;
      tokensUsed: number;
      estimatedCost: number;
      [key: string]: any;
    }
  ): Promise<void> {
    await this.createLog({
      companyId,
      userId,
      type: 'ia_usage',
      action,
      details,
    });
  }

  /**
   * Registra log de interação WhatsApp
   */
  static async logWhatsApp(
    companyId: string,
    action: string,
    details: {
      from?: string;
      to?: string;
      message?: string;
      processedByIA?: boolean;
      [key: string]: any;
    }
  ): Promise<void> {
    await this.createLog({
      companyId,
      userId: null,
      type: 'whatsapp',
      action,
      details,
    });
  }

  /**
   * Registra log de alteração crítica
   */
  static async logCriticalChange(
    userId: string,
    companyId: string | null,
    action: string,
    details: Record<string, any> = {}
  ): Promise<void> {
    await this.createLog({
      companyId,
      userId,
      type: 'critical_change',
      action,
      details,
    });
  }

  /**
   * Busca logs com filtros
   */
  static async queryLogs(filters: {
    companyId?: string;
    userId?: string;
    type?: 'access' | 'ia_usage' | 'whatsapp' | 'critical_change';
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<Log[]> {
    const conditions: any[] = [];

    if (filters.companyId) {
      conditions.push({
        field: 'companyId',
        operator: '==',
        value: filters.companyId,
      });
    }

    if (filters.userId) {
      conditions.push({
        field: 'userId',
        operator: '==',
        value: filters.userId,
      });
    }

    if (filters.type) {
      conditions.push({
        field: 'type',
        operator: '==',
        value: filters.type,
      });
    }

    if (filters.startDate) {
      conditions.push({
        field: 'timestamp',
        operator: '>=',
        value: filters.startDate,
      });
    }

    if (filters.endDate) {
      conditions.push({
        field: 'timestamp',
        operator: '<=',
        value: filters.endDate,
      });
    }

    const logs = await FirestoreService.query<Log>('logs', conditions, {
      orderBy: { field: 'timestamp', direction: 'desc' },
      limit: filters.limit || 100,
    });

    return logs;
  }

  /**
   * Busca logs por empresa
   */
  static async getLogsByCompany(
    companyId: string,
    limit: number = 100
  ): Promise<Log[]> {
    return this.queryLogs({ companyId, limit });
  }

  /**
   * Busca logs por usuário
   */
  static async getLogsByUser(
    userId: string,
    limit: number = 100
  ): Promise<Log[]> {
    return this.queryLogs({ userId, limit });
  }

  /**
   * Busca logs por tipo
   */
  static async getLogsByType(
    type: 'access' | 'ia_usage' | 'whatsapp' | 'critical_change',
    companyId?: string,
    limit: number = 100
  ): Promise<Log[]> {
    return this.queryLogs({ type, companyId, limit });
  }

  /**
   * Busca logs em período
   */
  static async getLogsByPeriod(
    startDate: Date,
    endDate: Date,
    companyId?: string,
    limit: number = 100
  ): Promise<Log[]> {
    return this.queryLogs({ startDate, endDate, companyId, limit });
  }
}
