export type AgendamentoOrigem = 'manual' | 'ia' | 'whatsapp' | 'recorrente';
export type AgendamentoStatus = 
  | 'solicitado'
  | 'pendente'
  | 'aprovado'
  | 'rejeitado'
  | 'reagendado'
  | 'cancelado'
  | 'convertido';

export type AgendamentoPrioridade = 'normal' | 'alta' | 'critica';

export interface AgendamentoConflito {
  agendamentoId: string;
  tipo: 'horario' | 'capacidade' | 'recurso' | 'cliente_duplicado';
  descricao: string;
  severidade: 'baixa' | 'media' | 'alta';
}

export interface Agendamento {
  id: string;
  companyId: string;
  origem: AgendamentoOrigem;
  solicitadoPor: string;
  whatsappMessageId?: string;
  clienteId?: string;
  clienteNome: string;
  clienteTelefone?: string;
  data: Date;
  horarioInicio: string;
  horarioFim: string;
  duracao: number;
  tipo: 'carga' | 'descarga';
  localDescricao: string;
  tonelagem: number;
  valorEstimadoCentavos: number;
  funcionarios: string[];
  equipamentos?: string[];
  status: AgendamentoStatus;
  prioridade: AgendamentoPrioridade;
  aprovadoPor?: string;
  aprovadoEm?: Date;
  rejeitadoPor?: string;
  rejeitadoEm?: Date;
  motivoRejeicao?: string;
  reagendadoDe?: string;
  reagendadoPor?: string;
  reagendadoEm?: Date;
  motivoReagendamento?: string;
  conflitoDetectado: boolean;
  conflitos: AgendamentoConflito[];
  convertidoEmTrabalho: boolean;
  trabalhoId?: string;
  convertidoEm?: Date;
  convertidoPor?: string;
  observacoes?: string;
  notasInternas?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  historico: {
    timestamp: Date;
    userId: string;
    acao: string;
    detalhes: string;
  }[];
}
