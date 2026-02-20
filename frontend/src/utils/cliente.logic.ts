/**
 * Lógica de Negócio - Cliente
 * Invariantes e Regras Impecáveis
 */

import { Cliente, ClienteStatus, ClienteMetricas } from '../types/cliente.types';

const JANELA_ATIVIDADE_DIAS = 30;
const JANELA_ONBOARDING_DIAS = 7;

/**
 * Calcula o status correto do cliente baseado em regras impecáveis
 */
export function calcularStatusCliente(cliente: {
  createdAt: Date;
  firstActivityAt: Date | null;
  lastActivityAt: Date | null;
  operacoesAtivas: number;
}): ClienteStatus {
  const agora = new Date();
  const diasDesdeCriacao = Math.floor(
    (agora.getTime() - cliente.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );

  // 1. Em serviço (prioridade máxima)
  if (cliente.operacoesAtivas > 0) {
    return 'em_servico';
  }

  // 2. Novo (criado recentemente, sem atividade)
  if (!cliente.firstActivityAt && diasDesdeCriacao <= JANELA_ONBOARDING_DIAS) {
    return 'novo';
  }

  // 3. Ativo (teve atividade recente)
  if (cliente.lastActivityAt) {
    const diasSemAtividade = Math.floor(
      (agora.getTime() - cliente.lastActivityAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (diasSemAtividade <= JANELA_ATIVIDADE_DIAS) {
      return 'ativo';
    }
    
    // 4. Inativo (teve atividade, mas há muito tempo)
    return 'inativo';
  }

  // 5. Sem atividade desde o cadastro (onboarding pendente)
  if (!cliente.firstActivityAt && diasDesdeCriacao > JANELA_ONBOARDING_DIAS) {
    return 'inativo';
  }

  return 'novo';
}

/**
 * Calcula dias sem atividade com lógica correta
 */
export function calcularDiasSemAtividade(cliente: {
  createdAt: Date;
  lastActivityAt: Date | null;
}): number {
  const agora = new Date();
  
  if (cliente.lastActivityAt) {
    return Math.floor(
      (agora.getTime() - cliente.lastActivityAt.getTime()) / (1000 * 60 * 60 * 24)
    );
  }
  
  // Se nunca teve atividade, conta desde a criação
  return Math.floor(
    (agora.getTime() - cliente.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );
}

/**
 * Determina se cliente está em risco (precisa reativação)
 */
export function clienteEmRisco(cliente: Cliente): boolean {
  // Apenas clientes com atividade anterior que ficaram inativos
  return (
    cliente.status === 'inativo' &&
    cliente.firstActivityAt !== null &&
    cliente.diasSemAtividade > JANELA_ATIVIDADE_DIAS
  );
}

/**
 * Determina se cliente precisa onboarding
 */
export function clientePendenteOnboarding(cliente: Cliente): boolean {
  return (
    cliente.status === 'novo' ||
    (cliente.status === 'inativo' && cliente.firstActivityAt === null)
  );
}

/**
 * Calcula métricas da carteira com lógica impecável
 */
export function calcularMetricasCarteira(clientes: Cliente[]): ClienteMetricas {
  const clientesAtivos = clientes.filter(c => c.deletedAt === null);
  
  const ativos = clientesAtivos.filter(c => c.status === 'ativo').length;
  const emServico = clientesAtivos.filter(c => c.status === 'em_servico').length;
  const inativos = clientesAtivos.filter(c => c.status === 'inativo').length;
  const novos = clientesAtivos.filter(c => c.status === 'novo').length;
  const arquivados = clientes.filter(c => c.deletedAt !== null).length;
  
  const receitaMes = clientesAtivos.reduce((sum, c) => sum + c.receitaMes, 0);
  
  // Ticket médio: receita do mês / clientes com receita no mês
  const clientesComReceitaMes = clientesAtivos.filter(c => c.receitaMes > 0).length;
  const ticketMedio = clientesComReceitaMes > 0 ? receitaMes / clientesComReceitaMes : 0;
  
  // Clientes em risco: inativos com atividade anterior
  const clientesRisco = clientesAtivos.filter(clienteEmRisco).length;
  
  // Sem atividade desde onboarding
  const semAtividadeOnboarding = clientesAtivos.filter(clientePendenteOnboarding).length;
  
  return {
    ativos,
    emServico,
    inativos,
    novos,
    arquivados,
    receitaMes,
    ticketMedio,
    clientesRisco,
    semAtividadeOnboarding
  };
}

/**
 * Gera texto de contexto para célula do cliente
 */
export function gerarTextoContextoCliente(cliente: Cliente): string {
  if (cliente.status === 'novo') {
    return 'Sem atividade ainda';
  }
  
  if (cliente.status === 'em_servico') {
    return `Em serviço agora • ${cliente.operacoesAtivas} ${cliente.operacoesAtivas === 1 ? 'operação' : 'operações'}`;
  }
  
  if (cliente.lastActivityAt) {
    const diasSemAtividade = calcularDiasSemAtividade(cliente);
    
    if (diasSemAtividade === 0) {
      return 'Última operação hoje';
    }
    
    if (diasSemAtividade === 1) {
      return 'Última operação ontem';
    }
    
    if (diasSemAtividade <= 7) {
      return `Última operação há ${diasSemAtividade} dias`;
    }
    
    const dataFormatada = cliente.lastActivityAt.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'short'
    });
    return `Última operação • ${dataFormatada}`;
  }
  
  if (cliente.firstActivityAt === null) {
    const diasDesdeCriacao = Math.floor(
      (Date.now() - cliente.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    return `Sem atividade há ${diasDesdeCriacao} dias desde o cadastro`;
  }
  
  return 'Sem operações';
}

/**
 * Gera microcopy para alerta de reativação
 */
export function gerarTextoAlertaReativacao(quantidade: number): string {
  if (quantidade === 0) return '';
  if (quantidade === 1) return '1 cliente sem atividade há 30+ dias';
  return `${quantidade} clientes sem atividade há 30+ dias`;
}
