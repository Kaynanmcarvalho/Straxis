import { apiService } from './api.service';
import { Trabalho } from '../types/trabalho.types';

export const trabalhoService = {
  /**
   * Lista trabalhos da empresa
   */
  async list(): Promise<Trabalho[]> {
    try {
      const response = await apiService.get('/trabalhos');
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
      console.error('Error loading trabalhos:', error);
      return [];
    }
  },

  /**
   * Busca trabalho por ID
   */
  async getById(id: string): Promise<Trabalho> {
    const response = await apiService.get(`/trabalhos/${id}`);
    return response.data.data;
  },

  /**
   * Cria novo trabalho
   */
  async create(trabalhoData: Partial<Trabalho>): Promise<Trabalho> {
    const response = await apiService.post('/trabalhos', trabalhoData);
    return response.data.data;
  },

  /**
   * Atualiza trabalho
   */
  async update(id: string, updates: Partial<Trabalho>): Promise<void> {
    await apiService.put(`/trabalhos/${id}`, updates);
  },

  /**
   * Deleta trabalho (soft delete)
   */
  async delete(id: string): Promise<void> {
    await apiService.delete(`/trabalhos/${id}`);
  },
};
