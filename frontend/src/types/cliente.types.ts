/**
 * Tipos e Estados do Domínio Cliente
 * Arquitetura com Invariantes Impecáveis
 */

export type ClienteStatus = 'novo' | 'ativo' | 'em_servico' | 'inativo' | 'arquivado';

export type ClienteTipo = 'PF' | 'PJ';

export interface ClienteDatasCanonical {
  createdAt: Date;
  firstActivityAt: Date | null;
  lastActivityAt: Date | null;
  lastContactAt: Date | null;
}

export interface Cliente {
  id: string;
  nome: string;
  tipo: ClienteTipo;
  cpf?: string;
  cnpj?: string;
  telefone: string;
  email?: string;
  endereco?: string;
  
  // Estados e Datas Canônicas
  status: ClienteStatus;
  createdAt: Date;
  firstActivityAt: Date | null;
  lastActivityAt: Date | null;
  lastContactAt: Date | null;
  
  // Métricas Calculadas
  totalOperacoes: number;
  operacoesAtivas: number;
  receitaTotal: number;
  receitaMes: number;
  ticketMedio: number;
  crescimentoMes: number;
  diasSemAtividade: number;
  
  // Segmentação
  tags?: string[];
  isVIP?: boolean;
  
  // Multi-tenant
  companyId: string;
  deletedAt: Date | null;
}

export interface ClienteMetricas {
  ativos: number;
  emServico: number;
  inativos: number;
  novos: number;
  arquivados: number;
  receitaMes: number;
  ticketMedio: number;
  clientesRisco: number;
  semAtividadeOnboarding: number;
}

export interface ClienteFiltros {
  status?: ClienteStatus[];
  tipo?: ClienteTipo[];
  tags?: string[];
  periodoAtividade?: {
    inicio: Date;
    fim: Date;
  };
  valorMin?: number;
  valorMax?: number;
  ordenarPor?: 'nome' | 'receita' | 'atividade' | 'criacao';
  ordem?: 'asc' | 'desc';
}
