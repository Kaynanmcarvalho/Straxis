import { Agendamento } from '../types';

export class AgendamentoModel {
  static create(data: Partial<Agendamento>): Agendamento {
    const now = new Date();
    return {
      id: data.id || '',
      companyId: data.companyId || '',
      data: data.data || now,
      tipo: data.tipo || 'carga',
      tonelagem: data.tonelagem || 0,
      valorEstimadoCentavos: data.valorEstimadoCentavos || 0,
      funcionarios: data.funcionarios || [],
      status: data.status || 'pendente',
      observacoes: data.observacoes,
      createdBy: data.createdBy || '',
      createdAt: data.createdAt || now,
      updatedAt: data.updatedAt || now,
      deletedAt: data.deletedAt || null,
    };
  }

  static validate(agendamento: Partial<Agendamento>): string[] {
    const errors: string[] = [];

    if (!agendamento.companyId) {
      errors.push('CompanyId é obrigatório');
    }

    if (!agendamento.data) {
      errors.push('Data é obrigatória');
    }

    if (!agendamento.tipo || !['carga', 'descarga'].includes(agendamento.tipo)) {
      errors.push('Tipo inválido (deve ser carga ou descarga)');
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

    if (!agendamento.createdBy) {
      errors.push('CreatedBy é obrigatório');
    }

    return errors;
  }

  static toFirestore(agendamento: Agendamento): Record<string, any> {
    return {
      companyId: agendamento.companyId,
      data: agendamento.data,
      tipo: agendamento.tipo,
      tonelagem: agendamento.tonelagem,
      valorEstimadoCentavos: agendamento.valorEstimadoCentavos,
      funcionarios: agendamento.funcionarios,
      status: agendamento.status,
      observacoes: agendamento.observacoes,
      createdBy: agendamento.createdBy,
      createdAt: agendamento.createdAt,
      updatedAt: agendamento.updatedAt,
      deletedAt: agendamento.deletedAt,
    };
  }

  static fromFirestore(id: string, data: any): Agendamento {
    return {
      id,
      companyId: data.companyId,
      data: data.data?.toDate() || new Date(),
      tipo: data.tipo,
      tonelagem: data.tonelagem,
      valorEstimadoCentavos: data.valorEstimadoCentavos,
      funcionarios: data.funcionarios || [],
      status: data.status,
      observacoes: data.observacoes,
      createdBy: data.createdBy,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      deletedAt: data.deletedAt?.toDate() || null,
    };
  }
}
