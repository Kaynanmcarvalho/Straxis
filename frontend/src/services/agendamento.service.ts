import { apiService } from './api.service';
import { Agendamento } from '../types/agendamento.types';

export const agendamentoService = {
  /**
   * Lista agendamentos da empresa
   */
  async list(): Promise<Agendamento[]> {
    try {
      const response = await apiService.get('/agendamentos');
      // Garantir que sempre retorna um array
      if (response?.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      if (Array.isArray(response?.data)) {
        return response.data;
      }
      if (Array.isArray(response)) {
        return response;
      }
      return [];
    } catch (error) {
      console.error('Error loading agendamentos:', error);
      return [];
    }
  },

  /**
   * Busca agendamento por ID
   */
  async getById(id: string): Promise<Agendamento> {
    const response = await apiService.get(`/agendamentos/${id}`);
    return response.data.data;
  },

  /**
   * Cria novo agendamento
   */
  async create(agendamentoData: Partial<Agendamento>): Promise<Agendamento> {
    const response = await apiService.post('/agendamentos', agendamentoData);
    return response.data.data;
  },

  /**
   * Atualiza agendamento
   */
  async update(id: string, updates: Partial<Agendamento>): Promise<void> {
    await apiService.put(`/agendamentos/${id}`, updates);
  },

  /**
   * Deleta agendamento (soft delete)
   */
  async delete(id: string): Promise<void> {
    await apiService.delete(`/agendamentos/${id}`);
  },

  /**
   * Atualiza status do agendamento
   */
  async updateStatus(
    id: string,
    status: 'pendente' | 'confirmado' | 'cancelado' | 'concluido'
  ): Promise<void> {
    await apiService.patch(`/agendamentos/${id}/status`, { status });
  },
};
