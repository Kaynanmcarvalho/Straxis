// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  companyId: string;
  role: 'admin_platform' | 'owner' | 'user';
  permissions: Permission[];
  active: boolean;
  telefone?: string | null;
  funcao?: string | null;
  dataAdmissao?: Date | null;
  diariaCentavos?: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface Permission {
  module: string;
  actions: ('read' | 'write' | 'delete')[];
}

// Company Types
export interface Company {
  id: string;
  name: string;
  cnpj?: string;
  telefone?: string;
  planMonths: number;
  planStartDate: Date;
  planEndDate: Date;
  active: boolean;
  isPlatform?: boolean; // true para empresa plataforma
  config: CompanyConfig;
  funcoes?: string[]; // Funções personalizadas da empresa
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyConfig {
  valorCargaPorToneladaCentavos: number;
  valorDescargaPorToneladaCentavos: number;
  whatsappEnabled: boolean;
  iaEnabled: boolean;
  iaProvider: 'openai' | 'gemini' | null;
  iaModel: string | null;
  iaPrompt: string | null;
  rateLimits: RateLimits;
  fallbackMessages: FallbackMessages;
}

export interface RateLimits {
  whatsappMessagesPerDay: number;
  whatsappMessagesPerMinute: number;
  whatsappCooldownSeconds: number;
  iaRequestsPerMinute: number;
  iaRequestsPerDayPerUser: number;
}

export interface FallbackMessages {
  iaFailure: string;
  whatsappDisconnected: string;
  messageNotUnderstood: string;
  rateLimitReached: string;
}

// Trabalho Types
export interface Trabalho {
  id: string;
  companyId: string;
  data: Date;
  tipo: 'carga' | 'descarga';
  tonelagem: number;
  valorRecebidoCentavos: number;
  funcionarios: TrabalhoFuncionario[];
  totalPagoCentavos: number;
  lucroCentavos: number;
  clienteNome?: string; // Nome do cliente (opcional)
  localDescricao?: string; // Descrição do local (opcional)
  observacoes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface TrabalhoFuncionario {
  funcionarioId: string;
  funcionarioNome: string;
  valorPagoCentavos: number;
}

// Agendamento Types
export type AgendamentoOrigem = 'manual' | 'ia' | 'whatsapp' | 'recorrente';
export type AgendamentoStatus = 
  | 'solicitado'      // Criado, aguardando validação
  | 'pendente'        // Validado, aguardando aprovação
  | 'aprovado'        // Aprovado, aguardando conversão
  | 'rejeitado'       // Rejeitado com motivo
  | 'reagendado'      // Reagendado para nova data
  | 'cancelado'       // Cancelado
  | 'convertido';     // Convertido em trabalho

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
  
  // Origem e rastreamento
  origem: AgendamentoOrigem;
  solicitadoPor: string;  // userId ou 'ia' ou 'whatsapp'
  whatsappMessageId?: string;  // Se veio do WhatsApp
  
  // Cliente
  clienteId?: string;
  clienteNome: string;
  clienteTelefone?: string;
  
  // Data e horário
  data: Date;
  horarioInicio: string;  // HH:mm
  horarioFim: string;     // HH:mm
  duracao: number;        // minutos
  
  // Operação
  tipo: 'carga' | 'descarga';
  localDescricao: string;
  tonelagem: number;
  valorEstimadoCentavos: number;
  
  // Recursos
  funcionarios: string[];
  equipamentos?: string[];
  
  // Status e aprovação
  status: AgendamentoStatus;
  prioridade: AgendamentoPrioridade;
  
  // Aprovação/Rejeição
  aprovadoPor?: string;
  aprovadoEm?: Date;
  rejeitadoPor?: string;
  rejeitadoEm?: Date;
  motivoRejeicao?: string;
  
  // Reagendamento
  reagendadoDe?: string;  // ID do agendamento original
  reagendadoPor?: string;
  reagendadoEm?: Date;
  motivoReagendamento?: string;
  
  // Conflitos
  conflitoDetectado: boolean;
  conflitos: AgendamentoConflito[];
  
  // Conversão em trabalho
  convertidoEmTrabalho: boolean;
  trabalhoId?: string;
  convertidoEm?: Date;
  convertidoPor?: string;
  
  // Observações e notas
  observacoes?: string;
  notasInternas?: string;
  
  // Auditoria
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  
  // Histórico de mudanças
  historico: {
    timestamp: Date;
    userId: string;
    acao: string;
    detalhes: string;
  }[];
}

// Funcionario Types
export interface Funcionario {
  id: string;
  companyId: string;
  nome: string;
  cpf?: string;
  telefone?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

// Log Types
export interface Log {
  id: string;
  companyId: string | null;
  userId: string | null;
  type: 'access' | 'ia_usage' | 'whatsapp' | 'critical_change';
  action: string;
  details: Record<string, any>;
  timestamp: Date;
}

// IA Usage Types
export interface IAUsage {
  id: string;
  companyId: string;
  userId: string;
  provider: 'openai' | 'gemini';
  model: string;
  modelCategory: 'cheap' | 'medium' | 'expensive';
  tokensUsed: number;
  estimatedCostCentavos: number;
  timestamp: Date;
}

// WhatsApp Types
export interface WhatsAppSession {
  id: string;
  companyId: string;
  sessionId: string;
  qrCode: string | null;
  connected: boolean;
  lastActivity: Date;
  createdAt: Date;
}

export interface WhatsAppMessage {
  id: string;
  companyId: string;
  sessionId: string;
  from: string;
  to: string;
  message: string;
  type: 'received' | 'sent';
  processedByIA: boolean;
  timestamp: Date;
}

// Error Types
export enum ErrorCode {
  // Authentication (1xxx)
  AUTH_TOKEN_EXPIRED = 1001,
  AUTH_INVALID_CREDENTIALS = 1002,
  AUTH_INSUFFICIENT_PERMISSIONS = 1003,
  AUTH_USER_INACTIVE = 1004,
  
  // Validation (2xxx)
  VALIDATION_REQUIRED_FIELD = 2001,
  VALIDATION_INVALID_TYPE = 2002,
  VALIDATION_OUT_OF_RANGE = 2003,
  VALIDATION_INVALID_FORMAT = 2004,
  
  // Business Logic (3xxx)
  BUSINESS_PLAN_EXPIRED = 3001,
  BUSINESS_DUPLICATE_RECORD = 3002,
  BUSINESS_NOT_FOUND = 3003,
  BUSINESS_COMPANY_INACTIVE = 3004,
  BUSINESS_IA_BLOCKED = 3005,
  BUSINESS_IA_LIMIT_REACHED = 3006,
  
  // External Services (4xxx)
  EXTERNAL_IA_FAILURE = 4001,
  EXTERNAL_WHATSAPP_FAILURE = 4002,
  EXTERNAL_FIREBASE_FAILURE = 4003,
  EXTERNAL_OPENAI_FAILURE = 4004,
  EXTERNAL_GEMINI_FAILURE = 4005,
  
  // Network (5xxx)
  NETWORK_OFFLINE = 5001,
  NETWORK_TIMEOUT = 5002,
  NETWORK_CONNECTION_FAILED = 5003,
}

export interface AppError {
  code: ErrorCode;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
  userId?: string;
  companyId?: string;
}
