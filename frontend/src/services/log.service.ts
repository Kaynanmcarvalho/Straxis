import { apiService } from './api.service';

export interface Log {
  id: string;
  companyId: string | null;
  userId: string | null;
  type: 'access' | 'ia_usage' | 'whatsapp' | 'critical_change';
  action: string;
  details: Record<string, any>;
  timestamp: Date;
}

export interface LogFilters {
  companyId?: string;
  userId?: string;
  type?: 'access' | 'ia_usage' | 'whatsapp' | 'critical_change';
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

export const logService = {
  /**
   * Lista logs com filtros
   */
  async list(filters: LogFilters = {}): Promise<Log[]> {
    const params: any = {};
    
    if (filters.companyId) params.companyId = filters.companyId;
    if (filters.userId) params.userId = filters.userId;
    if (filters.type) params.type = filters.type;
    if (filters.startDate) params.startDate = filters.startDate.toISOString();
    if (filters.endDate) params.endDate = filters.endDate.toISOString();
    if (filters.limit) params.limit = filters.limit;

    const response = await apiService.get('/logs', { params });
    return response.data.data.map((log: any) => ({
      ...log,
      timestamp: new Date(log.timestamp),
    }));
  },

  /**
   * Busca logs de uma empresa
   */
  async getByCompany(companyId: string, limit: number = 100): Promise<Log[]> {
    const response = await apiService.get(`/logs/company/${companyId}`, {
      params: { limit },
    });
    return response.data.data.map((log: any) => ({
      ...log,
      timestamp: new Date(log.timestamp),
    }));
  },

  /**
   * Busca logs de um usuário
   */
  async getByUser(userId: string, limit: number = 100): Promise<Log[]> {
    const response = await apiService.get(`/logs/user/${userId}`, {
      params: { limit },
    });
    return response.data.data.map((log: any) => ({
      ...log,
      timestamp: new Date(log.timestamp),
    }));
  },

  /**
   * Busca logs por tipo
   */
  async getByType(
    type: 'access' | 'ia_usage' | 'whatsapp' | 'critical_change',
    companyId?: string,
    limit: number = 100
  ): Promise<Log[]> {
    const params: any = { limit };
    if (companyId) params.companyId = companyId;

    const response = await apiService.get(`/logs/type/${type}`, { params });
    return response.data.data.map((log: any) => ({
      ...log,
      timestamp: new Date(log.timestamp),
    }));
  },
};
