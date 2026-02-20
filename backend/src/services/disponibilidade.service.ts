import { FirestoreService } from './firestore.service';
import { Agendamento, AgendamentoConflito, Company } from '../types';

export class DisponibilidadeService {
  /**
   * Verifica disponibilidade para um novo agendamento
   */
  static async verificarDisponibilidade(
    companyId: string,
    data: Date,
    horarioInicio: string,
    horarioFim: string,
    tonelagem: number,
    agendamentoIdExcluir?: string
  ): Promise<{
    disponivel: boolean;
    conflitos: AgendamentoConflito[];
    capacidadeDisponivel: number;
  }> {
    const conflitos: AgendamentoConflito[] = [];

    // 1. Buscar agendamentos do mesmo dia
    const agendamentosDia = await this.buscarAgendamentosDia(companyId, data, agendamentoIdExcluir);

    // 2. Verificar conflitos de horário
    const conflitosHorario = this.verificarConflitosHorario(
      agendamentosDia,
      horarioInicio,
      horarioFim
    );
    conflitos.push(...conflitosHorario);

    // 3. Verificar capacidade de tonelagem
    const conflitoCapacidade = await this.verificarCapacidadeTonelagem(
      companyId,
      agendamentosDia,
      tonelagem,
      horarioInicio,
      horarioFim
    );
    if (conflitoCapacidade) {
      conflitos.push(conflitoCapacidade);
    }

    // 4. Verificar horário de expediente
    const conflitoExpediente = await this.verificarHorarioExpediente(
      companyId,
      data,
      horarioInicio,
      horarioFim
    );
    if (conflitoExpediente) {
      conflitos.push(conflitoExpediente);
    }

    // 5. Verificar feriados
    const conflitoFeriado = await this.verificarFeriado(companyId, data);
    if (conflitoFeriado) {
      conflitos.push(conflitoFeriado);
    }

    // Calcular capacidade disponível
    const capacidadeTotal = await this.obterCapacidadeTotal(companyId);
    const capacidadeUsada = agendamentosDia
      .filter(ag => this.horariosSeIntersectam(
        ag.horarioInicio,
        ag.horarioFim,
        horarioInicio,
        horarioFim
      ))
      .reduce((sum, ag) => sum + ag.tonelagem, 0);
    
    const capacidadeDisponivel = capacidadeTotal - capacidadeUsada;

    return {
      disponivel: conflitos.length === 0,
      conflitos,
      capacidadeDisponivel
    };
  }

  /**
   * Busca agendamentos de um dia específico
   */
  private static async buscarAgendamentosDia(
    companyId: string,
    data: Date,
    excluirId?: string
  ): Promise<Agendamento[]> {
    const inicioDia = new Date(data);
    inicioDia.setHours(0, 0, 0, 0);
    
    const fimDia = new Date(data);
    fimDia.setHours(23, 59, 59, 999);

    const agendamentos = await FirestoreService.querySubcollection<Agendamento>(
      'companies',
      companyId,
      'agendamentos',
      [
        { field: 'deletedAt', operator: '==', value: null },
        { field: 'status', operator: 'in', value: ['pendente', 'aprovado', 'solicitado'] }
      ]
    );

    return agendamentos.filter(ag => {
      if (excluirId && ag.id === excluirId) return false;
      const agData = new Date(ag.data);
      return agData >= inicioDia && agData <= fimDia;
    });
  }

  /**
   * Verifica conflitos de horário
   */
  private static verificarConflitosHorario(
    agendamentos: Agendamento[],
    horarioInicio: string,
    horarioFim: string
  ): AgendamentoConflito[] {
    const conflitos: AgendamentoConflito[] = [];

    for (const ag of agendamentos) {
      if (this.horariosSeIntersectam(ag.horarioInicio, ag.horarioFim, horarioInicio, horarioFim)) {
        conflitos.push({
          agendamentoId: ag.id,
          tipo: 'horario',
          descricao: `Conflito de horário com agendamento ${ag.clienteNome} (${ag.horarioInicio}-${ag.horarioFim})`,
          severidade: 'alta'
        });
      }
    }

    return conflitos;
  }

  /**
   * Verifica se dois horários se intersectam
   */
  private static horariosSeIntersectam(
    inicio1: string,
    fim1: string,
    inicio2: string,
    fim2: string
  ): boolean {
    const [h1i, m1i] = inicio1.split(':').map(Number);
    const [h1f, m1f] = fim1.split(':').map(Number);
    const [h2i, m2i] = inicio2.split(':').map(Number);
    const [h2f, m2f] = fim2.split(':').map(Number);

    const min1i = h1i * 60 + m1i;
    const min1f = h1f * 60 + m1f;
    const min2i = h2i * 60 + m2i;
    const min2f = h2f * 60 + m2f;

    return !(min1f <= min2i || min2f <= min1i);
  }

  /**
   * Verifica capacidade de tonelagem
   */
  private static async verificarCapacidadeTonelagem(
    companyId: string,
    agendamentos: Agendamento[],
    tonelagem: number,
    horarioInicio: string,
    horarioFim: string
  ): Promise<AgendamentoConflito | null> {
    const capacidadeTotal = await this.obterCapacidadeTotal(companyId);

    const tonelagemSimultanea = agendamentos
      .filter(ag => this.horariosSeIntersectam(
        ag.horarioInicio,
        ag.horarioFim,
        horarioInicio,
        horarioFim
      ))
      .reduce((sum, ag) => sum + ag.tonelagem, 0);

    if (tonelagemSimultanea + tonelagem > capacidadeTotal) {
      return {
        agendamentoId: '',
        tipo: 'capacidade',
        descricao: `Capacidade excedida: ${tonelagemSimultanea + tonelagem}t / ${capacidadeTotal}t`,
        severidade: 'alta'
      };
    }

    return null;
  }

  /**
   * Verifica horário de expediente
   */
  private static async verificarHorarioExpediente(
    companyId: string,
    data: Date,
    horarioInicio: string,
    horarioFim: string
  ): Promise<AgendamentoConflito | null> {
    const company = await FirestoreService.getById<Company>('companies', companyId);
    
    if (!company?.config?.horarioExpediente) {
      return null; // Sem restrição configurada
    }

    const { inicio, fim } = company.config.horarioExpediente;
    const diaSemana = data.getDay();

    // Verificar se é dia útil (0 = domingo, 6 = sábado)
    if (diaSemana === 0 || diaSemana === 6) {
      return {
        agendamentoId: '',
        tipo: 'horario',
        descricao: 'Agendamento fora do expediente (fim de semana)',
        severidade: 'media'
      };
    }

    // Verificar horários
    if (horarioInicio < inicio || horarioFim > fim) {
      return {
        agendamentoId: '',
        tipo: 'horario',
        descricao: `Agendamento fora do expediente (${inicio}-${fim})`,
        severidade: 'media'
      };
    }

    return null;
  }

  /**
   * Verifica se é feriado
   */
  private static async verificarFeriado(
    companyId: string,
    data: Date
  ): Promise<AgendamentoConflito | null> {
    const company = await FirestoreService.getById<Company>('companies', companyId);
    
    if (!company?.config?.feriados) {
      return null;
    }

    const dataStr = data.toISOString().split('T')[0];
    const feriado = company.config.feriados.find(f => f.data === dataStr);

    if (feriado) {
      return {
        agendamentoId: '',
        tipo: 'horario',
        descricao: `Feriado: ${feriado.nome}`,
        severidade: 'alta'
      };
    }

    return null;
  }

  /**
   * Obtém capacidade total da empresa
   */
  private static async obterCapacidadeTotal(companyId: string): Promise<number> {
    const company = await FirestoreService.getById<Company>('companies', companyId);
    return company?.config?.capacidadeTonelagemDia || 100; // Default 100t
  }

  /**
   * Detecta cliente duplicado no mesmo dia
   */
  static async verificarClienteDuplicado(
    companyId: string,
    clienteId: string,
    data: Date,
    agendamentoIdExcluir?: string
  ): Promise<AgendamentoConflito | null> {
    const agendamentosDia = await this.buscarAgendamentosDia(companyId, data, agendamentoIdExcluir);

    const duplicado = agendamentosDia.find(ag => ag.clienteId === clienteId);

    if (duplicado) {
      return {
        agendamentoId: duplicado.id,
        tipo: 'cliente_duplicado',
        descricao: `Cliente já possui agendamento neste dia (${duplicado.horarioInicio})`,
        severidade: 'baixa'
      };
    }

    return null;
  }
}
