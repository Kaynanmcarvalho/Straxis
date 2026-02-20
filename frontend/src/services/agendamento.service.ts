import { apiService } from './api.service';
import { Agendamento, AgendamentoConflito } from '../types/agendamento.types';

export const agendamentoService = {
  /**
   * Lista agendamentos da empresa
   */
  async list(): Promise<Agendamento[]> {
    try {
      const response = await apiService.get('/agendamentos');
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
  async create(agendamentoData: Partial<Agendamento>): Promise<{
    agendamento: Agendamento;
    disponibilidade: {
      conflitos: AgendamentoConflito[];
      capacidadeDisponivel: number;
    };
  }> {
    const response = await apiService.post('/agendamentos', agendamentoData);
    return {
      agendamento: response.data.data,
      disponibilidade: response.data.disponibilidade
    };
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
    status: 'solicitado' | 'pendente' | 'aprovado' | 'rejeitado' | 'reagendado' | 'cancelado' | 'convertido',
    motivo?: string
  ): Promise<void> {
    await apiService.patch(`/agendamentos/${id}/status`, { status, motivo });
  },

  /**
   * Aprova agendamento
   */
  async aprovar(id: string): Promise<void> {
    await apiService.post(`/agendamentos/${id}/aprovar`, {});
  },

  /**
   * Rejeita agendamento
   */
  async rejeitar(id: string, motivo: string): Promise<void> {
    await apiService.post(`/agendamentos/${id}/rejeitar`, { motivo });
  },

  /**
   * Converte agendamento em trabalho
   */
  async converter(id: string): Promise<{
    trabalho: any;
    agendamento: Agendamento;
  }> {
    const response = await apiService.post(`/agendamentos/${id}/converter`, {});
    return response.data.data;
  },

  /**
   * Verifica disponibilidade
   */
  async verificarDisponibilidade(
    data: Date,
    horarioInicio: string,
    horarioFim: string,
    tonelagem: number
  ): Promise<{
    disponivel: boolean;
    conflitos: AgendamentoConflito[];
    capacidadeDisponivel: number;
  }> {
    const params = new URLSearchParams({
      data: data.toISOString(),
      horarioInicio,
      horarioFim,
      tonelagem: tonelagem.toString()
    });
    
    const response = await apiService.get(`/agendamentos/disponibilidade?${params}`);
    return response.data.data;
  },
};
