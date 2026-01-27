import { Log } from '../types';

export class LogModel {
  static create(data: Partial<Log>): Log {
    const now = new Date();
    return {
      id: data.id || '',
      companyId: data.companyId || null,
      userId: data.userId || null,
      type: data.type || 'access',
      action: data.action || '',
      details: data.details || {},
      timestamp: data.timestamp || now,
    };
  }

  static validate(log: Partial<Log>): string[] {
    const errors: string[] = [];

    if (!log.type) {
      errors.push('Tipo de log é obrigatório');
    }

    if (!['access', 'ia_usage', 'whatsapp', 'critical_change'].includes(log.type || '')) {
      errors.push('Tipo de log inválido');
    }

    if (!log.action) {
      errors.push('Ação é obrigatória');
    }

    return errors;
  }

  static toFirestore(log: Log): Record<string, any> {
    return {
      companyId: log.companyId,
      userId: log.userId,
      type: log.type,
      action: log.action,
      details: log.details,
      timestamp: log.timestamp,
    };
  }

  static fromFirestore(id: string, data: any): Log {
    return {
      id,
      companyId: data.companyId || null,
      userId: data.userId || null,
      type: data.type,
      action: data.action,
      details: data.details || {},
      timestamp: data.timestamp?.toDate() || new Date(),
    };
  }
}
