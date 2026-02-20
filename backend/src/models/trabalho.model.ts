import { 
  TrabalhoCompleto, 
  TrabalhoSource, 
  TrabalhoStatus,
  TrabalhoPriority,
  calcularStatusTrabalho,
  calcularPrioridadeTrabalho,
  TrabalhoInvariants
} from '../types/trabalho.types';

export class TrabalhoModel {
  static create(data: Partial<TrabalhoCompleto>): TrabalhoCompleto {
    const now = new Date();
    
    // Calcular status baseado em regras
    const status = calcularStatusTrabalho(data);
    const priority = calcularPrioridadeTrabalho(data);
    
    // Calcular totais financeiros
    const totalPagoCentavos = data.totalPagoCentavos || 0;
    const lucroCentavos = (data.valorRecebidoCentavos || 0) - totalPagoCentavos;

    const trabalho: TrabalhoCompleto = {
      id: data.id || '',
      companyId: data.companyId || '',
      source: data.source || 'manual',
      status,
      priority,
      clienteId: data.clienteId,
      clienteNome: data.clienteNome || '',
      localDescricao: data.localDescricao || '',
      tipo: data.tipo || 'descarga',
      tonelagemPrevista: data.tonelagemPrevista || 0,
      tonelagemRealizada: data.tonelagemRealizada || 0,
      scheduledAt: data.scheduledAt,
      startedAt: data.startedAt,
      finishedAt: data.finishedAt,
      slaDueAt: data.slaDueAt,
      assignees: data.assignees || [],
      registrosPresenca: data.registrosPresenca || [],
      pausas: data.pausas || [],
      valorRecebidoCentavos: data.valorRecebidoCentavos || 0,
      totalPagoCentavos,
      lucroCentavos,
      historico: data.historico || [],
      observacoes: data.observacoes,
      createdBy: data.createdBy || '',
      createdAt: data.createdAt || now,
      updatedAt: data.updatedAt || now,
      deletedAt: data.deletedAt || null,
    };

    // Validar invariantes
    this.validateInvariants(trabalho);

    return trabalho;
  }

  static validateInvariants(trabalho: TrabalhoCompleto): void {
    const errors: string[] = [];

    Object.entries(TrabalhoInvariants).forEach(([name, validator]) => {
      if (!validator(trabalho)) {
        errors.push(`Invariante violada: ${name}`);
      }
    });

    if (errors.length > 0) {
      throw new Error(`Invariantes violadas:\n${errors.join('\n')}`);
    }
  }

  static validate(trabalho: Partial<TrabalhoCompleto>): string[] {
    const errors: string[] = [];

    if (!trabalho.companyId) {
      errors.push('CompanyId é obrigatório');
    }

    if (!trabalho.clienteNome) {
      errors.push('Nome do cliente é obrigatório');
    }

    if (!trabalho.localDescricao) {
      errors.push('Descrição do local é obrigatória');
    }

    if (!trabalho.tipo || !['carga', 'descarga'].includes(trabalho.tipo)) {
      errors.push('Tipo inválido (deve ser carga ou descarga)');
    }

    if (trabalho.tonelagemPrevista === undefined || trabalho.tonelagemPrevista === null) {
      errors.push('Tonelagem prevista é obrigatória');
    } else if (trabalho.tonelagemPrevista <= 0) {
      errors.push('Tonelagem prevista deve ser maior que zero');
    }

    if (trabalho.valorRecebidoCentavos === undefined || trabalho.valorRecebidoCentavos === null) {
      errors.push('Valor recebido é obrigatório');
    } else if (trabalho.valorRecebidoCentavos < 0) {
      errors.push('Valor recebido não pode ser negativo');
    }

    if (!trabalho.createdBy) {
      errors.push('CreatedBy é obrigatório');
    }

    return errors;
  }

  static toFirestore(trabalho: TrabalhoCompleto): Record<string, any> {
    return {
      companyId: trabalho.companyId,
      source: trabalho.source,
      status: trabalho.status,
      priority: trabalho.priority,
      clienteId: trabalho.clienteId || null,
      clienteNome: trabalho.clienteNome,
      localDescricao: trabalho.localDescricao,
      tipo: trabalho.tipo,
      tonelagemPrevista: trabalho.tonelagemPrevista,
      tonelagemRealizada: trabalho.tonelagemRealizada,
      scheduledAt: trabalho.scheduledAt || null,
      startedAt: trabalho.startedAt || null,
      finishedAt: trabalho.finishedAt || null,
      slaDueAt: trabalho.slaDueAt || null,
      assignees: trabalho.assignees,
      registrosPresenca: trabalho.registrosPresenca,
      pausas: trabalho.pausas,
      valorRecebidoCentavos: trabalho.valorRecebidoCentavos,
      totalPagoCentavos: trabalho.totalPagoCentavos,
      lucroCentavos: trabalho.lucroCentavos,
      historico: trabalho.historico,
      observacoes: trabalho.observacoes || null,
      createdBy: trabalho.createdBy,
      createdAt: trabalho.createdAt,
      updatedAt: trabalho.updatedAt,
      deletedAt: trabalho.deletedAt,
    };
  }

  static fromFirestore(id: string, data: any): TrabalhoCompleto {
    const trabalho: TrabalhoCompleto = {
      id,
      companyId: data.companyId,
      source: data.source || 'manual',
      status: data.status,
      priority: data.priority || 'normal',
      clienteId: data.clienteId,
      clienteNome: data.clienteNome || '',
      localDescricao: data.localDescricao || '',
      tipo: data.tipo,
      tonelagemPrevista: data.tonelagemPrevista || data.tonelagem || 0, // Compatibilidade
      tonelagemRealizada: data.tonelagemRealizada || 0,
      scheduledAt: data.scheduledAt?.toDate(),
      startedAt: data.startedAt?.toDate(),
      finishedAt: data.finishedAt?.toDate(),
      slaDueAt: data.slaDueAt?.toDate(),
      assignees: data.assignees || [],
      registrosPresenca: data.registrosPresenca || [],
      pausas: data.pausas || [],
      valorRecebidoCentavos: data.valorRecebidoCentavos || 0,
      totalPagoCentavos: data.totalPagoCentavos || 0,
      lucroCentavos: data.lucroCentavos || 0,
      historico: data.historico || [],
      observacoes: data.observacoes,
      createdBy: data.createdBy,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      deletedAt: data.deletedAt?.toDate() || null,
    };

    // Recalcular status se necessário
    trabalho.status = calcularStatusTrabalho(trabalho);
    trabalho.priority = calcularPrioridadeTrabalho(trabalho);

    return trabalho;
  }
}
