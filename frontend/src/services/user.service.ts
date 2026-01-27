import { apiService } from './api.service';
import { User, Permission } from '../types/user.types';

export const userService = {
  /**
   * Lista usuários da empresa
   */
  async list(companyId?: string): Promise<User[]> {
    const params = companyId ? { companyId } : {};
    const response = await apiService.get('/usuarios', { params });
    return response.data.data;
  },

  /**
   * Busca usuário por ID
   */
  async getById(id: string): Promise<User> {
    const response = await apiService.get(`/usuarios/${id}`);
    return response.data.data;
  },

  /**
   * Cria novo usuário
   */
  async create(userData: Partial<User>): Promise<User> {
    const response = await apiService.post('/usuarios', userData);
    return response.data.data;
  },

  /**
   * Atualiza usuário
   */
  async update(id: string, updates: Partial<User>): Promise<void> {
    await apiService.put(`/usuarios/${id}`, updates);
  },

  /**
   * Deleta usuário (soft delete)
   */
  async delete(id: string): Promise<void> {
    await apiService.delete(`/usuarios/${id}`);
  },

  /**
   * Ativa usuário
   */
  async activate(id: string): Promise<void> {
    await apiService.patch(`/usuarios/${id}/activate`);
  },

  /**
   * Desativa usuário
   */
  async deactivate(id: string): Promise<void> {
    await apiService.patch(`/usuarios/${id}/deactivate`);
  },

  /**
   * Atualiza permissões do usuário
   */
  async updatePermissions(id: string, permissions: Permission[]): Promise<void> {
    await apiService.patch(`/usuarios/${id}/permissions`, { permissions });
  },
};
