import { apiService } from './api.service';
import { Agendamento } from '../types/agendamento.types';

export const agendamentoService = {
  /**
   * Lista agendamentos da empresa
   */
  async list(): Promise<Agendamento[]> {
    const response = await apiService.get('/api/agendamentos');
    return response.data.data;
  },

  /**
   * Busca agendamento por ID
   */
  async getById(id: string): Promise<Agendamento> {
    const response = await apiService.get(`/api/agendamentos/${id}`);
    return response.data.data;
  },

  /**
   * Cria novo agendamento
   */
  async create(agendamentoData: Partial<Agendamento>): Promise<Agendamento> {
    const response = await apiService.post('/api/agendamentos', agendamentoData);
    return response.data.data;
  },

  /**
   * Atualiza agendamento
   */
  async update(id: string, updates: Partial<Agendamento>): Promise<void> {
    await apiService.put(`/api/agendamentos/${id}`, updates);
  },

  /**
   * Deleta agendamento (soft delete)
   */
  async delete(id: string): Promise<void> {
    await apiService.delete(`/api/agendamentos/${id}`);
  },

  /**
   * Atualiza status do agendamento
   */
  async updateStatus(
    id: string,
    status: 'pendente' | 'confirmado' | 'cancelado' | 'concluido'
  ): Promise<void> {
    await apiService.patch(`/api/agendamentos/${id}/status`, { status });
  },
};
