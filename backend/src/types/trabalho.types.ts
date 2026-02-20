/**
 * Schema Canônico de Trabalho - Fonte da Verdade
 * Todos os estados e regras devem ser calculados no backend
 */

export type TrabalhoSource = 'manual' | 'agenda_approved';

export type TrabalhoStatus = 
  | 'rascunho'        // Criado mas não confirmado
  | 'agendado'        // Tem scheduledAt futuro
  | 'pronto'          // Janela aberta, pode iniciar
  | 'em_andamento'    // startedAt preenchido, sem finishedAt
  | 'pausado'         // Em andamento mas temporariamente parado
  | 'concluido'       // finishedAt preenchido
  | 'cancelado'       // Cancelado antes de concluir
  | 'bloqueado';      // Impedido por pendência

export type TrabalhoPriority = 'normal' | 'alta' | 'critica';

export interface TrabalhoPausa {
  inicio: Date;
  fim?: Date;
  motivo: string;
  registradoPor: string;
}

export interface TrabalhoRegistroPresenca {
  funcionarioId: string;
  funcionarioNome: string;
  tipo: 'presente_integral' | 'meia_diaria' | 'falta_total' | 'atraso' | 'saida_antecipada';
  horarioEntrada?: string;
  horarioSaida?: string;
  observacao?: string;
  registradoEm: Date;
  registradoPor: string;
}

export interface TrabalhoHistorico {
  id: string;
  tipo: 'status_change' | 'tonelagem_change' | 'equipe_change' | 'presenca_change' | 'pausa' | 'retomada';
  campo: string;
  valorAnterior: string;
  valorNovo: string;
  usuario: string;
  timestamp: Date;
}

export interface TrabalhoCompleto {
  // Identificação
  id: string;
  companyId: string;
  source: TrabalhoSource;
  
  // Status (calculado no backend)
  status: TrabalhoStatus;
  priority: TrabalhoPriority;
  
  // Cliente e Local
  clienteId?: string;
  clienteNome: string;
  localDescricao: string;
  
  // Tipo e Tonelagem
  tipo: 'carga' | 'descarga';
  tonelagemPrevista: number;
  tonelagemRealizada: number;
  
  // Datas e Horários (timezone-aware)
  scheduledAt?: Date;  // Se veio da agenda ou foi agendado
  startedAt?: Date;    // Quando iniciou
  finishedAt?: Date;   // Quando finalizou
  slaDueAt?: Date;     // Prazo SLA se existir
  
  // Equipe
  assignees: string[];  // IDs dos funcionários
  registrosPresenca: TrabalhoRegistroPresenca[];
  
  // Pausas
  pausas: TrabalhoPausa[];
  
  // Financeiro
  valorRecebidoCentavos: number;
  totalPagoCentavos: number;
  lucroCentavos: number;
  
  // Histórico e Auditoria
  historico: TrabalhoHistorico[];
  observacoes?: string;
  
  // Metadata
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

/**
 * Invariantes - Regras que DEVEM ser garantidas
 */
export const TrabalhoInvariants = {
  // Status
  statusConcluido: (t: TrabalhoCompleto) => t.status === 'concluido' ? !!t.finishedAt : true,
  statusEmAndamento: (t: TrabalhoCompleto) => t.status === 'em_andamento' ? !!t.startedAt : true,
  statusCancelado: (t: TrabalhoCompleto) => t.status === 'cancelado' ? !t.finishedAt : true,
  statusAgendado: (t: TrabalhoCompleto) => t.status === 'agendado' ? !!t.scheduledAt : true,
  
  // Tonelagem
  tonelagemRealizada: (t: TrabalhoCompleto) => t.tonelagemRealizada >= 0 && t.tonelagemRealizada <= t.tonelagemPrevista,
  
  // Datas
  datasLogicas: (t: TrabalhoCompleto) => {
    if (t.startedAt && t.finishedAt) {
      return t.finishedAt >= t.startedAt;
    }
    return true;
  },
  
  // Financeiro
  lucroCorreto: (t: TrabalhoCompleto) => t.lucroCentavos === (t.valorRecebidoCentavos - t.totalPagoCentavos),
};

/**
 * Calcular status baseado em regras
 */
export function calcularStatusTrabalho(trabalho: Partial<TrabalhoCompleto>): TrabalhoStatus {
  // Cancelado
  if (trabalho.deletedAt) return 'cancelado';
  
  // Concluído
  if (trabalho.finishedAt) return 'concluido';
  
  // Pausado
  if (trabalho.pausas && trabalho.pausas.length > 0) {
    const ultimaPausa = trabalho.pausas[trabalho.pausas.length - 1];
    if (!ultimaPausa.fim) return 'pausado';
  }
  
  // Em andamento
  if (trabalho.startedAt) return 'em_andamento';
  
  // Agendado
  if (trabalho.scheduledAt && trabalho.scheduledAt > new Date()) {
    return 'agendado';
  }
  
  // Pronto para iniciar
  if (trabalho.scheduledAt && trabalho.scheduledAt <= new Date()) {
    return 'pronto';
  }
  
  // Rascunho
  return 'rascunho';
}

/**
 * Calcular prioridade baseado em SLA e atraso
 */
export function calcularPrioridadeTrabalho(trabalho: Partial<TrabalhoCompleto>): TrabalhoPriority {
  if (!trabalho.slaDueAt) return 'normal';
  
  const agora = new Date();
  const horasRestantes = (trabalho.slaDueAt.getTime() - agora.getTime()) / (1000 * 60 * 60);
  
  if (horasRestantes < 0) return 'critica'; // Atrasado
  if (horasRestantes < 2) return 'critica'; // Menos de 2h
  if (horasRestantes < 4) return 'alta';     // Menos de 4h
  
  return 'normal';
}
