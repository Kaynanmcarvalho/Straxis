import { FirestoreService } from './firestore.service';
import { Agendamento, Trabalho } from '../types';
import { TrabalhoModel } from '../models/trabalho.model';
import { AgendamentoModel } from '../models/agendamento.model';

export class AgendamentoConversaoService {
  /**
   * Converte agendamento aprovado em trabalho
   */
  static async converterEmTrabalho(
    companyId: string,
    agendamentoId: string,
    userId: string
  ): Promise<{ trabalho: Trabalho; agendamento: Agendamento }> {
    // 1. Buscar agendamento
    const agendamento = await FirestoreService.getSubcollectionDoc<Agendamento>(
      'companies',
      companyId,
      'agendamentos',
      agendamentoId
    );

    if (!agendamento) {
      throw new Error('Agendamento não encontrado');
    }

    // 2. Validar estado
    if (agendamento.status !== 'aprovado') {
      throw new Error(`Agendamento deve estar aprovado para conversão. Status atual: ${agendamento.status}`);
    }

    if (agendamento.convertidoEmTrabalho) {
      throw new Error('Agendamento já foi convertido em trabalho');
    }

    // 3. Criar trabalho com dados do agendamento
    const trabalhoData: Partial<Trabalho> = {
      companyId,
      source: 'agenda_approved',
      status: 'agendado',
      priority: agendamento.prioridade === 'critica' ? 'critica' : 
                agendamento.prioridade === 'alta' ? 'alta' : 'normal',
      clienteId: agendamento.clienteId,
      clienteNome: agendamento.clienteNome,
      localDescricao: agendamento.localDescricao,
      tipo: agendamento.tipo,
      tonelagemPrevista: agendamento.tonelagem,
      tonelagemRealizada: 0,
      scheduledAt: this.combinarDataHorario(agendamento.data, agendamento.horarioInicio),
      assignees: agendamento.funcionarios,
      registrosPresenca: [],
      pausas: [],
      valorRecebidoCentavos: agendamento.valorEstimadoCentavos,
      totalPagoCentavos: 0,
      lucroCentavos: agendamento.valorEstimadoCentavos,
      historico: [{
        timestamp: new Date(),
        userId,
        acao: 'criado_de_agendamento',
        detalhes: `Trabalho criado a partir do agendamento ${agendamentoId}`,
        statusAnterior: undefined,
        statusNovo: 'agendado'
      }],
      observacoes: agendamento.observacoes,
      createdBy: userId,
    };

    const trabalho = TrabalhoModel.create(trabalhoData);

    // 4. Salvar trabalho
    const trabalhoId = await FirestoreService.createSubcollectionDoc(
      'companies',
      companyId,
      'trabalhos',
      TrabalhoModel.toFirestore(trabalho)
    );

    // 5. Atualizar agendamento
    const agendamentoAtualizado = AgendamentoModel.addHistorico(
      agendamento,
      userId,
      'convertido',
      `Convertido em trabalho ${trabalhoId}`
    );

    await FirestoreService.updateSubcollectionDoc(
      'companies',
      companyId,
      'agendamentos',
      agendamentoId,
      {
        status: 'convertido',
        convertidoEmTrabalho: true,
        trabalhoId,
        convertidoEm: new Date(),
        convertidoPor: userId,
        updatedAt: new Date(),
        historico: agendamentoAtualizado.historico
      }
    );

    return {
      trabalho: { ...trabalho, id: trabalhoId },
      agendamento: {
        ...agendamentoAtualizado,
        status: 'convertido',
        convertidoEmTrabalho: true,
        trabalhoId,
        convertidoEm: new Date(),
        convertidoPor: userId
      }
    };
  }

  /**
   * Combina data e horário em um Date
   */
  private static combinarDataHorario(data: Date, horario: string): string {
    const [hora, minuto] = horario.split(':').map(Number);
    const dataCompleta = new Date(data);
    dataCompleta.setHours(hora, minuto, 0, 0);
    return dataCompleta.toISOString();
  }

  /**
   * Verifica se agendamento pode ser convertido
   */
  static async podeConverter(
    companyId: string,
    agendamentoId: string
  ): Promise<{ pode: boolean; motivo?: string }> {
    const agendamento = await FirestoreService.getSubcollectionDoc<Agendamento>(
      'companies',
      companyId,
      'agendamentos',
      agendamentoId
    );

    if (!agendamento) {
      return { pode: false, motivo: 'Agendamento não encontrado' };
    }

    if (agendamento.status !== 'aprovado') {
      return { pode: false, motivo: 'Agendamento não está aprovado' };
    }

    if (agendamento.convertidoEmTrabalho) {
      return { pode: false, motivo: 'Agendamento já foi convertido' };
    }

    if (agendamento.deletedAt) {
      return { pode: false, motivo: 'Agendamento foi deletado' };
    }

    return { pode: true };
  }
}
