import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Minus,
  Play,
  Pause,
  Square,
  CheckCircle2,
  Users,
  MapPin,
  Truck,
  Weight,
  UserCheck,
  UserX,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Dock } from '../components/core/Dock';
import { AutocompleteCliente } from '../components/common/AutocompleteCliente';
import { trabalhoService } from '../services/trabalho.service';
import './TrabalhosPageCore.css';

interface Funcionario {
  id: string;
  nome: string;
  presente: boolean;
}

interface RegistroPresenca {
  funcionarioId: string;
  tipo: 'presente_integral' | 'meia_diaria' | 'falta_total' | 'atraso' | 'saida_antecipada';
  horarioEntrada?: string;
  horarioSaida?: string;
  observacao?: string;
  registradoEm: Date;
}

interface HistoricoAlteracao {
  id: string;
  tipo: 'tonelagem_ajuste' | 'tonelagem_total' | 'equipe_add' | 'equipe_remove' | 'status_change' | 'presenca_change';
  campo: string;
  valorAnterior: string;
  valorNovo: string;
  usuario: string;
  timestamp: Date;
}

interface Pausa {
  inicio: Date;
  fim?: Date;
  motivo: string;
}

// Interface local para trabalhos operacionais (diferente do Firebase)
interface TrabalhoLocal {
  id: string;
  tipo: 'carga' | 'descarga';
  cliente: string;
  local: string;
  toneladas: number;
  toneladasParciais: number;
  status: 'planejado' | 'em_execucao' | 'pausado' | 'finalizado' | 'cancelado';
  funcionarios: Funcionario[];
  registrosPresenca: RegistroPresenca[];
  historico: HistoricoAlteracao[];
  pausas?: Pausa[];
  dataInicio?: Date;
  dataFim?: Date;
}

const TrabalhosPageCore: React.FC = () => {
  const [trabalhos, setTrabalhos] = useState<TrabalhoLocal[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [trabalhoParaFinalizar, setTrabalhoParaFinalizar] = useState<string | null>(null);
  const [feedbackSalvo, setFeedbackSalvo] = useState<{ [key: string]: boolean }>({});
  const [ultimaAcao, setUltimaAcao] = useState<{ tipo: string; dados: Record<string, unknown> } | null>(null);
  const [editandoTonelagem, setEditandoTonelagem] = useState<string | null>(null);
  const [valorTonelagemTemp, setValorTonelagemTemp] = useState<string>('');
  const [mostrarNovoTrabalho, setMostrarNovoTrabalho] = useState(false);
  const [mostrarSeletorEquipe, setMostrarSeletorEquipe] = useState<string | null>(null);
  const [mostrarModalPresenca, setMostrarModalPresenca] = useState<{ trabalhoId: string; funcionarioId: string } | null>(null);
  const [mostrarHistorico, setMostrarHistorico] = useState<string | null>(null);
  const [touchTimer, setTouchTimer] = useState<NodeJS.Timeout | null>(null);
  const [novoTrabalho, setNovoTrabalho] = useState({
    cliente: '',
    tipo: 'descarga' as 'carga' | 'descarga',
    local: '',
    toneladas: '',
  });
  const [registroPresencaTemp, setRegistroPresencaTemp] = useState<{
    tipo: 'presente_integral' | 'meia_diaria' | 'falta_total' | 'atraso' | 'saida_antecipada';
    horarioEntrada: string;
    horarioSaida: string;
    observacao: string;
  }>({
    tipo: 'presente_integral',
    horarioEntrada: '08:00',
    horarioSaida: '17:00',
    observacao: '',
  });

  // Funcionários disponíveis - carregar do Firebase
  const [funcionariosDisponiveis] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Carregar trabalhos do Firebase
  useEffect(() => {
    loadTrabalhos();
  }, []);

  const loadTrabalhos = async () => {
    try {
      setLoading(true);
      const data = await trabalhoService.list();
      
      // Converter trabalhos do Firebase para formato local
      const trabalhosLocais: TrabalhoLocal[] = data.map(t => ({
        id: t.id,
        tipo: t.tipo,
        cliente: '', // TODO: adicionar campo cliente no backend
        local: '', // TODO: adicionar campo local no backend
        toneladas: t.tonelagem,
        toneladasParciais: 0, // TODO: adicionar campo no backend
        status: 'planejado', // TODO: adicionar campo status no backend
        funcionarios: [], // TODO: mapear de t.funcionarios
        registrosPresenca: [],
        historico: [],
        pausas: [],
      }));
      
      setTrabalhos(trabalhosLocais);
    } catch (error) {
      console.error('Erro ao carregar trabalhos:', error);
      alert('Erro ao carregar trabalhos');
    } finally {
      setLoading(false);
    }
  };

  // Função para adicionar entrada no histórico
  const adicionarHistorico = (
    trabalhoId: string,
    tipo: HistoricoAlteracao['tipo'],
    campo: string,
    valorAnterior: string,
    valorNovo: string
  ) => {
    const novaEntrada: HistoricoAlteracao = {
      id: Date.now().toString(),
      tipo,
      campo,
      valorAnterior,
      valorNovo,
      usuario: 'Dono', // TODO: pegar do contexto de autenticação
      timestamp: new Date(),
    };

    setTrabalhos(prev => prev.map(t =>
      t.id === trabalhoId
        ? { ...t, historico: [...t.historico, novaEntrada] }
        : t
    ));
  };

  // Função para verificar conflito de recursos
  const verificarConflitoRecursos = (trabalhoId: string, funcionarioId: string): string | null => {
    const trabalhoConflitante = trabalhos.find(t =>
      t.id !== trabalhoId &&
      t.status === 'em_execucao' &&
      t.funcionarios.some(f => f.id === funcionarioId)
    );

    if (trabalhoConflitante) {
      return trabalhoConflitante.cliente;
    }

    return null;
  };

  const trabalhosAtivos = trabalhos.filter(t => t.status === 'em_execucao');
  const trabalhosPlanejados = trabalhos.filter(t => t.status === 'planejado');
  const trabalhosFinalizados = trabalhos.filter(t => t.status === 'finalizado');

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const mostrarFeedbackSalvo = (id: string) => {
    setFeedbackSalvo(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setFeedbackSalvo(prev => ({ ...prev, [id]: false }));
    }, 2000);
  };

  const ajustarToneladas = (id: string, delta: number) => {
    const trabalhoAnterior = trabalhos.find(t => t.id === id);
    if (!trabalhoAnterior) return;

    const novoValor = trabalhoAnterior.toneladasParciais + delta;
    
    // Impedir valores negativos
    if (novoValor < 0) return;
    
    // Impedir ultrapassar tonelagem total
    if (novoValor > trabalhoAnterior.toneladas) return;

    // Registrar no histórico
    adicionarHistorico(
      id,
      'tonelagem_ajuste',
      'Tonelagem Parcial',
      `${trabalhoAnterior.toneladasParciais.toFixed(1)}t`,
      `${novoValor.toFixed(1)}t`
    );

    setUltimaAcao({
      tipo: 'toneladas',
      dados: { id, valorAnterior: trabalhoAnterior.toneladasParciais }
    });

    // Auto-limpar após 5 segundos
    setTimeout(() => {
      setUltimaAcao(null);
    }, 5000);

    setTrabalhos(prev => prev.map(t => 
      t.id === id 
        ? { ...t, toneladasParciais: novoValor }
        : t
    ));
    
    mostrarFeedbackSalvo(id);
  };

  const iniciarEdicaoTonelagem = (id: string, valorAtual: number) => {
    setEditandoTonelagem(id);
    setValorTonelagemTemp(valorAtual.toString());
  };

  const salvarEdicaoTonelagem = (id: string) => {
    const trabalho = trabalhos.find(t => t.id === id);
    if (!trabalho) return;

    const novoValor = parseFloat(valorTonelagemTemp);
    
    // Validações
    if (isNaN(novoValor) || novoValor <= 0) {
      alert('⚠️ Valor inválido');
      setEditandoTonelagem(null);
      return;
    }

    // Não permitir valor menor que já descarregado
    if (novoValor < trabalho.toneladasParciais) {
      alert(`⚠️ Valor não pode ser menor que já descarregado (${trabalho.toneladasParciais.toFixed(1)}t)`);
      setEditandoTonelagem(null);
      return;
    }

    // Registrar no histórico
    adicionarHistorico(
      id,
      'tonelagem_total',
      'Tonelagem Total',
      `${trabalho.toneladas.toFixed(1)}t`,
      `${novoValor.toFixed(1)}t`
    );

    setUltimaAcao({
      tipo: 'tonelagem_total',
      dados: { id, valorAnterior: trabalho.toneladas }
    });

    // Auto-limpar após 5 segundos
    setTimeout(() => {
      setUltimaAcao(null);
    }, 5000);

    setTrabalhos(prev => prev.map(t => 
      t.id === id 
        ? { ...t, toneladas: novoValor }
        : t
    ));

    setEditandoTonelagem(null);
    mostrarFeedbackSalvo(id);
  };

  const cancelarEdicaoTonelagem = () => {
    setEditandoTonelagem(null);
    setValorTonelagemTemp('');
  };

  const adicionarFuncionario = (trabalhoId: string, funcionario: Funcionario) => {
    // Verificar conflito de recursos
    const clienteConflitante = verificarConflitoRecursos(trabalhoId, funcionario.id);
    
    if (clienteConflitante) {
      const confirmar = window.confirm(
        `⚠️ CONFLITO DE RECURSOS\n\n${funcionario.nome} já está alocado em:\n"${clienteConflitante}"\n\nDeseja realocar para este trabalho?`
      );
      
      if (!confirmar) return;
      
      // Remover de outros trabalhos ativos
      setTrabalhos(prev => prev.map(t => {
        if (t.status === 'em_execucao' && t.id !== trabalhoId) {
          const funcExiste = t.funcionarios.some(f => f.id === funcionario.id);
          if (funcExiste) {
            // Registrar remoção no histórico
            adicionarHistorico(
              t.id,
              'equipe_remove',
              'Equipe',
              funcionario.nome,
              `Realocado para outro trabalho`
            );
            
            return {
              ...t,
              funcionarios: t.funcionarios.filter(f => f.id !== funcionario.id)
            };
          }
        }
        return t;
      }));
    }

    setTrabalhos(prev => prev.map(t => {
      if (t.id === trabalhoId) {
        // Verificar se já existe
        const jaExiste = t.funcionarios.some(f => f.id === funcionario.id);
        if (jaExiste) return t;
        
        // Registrar no histórico
        adicionarHistorico(
          trabalhoId,
          'equipe_add',
          'Equipe',
          '-',
          funcionario.nome
        );
        
        return {
          ...t,
          funcionarios: [...t.funcionarios, { ...funcionario, presente: false }]
        };
      }
      return t;
    }));
  };

  const removerFuncionario = (trabalhoId: string, funcId: string) => {
    const trabalho = trabalhos.find(t => t.id === trabalhoId);
    const funcionario = trabalho?.funcionarios.find(f => f.id === funcId);
    
    if (!funcionario) return;

    // Registrar no histórico
    adicionarHistorico(
      trabalhoId,
      'equipe_remove',
      'Equipe',
      funcionario.nome,
      'Removido'
    );

    setTrabalhos(prev => prev.map(t => 
      t.id === trabalhoId 
        ? {
            ...t,
            funcionarios: t.funcionarios.filter(f => f.id !== funcId)
          }
        : t
    ));
  };

  const handleTouchStart = (id: string, valor: number) => {
    const timer = setTimeout(() => {
      iniciarEdicaoTonelagem(id, valor);
    }, 500); // 500ms = toque longo
    setTouchTimer(timer);
  };

  const handleTouchEnd = () => {
    if (touchTimer) {
      clearTimeout(touchTimer);
      setTouchTimer(null);
    }
  };

  const togglePresenca = (trabalhoId: string, funcId: string) => {
    // Abrir modal de registro detalhado
    setMostrarModalPresenca({ trabalhoId, funcionarioId: funcId });
    
    // Pré-preencher com horário padrão
    setRegistroPresencaTemp({
      tipo: 'presente_integral',
      horarioEntrada: '08:00',
      horarioSaida: '17:00',
      observacao: '',
    });
  };

  const salvarRegistroPresenca = () => {
    if (!mostrarModalPresenca) return;

    const { trabalhoId, funcionarioId } = mostrarModalPresenca;
    const trabalho = trabalhos.find(t => t.id === trabalhoId);
    const funcionario = trabalho?.funcionarios.find(f => f.id === funcionarioId);
    
    if (!trabalho || !funcionario) return;

    const novoRegistro: RegistroPresenca = {
      funcionarioId,
      tipo: registroPresencaTemp.tipo,
      horarioEntrada: registroPresencaTemp.tipo !== 'falta_total' ? registroPresencaTemp.horarioEntrada : undefined,
      horarioSaida: registroPresencaTemp.tipo !== 'falta_total' ? registroPresencaTemp.horarioSaida : undefined,
      observacao: registroPresencaTemp.observacao || undefined,
      registradoEm: new Date(),
    };

    // Atualizar estado de presença
    const presente = registroPresencaTemp.tipo !== 'falta_total';

    // Registrar no histórico
    const tipoTexto = {
      'presente_integral': 'Presente (dia inteiro)',
      'meia_diaria': `Meia diária (${registroPresencaTemp.horarioEntrada} - ${registroPresencaTemp.horarioSaida})`,
      'falta_total': 'Falta total',
      'atraso': `Atraso (entrada: ${registroPresencaTemp.horarioEntrada})`,
      'saida_antecipada': `Saída antecipada (${registroPresencaTemp.horarioSaida})`,
    };

    adicionarHistorico(
      trabalhoId,
      'presenca_change',
      `Presença - ${funcionario.nome}`,
      funcionario.presente ? 'Presente' : 'Ausente',
      tipoTexto[registroPresencaTemp.tipo]
    );

    setTrabalhos(prev => prev.map(t => 
      t.id === trabalhoId 
        ? {
            ...t,
            funcionarios: t.funcionarios.map(f =>
              f.id === funcionarioId ? { ...f, presente } : f
            ),
            registrosPresenca: [...t.registrosPresenca, novoRegistro]
          }
        : t
    ));

    setMostrarModalPresenca(null);
    mostrarFeedbackSalvo(trabalhoId);
  };

  const pausarTrabalho = (id: string) => {
    const motivo = prompt('Motivo da pausa:', 'Almoço do cliente');
    if (!motivo) return;

    adicionarHistorico(
      id,
      'status_change',
      'Status',
      'Em execução',
      `Pausado (${motivo})`
    );

    setTrabalhos(prev => prev.map(t =>
      t.id === id
        ? {
            ...t,
            status: 'pausado' as const,
            pausas: [
              ...(t.pausas || []),
              { inicio: new Date(), motivo }
            ]
          }
        : t
    ));

    mostrarFeedbackSalvo(id);
  };

  const retomarTrabalho = (id: string) => {
    adicionarHistorico(
      id,
      'status_change',
      'Status',
      'Pausado',
      'Em execução'
    );

    setTrabalhos(prev => prev.map(t => {
      if (t.id === id && t.pausas && t.pausas.length > 0) {
        const pausasAtualizadas = [...t.pausas];
        const ultimaPausa = pausasAtualizadas[pausasAtualizadas.length - 1];
        if (!ultimaPausa.fim) {
          ultimaPausa.fim = new Date();
        }

        return {
          ...t,
          status: 'em_execucao' as const,
          pausas: pausasAtualizadas
        };
      }
      return t;
    }));

    mostrarFeedbackSalvo(id);
  };

  const validarCapacidade = (toneladasNovas: number): boolean => {
    const CAPACIDADE_TOTAL = 150; // TODO: pegar de configuração
    
    const capacidadeUsada = trabalhos
      .filter(t => t.status !== 'finalizado' && t.status !== 'cancelado')
      .reduce((sum, t) => sum + t.toneladas, 0);
    
    const capacidadeDisponivel = CAPACIDADE_TOTAL - capacidadeUsada;
    
    if (toneladasNovas > capacidadeDisponivel) {
      alert(`⚠️ CAPACIDADE INSUFICIENTE!\n\nDisponível: ${capacidadeDisponivel.toFixed(1)}t\nSolicitado: ${toneladasNovas.toFixed(1)}t\n\nFinalize um trabalho antes de criar outro.`);
      return false;
    }
    
    return true;
  };

  const formatarDataHora = (data: Date): string => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(data);
  };

  const desfazerUltimaAcao = () => {
    if (!ultimaAcao) return;

    if (ultimaAcao.tipo === 'toneladas') {
      const valorAnterior = ultimaAcao.dados.valorAnterior as number;
      const id = ultimaAcao.dados.id as string;
      setTrabalhos(prev => prev.map(t => 
        t.id === id 
          ? { ...t, toneladasParciais: valorAnterior }
          : t
      ));
    } else if (ultimaAcao.tipo === 'tonelagem_total') {
      const valorAnterior = ultimaAcao.dados.valorAnterior as number;
      const id = ultimaAcao.dados.id as string;
      setTrabalhos(prev => prev.map(t => 
        t.id === id 
          ? { ...t, toneladas: valorAnterior }
          : t
      ));
    } else if (ultimaAcao.tipo === 'presenca') {
      const trabalhoId = ultimaAcao.dados.trabalhoId as string;
      const funcId = ultimaAcao.dados.funcId as string;
      const estadoAnterior = ultimaAcao.dados.estadoAnterior as boolean;
      setTrabalhos(prev => prev.map(t => 
        t.id === trabalhoId 
          ? {
              ...t,
              funcionarios: t.funcionarios.map(f =>
                f.id === funcId 
                  ? { ...f, presente: estadoAnterior }
                  : f
              )
            }
          : t
      ));
    }

    setUltimaAcao(null);
  };

  const iniciarTrabalho = (id: string) => {
    setTrabalhos(prev => prev.map(t => 
      t.id === id 
        ? { ...t, status: 'em_execucao', dataInicio: new Date() }
        : t
    ));
  };

  const confirmarFinalizacao = (id: string) => {
    const trabalho = trabalhos.find(t => t.id === id);
    if (!trabalho) return;

    // Validações anti-erro
    const presentes = funcionariosPresentes(trabalho);
    const inconsistencias: string[] = [];

    if (trabalho.toneladasParciais === 0) {
      inconsistencias.push('Nenhuma tonelagem registrada');
    }

    if (presentes === 0) {
      inconsistencias.push('Nenhum funcionário presente');
    }

    if (trabalho.toneladasParciais < trabalho.toneladas * 0.9) {
      inconsistencias.push('Tonelagem abaixo do esperado');
    }

    if (inconsistencias.length > 0) {
      const confirmar = window.confirm(
        `⚠️ ATENÇÃO:\n\n${inconsistencias.join('\n')}\n\nDeseja finalizar mesmo assim?`
      );
      if (!confirmar) return;
    }

    setTrabalhoParaFinalizar(id);
  };

  const finalizarTrabalho = () => {
    if (!trabalhoParaFinalizar) return;
    
    setTrabalhos(prev => prev.map(t => 
      t.id === trabalhoParaFinalizar 
        ? { ...t, status: 'finalizado', dataFim: new Date() }
        : t
    ));
    
    setTrabalhoParaFinalizar(null);
  };

  const cancelarFinalizacao = () => {
    setTrabalhoParaFinalizar(null);
  };

  const funcionariosPresentes = (trabalho: TrabalhoLocal) => 
    trabalho.funcionarios.filter(f => f.presente).length;
  
  const funcionariosFaltaram = (trabalho: TrabalhoLocal) => 
    trabalho.funcionarios.filter(f => !f.presente).length;

  const criarNovoTrabalho = async () => {
    if (!novoTrabalho.cliente || !novoTrabalho.local || !novoTrabalho.toneladas) {
      alert('⚠️ Preencha todos os campos obrigatórios');
      return;
    }

    const toneladas = parseFloat(novoTrabalho.toneladas);
    if (isNaN(toneladas) || toneladas <= 0) {
      alert('⚠️ Tonelagem inválida');
      return;
    }

    // Validar capacidade disponível
    if (!validarCapacidade(toneladas)) {
      return;
    }

    try {
      // Criar trabalho no Firebase
      const trabalhoData = {
        tipo: novoTrabalho.tipo,
        tonelagem: toneladas,
        valorRecebidoCentavos: 0, // TODO: adicionar campo no form
        funcionarios: [],
        totalPagoCentavos: 0,
        lucroCentavos: 0,
        observacoes: `Cliente: ${novoTrabalho.cliente} | Local: ${novoTrabalho.local}`,
      };

      const novoTrabalhoCriado = await trabalhoService.create(trabalhoData);
      
      // Converter para formato local
      const trabalhoLocal: TrabalhoLocal = {
        id: novoTrabalhoCriado.id,
        tipo: novoTrabalhoCriado.tipo,
        cliente: novoTrabalho.cliente,
        local: novoTrabalho.local,
        toneladas: novoTrabalhoCriado.tonelagem,
        toneladasParciais: 0,
        status: 'planejado',
        funcionarios: [],
        registrosPresenca: [],
        historico: [],
        pausas: [],
      };
      
      // Atualizar estado local
      setTrabalhos(prev => [...prev, trabalhoLocal]);
      setMostrarNovoTrabalho(false);
      setNovoTrabalho({
        cliente: '',
        tipo: 'descarga',
        local: '',
        toneladas: '',
      });
      
      alert('✅ Trabalho criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar trabalho:', error);
      alert('❌ Erro ao criar trabalho. Tente novamente.');
    }
  };

  const cancelarNovoTrabalho = () => {
    setMostrarNovoTrabalho(false);
    setNovoTrabalho({
      cliente: '',
      tipo: 'descarga',
      local: '',
      toneladas: '',
    });
  };

  return (
    <>
      <div className="page-container trabalhos-operacional">
        {/* Header Operacional */}
        <header className="operacional-header">
          <div className="operacional-title-group">
            <h1 className="operacional-title">Operações</h1>
            <div className="operacional-counter">
              <span className="counter-number">{trabalhosAtivos.length}</span>
              <span className="counter-label">ativas</span>
            </div>
          </div>
          <button 
            className="btn-novo-trabalho"
            onClick={() => setMostrarNovoTrabalho(true)}
          >
            <Plus className="icon" />
          </button>
        </header>

        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Carregando operações...</p>
          </div>
        )}

        {/* Modal Seletor de Equipe */}
        {mostrarSeletorEquipe && (
          <div className="modal-overlay" onClick={() => setMostrarSeletorEquipe(null)}>
            <div className="modal-seletor-equipe" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-titulo">Adicionar à Equipe</h3>
              </div>
              
              <div className="modal-body">
                <div className="funcionarios-disponiveis">
                  {funcionariosDisponiveis.map((func) => {
                    const trabalho = trabalhos.find(t => t.id === mostrarSeletorEquipe);
                    const jaAdicionado = trabalho?.funcionarios.some(f => f.id === func.id);
                    
                    return (
                      <button
                        key={func.id}
                        className={`funcionario-disponivel ${jaAdicionado ? 'adicionado' : ''}`}
                        onClick={() => {
                          if (!jaAdicionado) {
                            adicionarFuncionario(mostrarSeletorEquipe, func);
                          }
                        }}
                        disabled={jaAdicionado}
                      >
                        <div className="funcionario-avatar-small">
                          {func.nome.charAt(0).toUpperCase()}
                        </div>
                        <span className="funcionario-nome-small">{func.nome}</span>
                        {jaAdicionado && <CheckCircle2 className="icon-check" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  className="btn-modal-fechar" 
                  onClick={() => setMostrarSeletorEquipe(null)}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Registro de Presença */}
        {mostrarModalPresenca && (
          <div className="modal-overlay" onClick={() => setMostrarModalPresenca(null)}>
            <div className="modal-presenca" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-titulo">Registrar Presença</h3>
                <p className="modal-subtitulo">
                  {trabalhos.find(t => t.id === mostrarModalPresenca.trabalhoId)?.funcionarios.find(f => f.id === mostrarModalPresenca.funcionarioId)?.nome}
                </p>
              </div>
              
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Tipo de Presença *</label>
                  <div className="presenca-opcoes">
                    <label className={`presenca-opcao ${registroPresencaTemp.tipo === 'presente_integral' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="tipoPresenca"
                        value="presente_integral"
                        checked={registroPresencaTemp.tipo === 'presente_integral'}
                        onChange={(e) => setRegistroPresencaTemp(prev => ({ ...prev, tipo: e.target.value as RegistroPresenca['tipo'] }))}
                      />
                      <div className="opcao-content">
                        <UserCheck className="icon" />
                        <span>Presente (dia inteiro)</span>
                      </div>
                    </label>

                    <label className={`presenca-opcao ${registroPresencaTemp.tipo === 'meia_diaria' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="tipoPresenca"
                        value="meia_diaria"
                        checked={registroPresencaTemp.tipo === 'meia_diaria'}
                        onChange={(e) => setRegistroPresencaTemp(prev => ({ ...prev, tipo: e.target.value as RegistroPresenca['tipo'] }))}
                      />
                      <div className="opcao-content">
                        <Clock className="icon" />
                        <span>Meia diária</span>
                      </div>
                    </label>

                    <label className={`presenca-opcao ${registroPresencaTemp.tipo === 'atraso' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="tipoPresenca"
                        value="atraso"
                        checked={registroPresencaTemp.tipo === 'atraso'}
                        onChange={(e) => setRegistroPresencaTemp(prev => ({ ...prev, tipo: e.target.value as RegistroPresenca['tipo'] }))}
                      />
                      <div className="opcao-content">
                        <AlertCircle className="icon" />
                        <span>Atraso</span>
                      </div>
                    </label>

                    <label className={`presenca-opcao ${registroPresencaTemp.tipo === 'saida_antecipada' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="tipoPresenca"
                        value="saida_antecipada"
                        checked={registroPresencaTemp.tipo === 'saida_antecipada'}
                        onChange={(e) => setRegistroPresencaTemp(prev => ({ ...prev, tipo: e.target.value as RegistroPresenca['tipo'] }))}
                      />
                      <div className="opcao-content">
                        <ChevronDown className="icon" />
                        <span>Saída antecipada</span>
                      </div>
                    </label>

                    <label className={`presenca-opcao falta ${registroPresencaTemp.tipo === 'falta_total' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="tipoPresenca"
                        value="falta_total"
                        checked={registroPresencaTemp.tipo === 'falta_total'}
                        onChange={(e) => setRegistroPresencaTemp(prev => ({ ...prev, tipo: e.target.value as RegistroPresenca['tipo'] }))}
                      />
                      <div className="opcao-content">
                        <UserX className="icon" />
                        <span>Falta total</span>
                      </div>
                    </label>
                  </div>
                </div>

                {registroPresencaTemp.tipo !== 'falta_total' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Horário de Entrada</label>
                      <input
                        type="time"
                        className="form-input"
                        value={registroPresencaTemp.horarioEntrada}
                        onChange={(e) => setRegistroPresencaTemp(prev => ({ ...prev, horarioEntrada: e.target.value }))}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Horário de Saída</label>
                      <input
                        type="time"
                        className="form-input"
                        value={registroPresencaTemp.horarioSaida}
                        onChange={(e) => setRegistroPresencaTemp(prev => ({ ...prev, horarioSaida: e.target.value }))}
                      />
                    </div>
                  </>
                )}

                <div className="form-group">
                  <label className="form-label">Observação (opcional)</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Ex: Atestado médico, problema pessoal..."
                    rows={3}
                    value={registroPresencaTemp.observacao}
                    onChange={(e) => setRegistroPresencaTemp(prev => ({ ...prev, observacao: e.target.value }))}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  className="btn-modal-cancelar" 
                  onClick={() => setMostrarModalPresenca(null)}
                >
                  Cancelar
                </button>
                <button 
                  className="btn-modal-salvar" 
                  onClick={salvarRegistroPresenca}
                >
                  Salvar Registro
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Histórico */}
        {mostrarHistorico && (
          <div className="modal-overlay" onClick={() => setMostrarHistorico(null)}>
            <div className="modal-historico" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-titulo">Histórico de Alterações</h3>
                <p className="modal-subtitulo">
                  {trabalhos.find(t => t.id === mostrarHistorico)?.cliente}
                </p>
              </div>
              
              <div className="modal-body">
                {(() => {
                  const trabalho = trabalhos.find(t => t.id === mostrarHistorico);
                  if (!trabalho || trabalho.historico.length === 0) {
                    return (
                      <div className="historico-vazio">
                        <p>Nenhuma alteração registrada ainda</p>
                      </div>
                    );
                  }

                  return (
                    <div className="historico-timeline">
                      {trabalho.historico.slice().reverse().map((h) => (
                        <div key={h.id} className="historico-item">
                          <div className="historico-timestamp">
                            {formatarDataHora(h.timestamp)}
                          </div>
                          <div className="historico-content">
                            <div className="historico-tipo">{h.campo}</div>
                            <div className="historico-mudanca">
                              <span className="valor-anterior">{h.valorAnterior}</span>
                              <ChevronRight className="icon-seta" size={16} />
                              <span className="valor-novo">{h.valorNovo}</span>
                            </div>
                            <div className="historico-usuario">por {h.usuario}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              <div className="modal-footer">
                <button 
                  className="btn-modal-fechar" 
                  onClick={() => setMostrarHistorico(null)}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Novo Trabalho */}
        {mostrarNovoTrabalho && (
          <div className="modal-overlay" onClick={cancelarNovoTrabalho}>
            <div className="modal-novo-trabalho" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-titulo">Nova Operação</h3>
                <button 
                  className="modal-close-btn"
                  onClick={cancelarNovoTrabalho}
                  aria-label="Fechar"
                >
                  ×
                </button>
              </div>
              
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Cliente *</label>
                  <AutocompleteCliente
                    value={novoTrabalho.cliente}
                    onChange={(value) => setNovoTrabalho(prev => ({ ...prev, cliente: value }))}
                    placeholder="Nome do cliente"
                    className="form-input"
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tipo *</label>
                  <div className="tipo-selector">
                    <button
                      className={`tipo-option ${novoTrabalho.tipo === 'descarga' ? 'active' : ''}`}
                      onClick={() => setNovoTrabalho(prev => ({ ...prev, tipo: 'descarga' }))}
                    >
                      <Truck className="icon" />
                      <span>Descarga</span>
                    </button>
                    <button
                      className={`tipo-option ${novoTrabalho.tipo === 'carga' ? 'active' : ''}`}
                      onClick={() => setNovoTrabalho(prev => ({ ...prev, tipo: 'carga' }))}
                    >
                      <Truck className="icon" />
                      <span>Carga</span>
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Local *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Galpão, setor, pátio..."
                    value={novoTrabalho.local}
                    onChange={(e) => setNovoTrabalho(prev => ({ ...prev, local: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tonelagem Prevista *</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    className="form-input"
                    placeholder="0.0"
                    value={novoTrabalho.toneladas}
                    onChange={(e) => setNovoTrabalho(prev => ({ ...prev, toneladas: e.target.value }))}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn-modal-cancelar" onClick={cancelarNovoTrabalho}>
                  Cancelar
                </button>
                <button className="btn-modal-criar" onClick={criarNovoTrabalho}>
                  Criar Operação
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Botão Desfazer (Flutuante) */}
        {ultimaAcao && (
          <div className="desfazer-flutuante">
            <span className="desfazer-texto">Alteração salva</span>
            <button 
              className="btn-desfazer"
              onClick={desfazerUltimaAcao}
            >
              Desfazer
            </button>
          </div>
        )}

        {/* TRABALHOS EM EXECUÇÃO - PRIORIDADE MÁXIMA */}
        {trabalhosAtivos.length > 0 && (
          <section className="secao-trabalhos-ativos">
            <h2 className="secao-titulo">Em Execução</h2>
            <div className="trabalhos-ativos-grid">
              {trabalhosAtivos.map((trabalho) => {
                const isExpanded = expandedId === trabalho.id;
                const presentes = funcionariosPresentes(trabalho);
                const faltaram = funcionariosFaltaram(trabalho);
                const progresso = (trabalho.toneladasParciais / trabalho.toneladas) * 100;

                return (
                  <div key={trabalho.id} className="trabalho-ativo-card">
                    {/* Header do Trabalho Ativo */}
                    <div className="trabalho-ativo-header">
                      <div className="trabalho-ativo-tipo">
                        <div className={`tipo-badge ${trabalho.tipo}`}>
                          <Truck className="icon" />
                          <span>{trabalho.tipo === 'carga' ? 'CARGA' : 'DESCARGA'}</span>
                        </div>
                      </div>
                      <div className="trabalho-ativo-status pulsando">
                        <span className="status-dot" />
                        <span>ATIVO</span>
                      </div>
                    </div>

                    {/* Info Principal */}
                    <div className="trabalho-ativo-info">
                      <h3 className="trabalho-cliente">{trabalho.cliente}</h3>
                      <div className="trabalho-local">
                        <MapPin className="icon" />
                        <span>{trabalho.local}</span>
                      </div>
                    </div>

                    {/* Toneladas - DESTAQUE MÁXIMO */}
                    <div className="toneladas-controle">
                      <div className="toneladas-display">
                        <Weight className="icon" />
                        <div className="toneladas-valores">
                          <span className="toneladas-atual">{trabalho.toneladasParciais.toFixed(1)}</span>
                          <span className="toneladas-separador">/</span>
                          {editandoTonelagem === trabalho.id ? (
                            <input
                              type="number"
                              inputMode="decimal"
                              className="toneladas-input-inline"
                              value={valorTonelagemTemp}
                              onChange={(e) => setValorTonelagemTemp(e.target.value)}
                              onBlur={() => salvarEdicaoTonelagem(trabalho.id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') salvarEdicaoTonelagem(trabalho.id);
                                if (e.key === 'Escape') cancelarEdicaoTonelagem();
                              }}
                              autoFocus
                            />
                          ) : (
                            <span 
                              className="toneladas-total"
                              onDoubleClick={() => iniciarEdicaoTonelagem(trabalho.id, trabalho.toneladas)}
                              onTouchStart={() => handleTouchStart(trabalho.id, trabalho.toneladas)}
                              onTouchEnd={handleTouchEnd}
                              onTouchCancel={handleTouchEnd}
                              style={{ cursor: 'pointer', userSelect: 'none' }}
                            >
                              {trabalho.toneladas.toFixed(1)}
                            </span>
                          )}
                          <span className="toneladas-unidade">t</span>
                        </div>
                        {feedbackSalvo[trabalho.id] && (
                          <div className="feedback-salvo">
                            <CheckCircle2 className="icon" />
                            <span>Salvo</span>
                          </div>
                        )}
                      </div>
                      <div className="toneladas-barra">
                        <div 
                          className="toneladas-progresso" 
                          style={{ width: `${progresso}%` }}
                        />
                      </div>
                      <div className="toneladas-acoes">
                        <button 
                          className="btn-tonelada btn-menos"
                          onClick={() => ajustarToneladas(trabalho.id, -0.5)}
                          disabled={trabalho.toneladasParciais <= 0}
                        >
                          <Minus className="icon" />
                          <span>0.5t</span>
                        </button>
                        <button 
                          className="btn-tonelada btn-mais"
                          onClick={() => ajustarToneladas(trabalho.id, 0.5)}
                          disabled={trabalho.toneladasParciais >= trabalho.toneladas}
                        >
                          <Plus className="icon" />
                          <span>0.5t</span>
                        </button>
                      </div>
                    </div>

                    {/* Equipe Resumo */}
                    <div className="equipe-resumo">
                      <div className="equipe-info">
                        <Users className="icon" />
                        <span className="equipe-texto">
                          <strong>{presentes}</strong> presentes
                          {faltaram > 0 && <span className="equipe-faltas"> • {faltaram} faltas</span>}
                        </span>
                      </div>
                      <div className="equipe-acoes">
                        <button 
                          className="btn-adicionar-equipe"
                          onClick={() => setMostrarSeletorEquipe(trabalho.id)}
                        >
                          <Plus className="icon" />
                        </button>
                        <button 
                          className="btn-expandir"
                          onClick={() => toggleExpand(trabalho.id)}
                        >
                          {isExpanded ? <ChevronUp className="icon" /> : <ChevronDown className="icon" />}
                        </button>
                      </div>
                    </div>

                    {/* Painel Expandido - Gestão de Equipe */}
                    {isExpanded && (
                      <div className="equipe-painel">
                        {trabalho.funcionarios.length > 0 ? (
                          <div className="equipe-lista">
                            {trabalho.funcionarios.map((func) => (
                              <div
                                key={func.id}
                                className={`funcionario-item ${func.presente ? 'presente' : 'ausente'}`}
                              >
                                <div className="funcionario-avatar">
                                  {func.nome.charAt(0).toUpperCase()}
                                </div>
                                <span className="funcionario-nome">{func.nome}</span>
                                <div className="funcionario-acoes">
                                  <button
                                    className={`btn-presenca ${func.presente ? 'ativo' : ''}`}
                                    onClick={() => togglePresenca(trabalho.id, func.id)}
                                    title={func.presente ? 'Marcar como ausente' : 'Marcar como presente'}
                                  >
                                    {func.presente ? (
                                      <UserCheck className="icon" />
                                    ) : (
                                      <UserX className="icon" />
                                    )}
                                  </button>
                                  <button
                                    className="btn-remover-func"
                                    onClick={() => removerFuncionario(trabalho.id, func.id)}
                                    title="Remover do trabalho"
                                  >
                                    ×
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="equipe-vazia">
                            <Users className="icon" />
                            <p>Nenhum funcionário designado</p>
                            <button 
                              className="btn-adicionar-primeiro"
                              onClick={() => setMostrarSeletorEquipe(trabalho.id)}
                            >
                              <Plus className="icon" />
                              <span>Adicionar Equipe</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Ação de Finalização */}
                    <div className="trabalho-controles">
                      <div className="controles-secundarios">
                        {trabalho.status === 'em_execucao' && (
                          <button 
                            className="btn-controle btn-pausar"
                            onClick={() => pausarTrabalho(trabalho.id)}
                            title="Pausar trabalho"
                          >
                            <Pause size={18} />
                            <span>Pausar</span>
                          </button>
                        )}
                        {trabalho.status === 'pausado' && (
                          <button 
                            className="btn-controle btn-retomar"
                            onClick={() => retomarTrabalho(trabalho.id)}
                            title="Retomar trabalho"
                          >
                            <Play size={18} />
                            <span>Retomar</span>
                          </button>
                        )}
                        <button 
                          className="btn-controle btn-historico"
                          onClick={() => setMostrarHistorico(trabalho.id)}
                          title="Ver histórico de alterações"
                        >
                          <Clock size={18} />
                          <span>Histórico ({trabalho.historico.length})</span>
                        </button>
                      </div>

                      {trabalhoParaFinalizar === trabalho.id ? (
                        <div className="confirmacao-finalizacao">
                          <div className="confirmacao-aviso">
                            <CheckCircle2 className="icon" />
                            <div className="confirmacao-texto">
                              <p className="confirmacao-titulo">Finalizar operação?</p>
                              <p className="confirmacao-detalhes">
                                {trabalho.toneladasParciais.toFixed(1)}t • {presentes} funcionários
                              </p>
                            </div>
                          </div>
                          <div className="confirmacao-acoes">
                            <button 
                              className="btn-cancelar-finalizacao"
                              onClick={cancelarFinalizacao}
                            >
                              Cancelar
                            </button>
                            <button 
                              className="btn-confirmar-finalizacao"
                              onClick={finalizarTrabalho}
                            >
                              Sim, Finalizar
                            </button>
                          </div>
                        </div>
                      ) : (
                        trabalho.status !== 'pausado' && (
                          <button 
                            className="btn-finalizar-trabalho"
                            onClick={() => confirmarFinalizacao(trabalho.id)}
                          >
                            <Square className="icon" />
                            <span>Finalizar Operação</span>
                          </button>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* TRABALHOS PLANEJADOS */}
        {trabalhosPlanejados.length > 0 && (
          <section className="secao-trabalhos-planejados">
            <h2 className="secao-titulo">Planejados</h2>
            <div className="trabalhos-planejados-lista">
              {trabalhosPlanejados.map((trabalho) => (
                <div key={trabalho.id} className="trabalho-planejado-card">
                  <div className="trabalho-planejado-header">
                    <div className={`tipo-badge-small ${trabalho.tipo}`}>
                      <Truck className="icon" />
                    </div>
                    <div className="trabalho-planejado-info">
                      <h4 className="trabalho-planejado-cliente">{trabalho.cliente}</h4>
                      <div className="trabalho-planejado-detalhes">
                        <MapPin className="icon" />
                        <span>{trabalho.local}</span>
                        <span className="separador">•</span>
                        <Weight className="icon" />
                        <span>{trabalho.toneladas}t</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    className="btn-iniciar-trabalho"
                    onClick={() => iniciarTrabalho(trabalho.id)}
                  >
                    <Play className="icon" />
                    <span>Iniciar</span>
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TRABALHOS FINALIZADOS (Compacto) */}
        {trabalhosFinalizados.length > 0 && (
          <section className="secao-trabalhos-finalizados">
            <h2 className="secao-titulo">Finalizados Hoje</h2>
            <div className="trabalhos-finalizados-lista">
              {trabalhosFinalizados.map((trabalho) => (
                <div key={trabalho.id} className="trabalho-finalizado-card">
                  <CheckCircle2 className="icon-finalizado" />
                  <div className="trabalho-finalizado-info">
                    <span className="trabalho-finalizado-cliente">{trabalho.cliente}</span>
                    <span className="trabalho-finalizado-toneladas">{trabalho.toneladas}t</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {!loading && trabalhos.length === 0 && (
          <div className="empty-state-operacional">
            <div className="empty-icon">
              <Package className="icon" />
            </div>
            <h3 className="empty-titulo">Nenhuma operação ativa</h3>
            <p className="empty-descricao">Inicie uma nova operação para começar</p>
            <button 
              className="btn-empty-action"
              onClick={() => setMostrarNovoTrabalho(true)}
            >
              <Plus className="icon" />
              <span>Nova Operação</span>
            </button>
          </div>
        )}
      </div>

      <Dock />
    </>
  );
};

export default TrabalhosPageCore;
