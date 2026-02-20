/**
 * Dashboard Service - Integração Backend Real
 * Substitui dados mockados por chamadas reais
 */

import { db } from '../config/firebase.config';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy,
  limit,
  Timestamp 
} from 'firebase/firestore';
import { getStartOfToday, getEndOfToday, addDays } from '../utils/timezone.util';

export interface DashboardMetrics {
  operacoesAtivas: number;
  operacoesCriticas: number;
  operacoesNormais: number;
  operacoesConcluidasHoje: number;
  tempoMedioHoje: number;
  operacoesAgendadas: number;
  capacidadeTotal: number;
  capacidadeUsada: number;
}

export interface OperacaoDashboard {
  id: string;
  titulo: string;
  cliente: string;
  clienteId: string;
  valor: number;
  status: 'critica' | 'normal' | 'agendada';
  sla: string;
  prioridade: string;
  dataInicio: Date;
  dataFim?: Date;
}

export interface EquipeDashboard {
  id: string;
  nome: string;
  membrosAtivos: number;
  membrosLivres: number;
  membrosTotal: number;
  saude: 'normal' | 'stressed' | 'critical';
  sugestao?: string;
  topMembros?: string[];
  gargalos?: string[];
}

export interface PendenciaDashboard {
  id: string;
  titulo: string;
  cliente: string;
  valor: number;
  prioridade: 'critical' | 'today' | 'week';
  sla: string;
  tipo: 'conciliacao' | 'cobranca' | 'followup';
}

/**
 * Busca métricas do dashboard
 */
export async function fetchDashboardMetrics(companyId: string): Promise<DashboardMetrics> {
  try {
    const hoje = getStartOfToday();
    const fimHoje = getEndOfToday();
    
    const trabalhosRef = collection(db, `companies/${companyId}/trabalhos`);
    
    // Operações ativas
    const ativasQuery = query(
      trabalhosRef,
      where('deletedAt', '==', null),
      where('status', 'in', ['em_andamento', 'pendente'])
    );
    const ativasSnap = await getDocs(ativasQuery);
    const operacoesAtivas = ativasSnap.size;
    
    // Operações críticas (SLA < 2h)
    const agora = new Date();
    const duasHoras = new Date(agora.getTime() + 2 * 60 * 60 * 1000);
    const criticasQuery = query(
      trabalhosRef,
      where('deletedAt', '==', null),
      where('status', 'in', ['em_andamento', 'pendente']),
      where('dataFim', '<=', Timestamp.fromDate(duasHoras))
    );
    const criticasSnap = await getDocs(criticasQuery);
    const operacoesCriticas = criticasSnap.size;
    
    // Operações concluídas hoje
    const concluidasQuery = query(
      trabalhosRef,
      where('deletedAt', '==', null),
      where('status', '==', 'concluido'),
      where('dataFim', '>=', Timestamp.fromDate(hoje)),
      where('dataFim', '<=', Timestamp.fromDate(fimHoje))
    );
    const concluidasSnap = await getDocs(concluidasQuery);
    const operacoesConcluidasHoje = concluidasSnap.size;
    
    // Tempo médio hoje
    let tempoMedioHoje = 0;
    if (operacoesConcluidasHoje > 0) {
      const tempos = concluidasSnap.docs.map(doc => {
        const data = doc.data();
        const inicio = data.dataInicio?.toDate();
        const fim = data.dataFim?.toDate();
        if (inicio && fim) {
          return (fim.getTime() - inicio.getTime()) / (1000 * 60); // minutos
        }
        return 0;
      });
      tempoMedioHoje = tempos.reduce((a, b) => a + b, 0) / tempos.length;
    }
    
    // Operações agendadas (próximas 48h)
    const proximas48h = addDays(agora, 2);
    const agendadasQuery = query(
      trabalhosRef,
      where('deletedAt', '==', null),
      where('status', '==', 'agendado'),
      where('dataInicio', '>=', Timestamp.fromDate(agora)),
      where('dataInicio', '<=', Timestamp.fromDate(proximas48h))
    );
    const agendadasSnap = await getDocs(agendadasQuery);
    const operacoesAgendadas = agendadasSnap.size;
    
    // Capacidade (simplificado - ajustar conforme modelo real)
    const funcionariosRef = collection(db, `companies/${companyId}/funcionarios`);
    const funcionariosQuery = query(
      funcionariosRef,
      where('deletedAt', '==', null),
      where('ativo', '==', true)
    );
    const funcionariosSnap = await getDocs(funcionariosQuery);
    const capacidadeTotal = funcionariosSnap.size;
    
    // Funcionários ocupados (com trabalhos ativos)
    const ocupados = new Set();
    ativasSnap.docs.forEach(doc => {
      const data = doc.data();
      if (data.funcionarioId) {
        ocupados.add(data.funcionarioId);
      }
    });
    const capacidadeUsada = ocupados.size;
    
    return {
      operacoesAtivas,
      operacoesCriticas,
      operacoesNormais: operacoesAtivas - operacoesCriticas,
      operacoesConcluidasHoje,
      tempoMedioHoje,
      operacoesAgendadas,
      capacidadeTotal,
      capacidadeUsada
    };
  } catch (error) {
    console.error('Erro ao buscar métricas:', error);
    throw error;
  }
}

/**
 * Busca operações em andamento
 */
export async function fetchOperacoesAtivas(
  companyId: string,
  limitCount: number = 10
): Promise<OperacaoDashboard[]> {
  try {
    const trabalhosRef = collection(db, `companies/${companyId}/trabalhos`);
    const q = query(
      trabalhosRef,
      where('deletedAt', '==', null),
      where('status', 'in', ['em_andamento', 'pendente']),
      orderBy('dataFim', 'asc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    const operacoes: OperacaoDashboard[] = [];
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      // Buscar nome do cliente
      let nomeCliente = 'Cliente não encontrado';
      if (data.clienteId) {
        try {
          const clienteRef = collection(db, `companies/${companyId}/clientes`);
          const clienteQuery = query(clienteRef, where('__name__', '==', data.clienteId));
          const clienteSnap = await getDocs(clienteQuery);
          if (!clienteSnap.empty) {
            nomeCliente = clienteSnap.docs[0].data().nome;
          }
        } catch (e) {
          console.error('Erro ao buscar cliente:', e);
        }
      }
      
      const dataFim = data.dataFim?.toDate();
      const agora = new Date();
      const horasRestantes = dataFim ? (dataFim.getTime() - agora.getTime()) / (1000 * 60 * 60) : 999;
      
      let status: 'critica' | 'normal' | 'agendada' = 'normal';
      let sla = 'Sem prazo';
      
      if (horasRestantes < 2) {
        status = 'critica';
        sla = `${Math.floor(horasRestantes * 60)}min restantes`;
      } else if (horasRestantes < 24) {
        sla = `${Math.floor(horasRestantes)}h restantes`;
      } else {
        sla = dataFim?.toLocaleDateString('pt-BR') || 'Sem prazo';
      }
      
      operacoes.push({
        id: doc.id,
        titulo: data.descricao || 'Sem descrição',
        cliente: nomeCliente,
        clienteId: data.clienteId || '',
        valor: data.valorRecebidoCentavos || 0,
        status,
        sla,
        prioridade: status === 'critica' ? 'Crítico' : 'Normal',
        dataInicio: data.dataInicio?.toDate() || new Date(),
        dataFim: dataFim
      });
    }
    
    return operacoes;
  } catch (error) {
    console.error('Erro ao buscar operações ativas:', error);
    throw error;
  }
}

/**
 * Busca equipes e capacidade
 */
export async function fetchEquipes(companyId: string): Promise<EquipeDashboard[]> {
  try {
    // TODO: Implementar quando houver modelo de equipes
    // Por enquanto, retorna array vazio
    return [];
  } catch (error) {
    console.error('Erro ao buscar equipes:', error);
    throw error;
  }
}

/**
 * Busca pendências
 */
export async function fetchPendencias(companyId: string): Promise<PendenciaDashboard[]> {
  try {
    // TODO: Implementar quando houver modelo de pendências
    // Por enquanto, retorna array vazio
    return [];
  } catch (error) {
    console.error('Erro ao buscar pendências:', error);
    throw error;
  }
}

/**
 * Busca operações (para busca)
 */
export async function searchOperacoes(
  companyId: string,
  searchTerm: string
): Promise<OperacaoDashboard[]> {
  try {
    const trabalhosRef = collection(db, `companies/${companyId}/trabalhos`);
    const q = query(
      trabalhosRef,
      where('deletedAt', '==', null),
      orderBy('dataInicio', 'desc'),
      limit(50)
    );
    
    const snapshot = await getDocs(q);
    const operacoes: OperacaoDashboard[] = [];
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      // Filtro client-side (melhorar com Algolia/ElasticSearch depois)
      const matchId = doc.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDesc = data.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchId && !matchDesc) continue;
      
      // Buscar nome do cliente
      let nomeCliente = 'Cliente não encontrado';
      if (data.clienteId) {
        try {
          const clienteRef = collection(db, `companies/${companyId}/clientes`);
          const clienteQuery = query(clienteRef, where('__name__', '==', data.clienteId));
          const clienteSnap = await getDocs(clienteQuery);
          if (!clienteSnap.empty) {
            nomeCliente = clienteSnap.docs[0].data().nome;
          }
        } catch (e) {
          console.error('Erro ao buscar cliente:', e);
        }
      }
      
      operacoes.push({
        id: doc.id,
        titulo: data.descricao || 'Sem descrição',
        cliente: nomeCliente,
        clienteId: data.clienteId || '',
        valor: data.valorRecebidoCentavos || 0,
        status: 'normal',
        sla: '',
        prioridade: 'Normal',
        dataInicio: data.dataInicio?.toDate() || new Date(),
        dataFim: data.dataFim?.toDate()
      });
    }
    
    return operacoes;
  } catch (error) {
    console.error('Erro ao buscar operações:', error);
    throw error;
  }
}
