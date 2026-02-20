import { Agendamento, AgendamentoStatus, AgendamentoPrioridade } from '../types';

export class AgendamentoModel {
  static create(data: Partial<Agendamento>): Agendamento {
    const now = new Date();
    
    // Calcular duração se horários fornecidos
    let duracao = data.duracao || 0;
    if (data.horarioInicio && data.horarioFim && !data.duracao) {
      const [h1, m1] = data.horarioInicio.split(':').map(Number);
      const [h2, m2] = data.horarioFim.split(':').map(Number);
      duracao = (h2 * 60 + m2) - (h1 * 60 + m1);
    }
    
    return {
      id: data.id || '',
      companyId: data.companyId || '',
      
      // Origem
      origem: data.origem || 'manual',
      solicitadoPor: data.solicitadoPor || data.createdBy || '',
      whatsappMessageId: data.whatsappMessageId,
      
      // Cliente
      clienteId: data.clienteId,
      clienteNome: data.clienteNome || '',
      clienteTelefone: data.clienteTelefone,
      
      // Data e horário
      data: data.data || now,
      horarioInicio: data.horarioInicio || '08:00',
      horarioFim: data.horarioFim || '17:00',
      duracao,
      
      // Operação
      tipo: data.tipo || 'carga',
      localDescricao: data.localDescricao || '',
      tonelagem: data.tonelagem || 0,
      valorEstimadoCentavos: data.valorEstimadoCentavos || 0,
      
      // Recursos
      funcionarios: data.funcionarios || [],
      equipamentos: data.equipamentos,
      
      // Status
      status: data.status || 'solicitado',
      prioridade: data.prioridade || 'normal',
      
      // Aprovação
      aprovadoPor: data.aprovadoPor,
      aprovadoEm: data.aprovadoEm,
      rejeitadoPor: data.rejeitadoPor,
      rejeitadoEm: data.rejeitadoEm,
      motivoRejeicao: data.motivoRejeicao,
      
      // Reagendamento
      reagendadoDe: data.reagendadoDe,
      reagendadoPor: data.reagendadoPor,
      reagendadoEm: data.reagendadoEm,
      motivoReagendamento: data.motivoReagendamento,
      
      // Conflitos
      conflitoDetectado: data.conflitoDetectado || false,
      conflitos: data.conflitos || [],
      
      // Conversão
      convertidoEmTrabalho: data.convertidoEmTrabalho || false,
      trabalhoId: data.trabalhoId,
      convertidoEm: data.convertidoEm,
      convertidoPor: data.convertidoPor,
      
      // Observações
      observacoes: data.observacoes,
      notasInternas: data.notasInternas,
      
      // Auditoria
      createdBy: data.createdBy || '',
      createdAt: data.createdAt || now,
      updatedAt: data.updatedAt || now,
      deletedAt: data.deletedAt || null,
      
      // Histórico
      historico: data.historico || [{
        timestamp: now,
        userId: data.createdBy || '',
        acao: 'criado',
        detalhes: `Agendamento criado via ${data.origem || 'manual'}`
      }],
    };
  }

  static validate(agendamento: Partial<Agendamento>): string[] {
    const errors: string[] = [];

    if (!agendamento.companyId) {
      errors.push('CompanyId é obrigatório');
    }

    if (!agendamento.clienteNome) {
      errors.push('Nome do cliente é obrigatório');
    }

    if (!agendamento.data) {
      errors.push('Data é obrigatória');
    }

    if (!agendamento.horarioInicio) {
      errors.push('Horário de início é obrigatório');
    }

    if (!agendamento.horarioFim) {
      errors.push('Horário de fim é obrigatório');
    }

    if (!agendamento.tipo || !['carga', 'descarga'].includes(agendamento.tipo)) {
      errors.push('Tipo inválido (deve ser carga ou descarga)');
    }

    if (!agendamento.localDescricao) {
      errors.push('Local é obrigatório');
    }

    if (agendamento.tonelagem === undefined || agendamento.tonelagem === null) {
      errors.push('Tonelagem é obrigatória');
    } else if (agendamento.tonelagem <= 0) {
      errors.push('Tonelagem deve ser maior que zero');
    }

    if (agendamento.valorEstimadoCentavos === undefined || agendamento.valorEstimadoCentavos === null) {
      errors.push('Valor estimado é obrigatório');
    } else if (agendamento.valorEstimadoCentavos < 0) {
      errors.push('Valor estimado não pode ser negativo');
    }

    if (!agendamento.createdBy && !agendamento.solicitadoPor) {
      errors.push('Solicitante é obrigatório');
    }

    // Validar horários
    if (agendamento.horarioInicio && agendamento.horarioFim) {
      const [h1, m1] = agendamento.horarioInicio.split(':').map(Number);
      const [h2, m2] = agendamento.horarioFim.split(':').map(Number);
      const inicio = h1 * 60 + m1;
      const fim = h2 * 60 + m2;
      
      if (fim <= inicio) {
        errors.push('Horário de fim deve ser posterior ao horário de início');
      }
    }

    return errors;
  }

  static validateTransition(
    currentStatus: AgendamentoStatus,
    newStatus: AgendamentoStatus
  ): { valid: boolean; error?: string } {
    const transitions: Record<AgendamentoStatus, AgendamentoStatus[]> = {
      solicitado: ['pendente', 'rejeitado', 'cancelado'],
      pendente: ['aprovado', 'rejeitado', 'reagendado', 'cancelado'],
      aprovado: ['convertido', 'cancelado'],
      rejeitado: ['reagendado'],
      reagendado: ['pendente', 'cancelado'],
      cancelado: [],
      convertido: [],
    };

    const validTransitions = transitions[currentStatus] || [];
    
    if (!validTransitions.includes(newStatus)) {
      return {
        valid: false,
        error: `Transição inválida: ${currentStatus} → ${newStatus}`
      };
    }

    return { valid: true };
  }

  static addHistorico(
    agendamento: Agendamento,
    userId: string,
    acao: string,
    detalhes: string
  ): Agendamento {
    return {
      ...agendamento,
      historico: [
        ...agendamento.historico,
        {
          timestamp: new Date(),
          userId,
          acao,
          detalhes
        }
      ],
      updatedAt: new Date()
    };
  }

  static toFirestore(agendamento: Agendamento): Record<string, any> {
    const data: Record<string, any> = {
      companyId: agendamento.companyId,
      origem: agendamento.origem,
      solicitadoPor: agendamento.solicitadoPor,
      clienteNome: agendamento.clienteNome,
      data: agendamento.data,
      horarioInicio: agendamento.horarioInicio,
      horarioFim: agendamento.horarioFim,
      duracao: agendamento.duracao,
      tipo: agendamento.tipo,
      localDescricao: agendamento.localDescricao,
      tonelagem: agendamento.tonelagem,
      valorEstimadoCentavos: agendamento.valorEstimadoCentavos,
      funcionarios: agendamento.funcionarios,
      status: agendamento.status,
      prioridade: agendamento.prioridade,
      conflitoDetectado: agendamento.conflitoDetectado,
      conflitos: agendamento.conflitos,
      convertidoEmTrabalho: agendamento.convertidoEmTrabalho,
      createdBy: agendamento.createdBy,
      createdAt: agendamento.createdAt,
      updatedAt: agendamento.updatedAt,
      deletedAt: agendamento.deletedAt,
      historico: agendamento.historico,
    };

    // Adicionar campos opcionais apenas se definidos
    if (agendamento.whatsappMessageId) data.whatsappMessageId = agendamento.whatsappMessageId;
    if (agendamento.clienteId) data.clienteId = agendamento.clienteId;
    if (agendamento.clienteTelefone) data.clienteTelefone = agendamento.clienteTelefone;
    if (agendamento.equipamentos) data.equipamentos = agendamento.equipamentos;
    if (agendamento.aprovadoPor) data.aprovadoPor = agendamento.aprovadoPor;
    if (agendamento.aprovadoEm) data.aprovadoEm = agendamento.aprovadoEm;
    if (agendamento.rejeitadoPor) data.rejeitadoPor = agendamento.rejeitadoPor;
    if (agendamento.rejeitadoEm) data.rejeitadoEm = agendamento.rejeitadoEm;
    if (agendamento.motivoRejeicao) data.motivoRejeicao = agendamento.motivoRejeicao;
    if (agendamento.reagendadoDe) data.reagendadoDe = agendamento.reagendadoDe;
    if (agendamento.reagendadoPor) data.reagendadoPor = agendamento.reagendadoPor;
    if (agendamento.reagendadoEm) data.reagendadoEm = agendamento.reagendadoEm;
    if (agendamento.motivoReagendamento) data.motivoReagendamento = agendamento.motivoReagendamento;
    if (agendamento.trabalhoId) data.trabalhoId = agendamento.trabalhoId;
    if (agendamento.convertidoEm) data.convertidoEm = agendamento.convertidoEm;
    if (agendamento.convertidoPor) data.convertidoPor = agendamento.convertidoPor;
    if (agendamento.observacoes) data.observacoes = agendamento.observacoes;
    if (agendamento.notasInternas) data.notasInternas = agendamento.notasInternas;

    return data;
  }

  static fromFirestore(id: string, data: any): Agendamento {
    return {
      id,
      companyId: data.companyId,
      origem: data.origem || 'manual',
      solicitadoPor: data.solicitadoPor,
      whatsappMessageId: data.whatsappMessageId,
      clienteId: data.clienteId,
      clienteNome: data.clienteNome,
      clienteTelefone: data.clienteTelefone,
      data: data.data?.toDate() || new Date(),
      horarioInicio: data.horarioInicio || '08:00',
      horarioFim: data.horarioFim || '17:00',
      duracao: data.duracao || 0,
      tipo: data.tipo,
      localDescricao: data.localDescricao || '',
      tonelagem: data.tonelagem,
      valorEstimadoCentavos: data.valorEstimadoCentavos,
      funcionarios: data.funcionarios || [],
      equipamentos: data.equipamentos,
      status: data.status || 'pendente',
      prioridade: data.prioridade || 'normal',
      aprovadoPor: data.aprovadoPor,
      aprovadoEm: data.aprovadoEm?.toDate(),
      rejeitadoPor: data.rejeitadoPor,
      rejeitadoEm: data.rejeitadoEm?.toDate(),
      motivoRejeicao: data.motivoRejeicao,
      reagendadoDe: data.reagendadoDe,
      reagendadoPor: data.reagendadoPor,
      reagendadoEm: data.reagendadoEm?.toDate(),
      motivoReagendamento: data.motivoReagendamento,
      conflitoDetectado: data.conflitoDetectado || false,
      conflitos: data.conflitos || [],
      convertidoEmTrabalho: data.convertidoEmTrabalho || false,
      trabalhoId: data.trabalhoId,
      convertidoEm: data.convertidoEm?.toDate(),
      convertidoPor: data.convertidoPor,
      observacoes: data.observacoes,
      notasInternas: data.notasInternas,
      createdBy: data.createdBy,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      deletedAt: data.deletedAt?.toDate() || null,
      historico: data.historico || [],
    };
  }
}
