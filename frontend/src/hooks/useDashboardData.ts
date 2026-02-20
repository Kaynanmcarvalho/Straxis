/**
 * Hook customizado para gerenciar dados do dashboard
 */

import { useState, useEffect } from 'react';
import { 
  fetchDashboardMetrics, 
  fetchOperacoesAtivas, 
  fetchEquipes,
  DashboardMetrics,
  OperacaoDashboard,
  EquipeDashboard
} from '../services/dashboard.service';

export interface DashboardData {
  metricas: DashboardMetrics;
  trabalhos: Array<{
    id: string;
    title: string;
    client: string;
    value: number;
    status: 'critical' | 'today' | 'week';
    sla: string;
  }>;
  equipes: Array<{
    id: string;
    name: string;
    active: number;
    free: number;
    total: number;
    health: 'normal' | 'stressed' | 'critical';
    suggestion?: string;
    topMembers?: string[];
    bottlenecks?: string[];
  }>;
}

interface UseDashboardDataResult {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useDashboardData(companyId: string): UseDashboardDataResult {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setError(null);
      
      const [metricas, operacoes, equipes] = await Promise.all([
        fetchDashboardMetrics(companyId),
        fetchOperacoesAtivas(companyId, 10),
        fetchEquipes(companyId)
      ]);

      // Mapear operações para formato do dashboard
      const trabalhos = operacoes.map(op => ({
        id: op.id,
        title: op.titulo,
        client: op.clienteNome || 'Cliente',
        value: op.valorCentavos,
        status: op.prioridade === 'critica' ? 'critical' as const : 'today' as const,
        sla: op.sla || 'Sem prazo'
      }));

      // Mapear equipes para formato do dashboard
      const equipesFormatadas = equipes.map(eq => ({
        id: eq.id,
        name: eq.nome,
        active: eq.operacoesAtivas,
        free: eq.capacidadeTotal - eq.operacoesAtivas,
        total: eq.capacidadeTotal,
        health: eq.status as 'normal' | 'stressed' | 'critical',
        suggestion: eq.sugestao,
        topMembers: eq.membrosTop,
        bottlenecks: eq.gargalos
      }));

      setData({
        metricas,
        trabalhos,
        equipes: equipesFormatadas
      });
      
      setIsLoading(false);
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
      setError('Erro ao carregar dados do dashboard');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(loadData, 30000);
    
    return () => clearInterval(interval);
  }, [companyId]);

  const refresh = async () => {
    await loadData();
  };

  return { data, isLoading, error, refresh };
}
