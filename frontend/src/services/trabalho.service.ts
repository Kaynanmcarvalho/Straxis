import { apiService } from './api.service';
import { Trabalho } from '../types/trabalho.types';

export const trabalhoService = {
  /**
   * Lista trabalhos da empresa
   */
  async list(): Promise<Trabalho[]> {
    const response = await apiService.get('/api/trabalhos');
    return response.data.data;
  },

  /**
   * Busca trabalho por ID
   */
  async getById(id: string): Promise<Trabalho> {
    const response = await apiService.get(`/api/trabalhos/${id}`);
    return response.data.data;
  },

  /**
   * Cria novo trabalho
   */
  async create(trabalhoData: Partial<Trabalho>): Promise<Trabalho> {
    const response = await apiService.post('/api/trabalhos', trabalhoData);
    return response.data.data;
  },

  /**
   * Atualiza trabalho
   */
  async update(id: string, updates: Partial<Trabalho>): Promise<void> {
    await apiService.put(`/api/trabalhos/${id}`, updates);
  },

  /**
   * Deleta trabalho (soft delete)
   */
  async delete(id: string): Promise<void> {
    await apiService.delete(`/api/trabalhos/${id}`);
  },
};
