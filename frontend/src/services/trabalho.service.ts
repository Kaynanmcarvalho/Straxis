import { API_BASE_URL } from '../config/api.config';

export interface Trabalho {
  id: string;
  companyId: string;
  source: 'manual' | 'agenda_approved';
  status: 'rascunho' | 'agendado' | 'pronto' | 'em_andamento' | 'pausado' | 'concluido' | 'cancelado' | 'bloqueado';
  priority: 'normal' | 'alta' | 'critica';
  clienteId?: string;
  clienteNome: string;
  localDescricao: string;
  tipo: 'carga' | 'descarga';
  tonelagemPrevista: number;
  tonelagemRealizada: number;
  scheduledAt?: string;
  startedAt?: string;
  finishedAt?: string;
  slaDueAt?: string;
  assignees: string[];
  registrosPresenca: unknown[];
  pausas: unknown[];
  valorRecebidoCentavos: number;
  totalPagoCentavos: number;
  lucroCentavos: number;
  historico: unknown[];
  observacoes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface TrabalhoCreateDTO {
  clienteNome: string;
  localDescricao: string;
  tipo: 'carga' | 'descarga';
  tonelagemPrevista: number;
  valorRecebidoCentavos: number;
  scheduledAt?: string;
  assignees?: string[];
  observacoes?: string;
}

export interface TrabalhoMetrics {
  total: number;
  emAndamento: number;
  planejadas: number;
  concluidas: number;
  atrasadas: number;
  totalTonelagem: number;
}

class TrabalhoService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  async list(): Promise<{ success: boolean; data: Trabalho[]; total: number }> {
    try {
      const response = await fetch(`${API_BASE_URL}/trabalhos`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Backend não está respondendo corretamente. Verifique se o servidor está rodando.');
      }

      return response.json();
    } catch (error) {
      console.error('Erro ao listar trabalhos:', error);
      throw new Error((error as Error).message || 'Erro ao conectar com o servidor');
    }
  }

  async getById(id: string): Promise<{ success: boolean; data: Trabalho }> {
    const response = await fetch(`${API_BASE_URL}/trabalhos/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar trabalho: ${response.statusText}`);
    }

    return response.json();
  }

  async create(data: TrabalhoCreateDTO): Promise<{ success: boolean; data: Trabalho; message: string }> {
    const response = await fetch(`${API_BASE_URL}/trabalhos`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao criar trabalho');
    }

    return response.json();
  }

  async iniciar(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/trabalhos/${id}/iniciar`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao iniciar trabalho');
    }

    return response.json();
  }

  async pausar(id: string, motivo: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/trabalhos/${id}/pausar`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ motivo }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao pausar trabalho');
    }

    return response.json();
  }

  async retomar(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/trabalhos/${id}/retomar`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao retomar trabalho');
    }

    return response.json();
  }

  async finalizar(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/trabalhos/${id}/finalizar`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao finalizar trabalho');
    }

    return response.json();
  }

  async update(id: string, data: Partial<Trabalho>): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/trabalhos/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao atualizar trabalho');
    }

    return response.json();
  }

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/trabalhos/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao deletar trabalho');
    }

    return response.json();
  }

  async getMetrics(): Promise<TrabalhoMetrics> {
    const { data } = await this.list();
    
    return {
      total: data.length,
      emAndamento: data.filter(t => t.status === 'em_andamento').length,
      planejadas: data.filter(t => t.status === 'agendado' || t.status === 'pronto').length,
      concluidas: data.filter(t => t.status === 'concluido').length,
      atrasadas: data.filter(t => {
        if (t.status !== 'em_andamento' && t.status !== 'pausado') return false;
        if (!t.slaDueAt) return false;
        return new Date(t.slaDueAt) < new Date();
      }).length,
      totalTonelagem: data.reduce((acc, t) => acc + t.tonelagemPrevista, 0),
    };
  }
}

export default new TrabalhoService();
