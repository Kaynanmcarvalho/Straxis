import { apiService } from './api.service';
import { Funcionario, FuncionarioStats, FuncionarioFormData } from '../types/funcionario.types';

class FuncionarioService {
  private baseUrl = '/api/funcionarios';

  async list(): Promise<Funcionario[]> {
    const response = await apiService.get<Funcionario[]>(this.baseUrl);
    return response;
  }

  async get(id: string): Promise<Funcionario> {
    const response = await apiService.get<Funcionario>(`${this.baseUrl}/${id}`);
    return response;
  }

  async create(data: FuncionarioFormData): Promise<Funcionario> {
    const response = await apiService.post<Funcionario>(this.baseUrl, data);
    return response;
  }

  async update(id: string, data: Partial<FuncionarioFormData>): Promise<Funcionario> {
    const response = await apiService.put<Funcionario>(`${this.baseUrl}/${id}`, data);
    return response;
  }

  async delete(id: string): Promise<void> {
    await apiService.delete(`${this.baseUrl}/${id}`);
  }

  async getStats(id: string, startDate?: string, endDate?: string): Promise<FuncionarioStats> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const url = `${this.baseUrl}/${id}/stats${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiService.get<FuncionarioStats>(url);
    return response;
  }
}

export const funcionarioService = new FuncionarioService();
