import { Company } from '../types/empresa.types';
import apiService from './api.service';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class EmpresaService {
  /**
   * Lista todas as empresas
   */
  static async list(): Promise<Company[]> {
    const response = await apiService.get<ApiResponse<Company[]>>('/empresas');
    return response.data || [];
  }

  /**
   * Busca empresa por ID
   */
  static async getById(id: string): Promise<Company> {
    const response = await apiService.get<ApiResponse<Company>>(`/empresas/${id}`);
    if (!response.data) {
      throw new Error('Empresa não encontrada');
    }
    return response.data;
  }

  /**
   * Cria nova empresa
   */
  static async create(data: Partial<Company>): Promise<Company> {
    const response = await apiService.post<ApiResponse<Company>>('/empresas', data);
    if (!response.data) {
      throw new Error(response.error || 'Erro ao criar empresa');
    }
    return response.data;
  }

  /**
   * Atualiza empresa
   */
  static async update(id: string, data: Partial<Company>): Promise<void> {
    await apiService.put<ApiResponse<void>>(`/empresas/${id}`, data);
  }

  /**
   * Deleta empresa
   */
  static async delete(id: string): Promise<void> {
    await apiService.delete<ApiResponse<void>>(`/empresas/${id}`);
  }

  /**
   * Ativa empresa
   */
  static async activate(id: string): Promise<void> {
    await apiService.patch<ApiResponse<void>>(`/empresas/${id}/activate`);
  }

  /**
   * Desativa empresa
   */
  static async deactivate(id: string): Promise<void> {
    await apiService.patch<ApiResponse<void>>(`/empresas/${id}/deactivate`);
  }

  /**
   * Lista usuários sem empresa vinculada
   */
  static async listarUsuariosSemEmpresa(): Promise<any[]> {
    try {
      const response = await apiService.get<ApiResponse<any[]>>('/usuarios/unassigned/list');
      return response.data || [];
    } catch (error) {
      console.error('Erro ao listar usuários órfãos:', error);
      return [];
    }
  }

  /**
   * Reativa empresa suspensa
   */
  static async reativar(id: string): Promise<void> {
    await apiService.patch<ApiResponse<void>>(`/empresas/${id}/activate`);
  }

  /**
   * Lista todas as empresas (alias para list)
   */
  static async listar(): Promise<Company[]> {
    return this.list();
  }
}

export const empresaService = EmpresaService;
