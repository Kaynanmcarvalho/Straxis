import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  AlertCircle,
  X,
  Trash2
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
  const [searchParams, setSearchParams] = useSearchParams();
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
    clienteId: '',
    tipo: 'descarga' as 'carga' | 'descarga',
    local: '',
    toneladas: '',
  });
  const [trabalhoEditando, setTrabalhoEditando] = useState<TrabalhoLocal | null>(null);
  const [mostrarModalEdicao, setMostrarModalEdicao] = useState(false);
  const [mostrarClienteSearch, setMostrarClienteSearch] = useState(false);
  const [mostrarLocalInput, setMostrarLocalInput] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
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

  // Estados para swipe com zonas físicas
  const [swipingId, setSwipingId] = useState<string | null>(null);
  const [swipeStartX, setSwipeStartX] = useState(0);
  const [swipeStartTime, setSwipeStartTime] = useState(0);
  const [deletedWork, setDeletedWork] = useState<{
    trabalho: TrabalhoLocal;
    timeout: NodeJS.Timeout;
  } | null>(null);
  const [showToast, setShowToast] = useState(false);

  // Funcionários disponíveis - carregar do Firebase
  const [funcionariosDisponiveis, setFuncionariosDisponiveis] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Abrir modal se action=new na URL
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setMostrarNovoTrabalho(true);
      // Limpar query param
      searchParams.delete('action');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Carregar trabalhos do Firebase
  useEffect(() => {
    let mounted = true;
    
    const init = async () => {
      if (!mounted) return;
      
      try {
        console.log('🔍 [INIT] Carregando dados iniciais...');
        setLoading(true);
        
        // Carregar trabalhos
        const trabalhos = await trabalhoService.list();
        if (mounted && Array.isArray(trabalhos)) {
          setTrabalhos(trabalhos.map(t => ({
            id: t.id,
            tipo: t.tipo,
            cliente: t.clienteNome || 'Cliente não informado',
            local: t.localDescricao || 'Local não informado',
            toneladas: t.tonelagem || 0,
            toneladasParciais: 0,
            status: 'planejado',
            funcionarios: [],
            registrosPresenca: [],
            historico: [],
            pausas: [],
          })));
        }
        
        // Carregar funcionários
        const { funcionarioService } = await import('../services/funcionario.service');
        const funcionarios = await funcionarioService.list();
        if (mounted && Array.isArray(funcionarios)) {
          setFuncionariosDisponiveis(funcionarios.map(f => ({
            id: f.id,
            nome: f.nome,
            presente: false
          })));
        }
        
        console.log('✅ [INIT] Dados carregados com sucesso');
      } catch (error) {
        console.error('❌ [INIT] Erro:', error);
        if (mounted) {
          setTrabalhos([]);
          setFuncionariosDisponiveis([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    init();
    
    return () => {
      mounted = false;
    };
  }, []);

  const loadFuncionarios = async () => {
    try {
      console.log('🔍 [FUNCIONARIOS] Iniciando carregamento...');
      const { funcionarioService } = await import('../services/funcionario.service');
      console.log('📦 [FUNCIONARIOS] Serviço importado');
      
      const data = await funcionarioService.list();
      console.log('📦 [FUNCIONARIOS] Dados recebidos da API:', data);
      console.log('📦 [FUNCIONARIOS] Tipo dos dados:', typeof data);
      console.log('📦 [FUNCIONARIOS] É array?', Array.isArray(data));
      console.log('📦 [FUNCIONARIOS] Quantidade:', data?.length);
      
      if (!data || !Array.isArray(data)) {
        console.error('❌ [FUNCIONARIOS] Dados inválidos recebidos:', data);
        return;
      }
      
      if (data.length === 0) {
        console.warn('⚠️ [FUNCIONARIOS] Nenhum funcionário retornado pela API');
        return;
      }
      
      // Converter para formato local
      const funcionariosLocais: Funcionario[] = data.map((f: any) => {
        console.log('🔄 [FUNCIONARIOS] Convertendo:', f);
        return {
          id: f.id,
          nome: f.nome,
          presente: false
        };
      });
      
      console.log('✅ [FUNCIONARIOS] Funcionários convertidos:', funcionariosLocais);
      setFuncionariosDisponiveis(funcionariosLocais);
      console.log('✅ [FUNCIONARIOS] Estado atualizado com', funcionariosLocais.length, 'funcionários');
    } catch (error) {
      console.error('❌ [FUNCIONARIOS] Erro ao carregar:', error);
      if (error instanceof Error) {
        console.error('❌ [FUNCIONARIOS] Mensagem:', error.message);
        console.error('❌ [FUNCIONARIOS] Stack:', error.stack);
      }
    }
  };

  const loadTrabalhos = async () => {
    try {
      console.log('🔍 [TRABALHOS] Iniciando carregamento...');
      setLoading(true);
      
      console.log('🔍 [TRABALHOS] Chamando trabalhoService.list()...');
      const data = await trabalhoService.list();
      console.log('📦 [TRABALHOS] Dados recebidos:', data);
      console.log('📦 [TRABALHOS] Tipo:', typeof data);
      console.log('📦 [TRABALHOS] É array?', Array.isArray(data));
      
      if (!data || !Array.isArray(data)) {
        console.error('❌ [TRABALHOS] Dados inválidos:', data);
        setTrabalhos([]);
        return;
      }
      
      console.log('🔍 [TRABALHOS] Processando', data.length, 'trabalhos...');
      
      // Converter trabalhos do Firebase para formato local
      const trabalhosLocais: TrabalhoLocal[] = data.map(t => ({
        id: t.id,
        tipo: t.tipo,
        cliente: t.clienteNome || 'Cliente não informado',
        local: t.localDescricao || 'Local não informado',
        toneladas: t.tonelagem || 0, // Fallback para 0 se undefined
        toneladasParciais: 0,
        status: 'planejado',
        funcionarios: [],
        registrosPresenca: [],
        historico: [],
        pausas: [],
      }));
      
      console.log('✅ [TRABALHOS] Trabalhos processados:', trabalhosLocais.length);
      setTrabalhos(trabalhosLocais);
    } catch (error) {
      console.error('❌ [TRABALHOS] Erro ao carregar:', error);
      console.error('❌ [TRABALHOS] Stack:', (error as any)?.stack);
      setTrabalhos([]);
      alert('Erro ao carregar trabalhos');
    } finally {
      console.log('🔄 [TRABALHOS] Finalizando carregamento...');
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
      `${(trabalho.toneladas || 0).toFixed(1)}t`,
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
        data: new Date().toISOString(),
        tipo: novoTrabalho.tipo,
        tonelagem: toneladas,
        valorRecebidoCentavos: 0,
        funcionarios: [],
        totalPagoCentavos: 0,
        lucroCentavos: 0,
        clienteNome: novoTrabalho.cliente,
        localDescricao: novoTrabalho.local,
        observacoes: `Cliente: ${novoTrabalho.cliente} | Local: ${novoTrabalho.local}`,
      } as any; // Cast para evitar erro de tipo (backend aceita string ISO)

      console.log('📤 Enviando trabalho:', trabalhoData);
      const novoTrabalhoCriado = await trabalhoService.create(trabalhoData);
      console.log('✅ Trabalho criado:', novoTrabalhoCriado);
      
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
        clienteId: '',
        tipo: 'descarga',
        local: '',
        toneladas: '',
      });
      
      alert('✅ Trabalho criado com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao criar trabalho:', error);
      alert(`❌ Erro ao criar trabalho`);
    }
  };

  // Funções de Swipe com Zonas Físicas (Correção Estrutural Alpha 0.20.0)
  const calculateResistance = (distance: number): number => {
    if (distance < 90) return 1.0; // Zona 1: Linear
    if (distance < 165) return 1.0 + ((distance - 90) / 75) * 0.5; // Zona 2: Leve
    return 2.5; // Zona 3: Alta
  };

  const getZone = (distance: number): 1 | 2 | 3 => {
    if (distance < 90) return 1;
    if (distance < 165) return 2;
    return 3;
  };

  const handleSwipeStart = (e: React.TouchEvent, trabalhoId: string) => {
    setSwipingId(trabalhoId);
    setSwipeStartX(e.touches[0].clientX);
    setSwipeStartTime(Date.now());
  };

  const handleSwipeMove = (e: React.TouchEvent) => {
    if (!swipingId) return;
    
    const currentX = e.touches[0].clientX;
    const diff = swipeStartX - currentX;
    
    const card = document.getElementById(`trabalho-${swipingId}`);
    const actions = card?.parentElement?.querySelector('.native-swipe-actions');
    const deleteAction = actions?.querySelector('.native-action-delete');
    
    if (!card) return;
    
    // Swipe para DIREITA (fechar ações)
    if (diff < 0) {
      const distance = Math.abs(diff);
      const maxClose = 140; // Máximo que pode fechar
      const actualMove = Math.min(distance, maxClose);
      
      card.style.transition = 'none';
      card.style.transform = `translateX(${actualMove}px)`;
      
      // Fade out das ações
      if (actions) {
        const opacity = Math.max(0, 1 - (distance / maxClose));
        (actions as HTMLElement).style.opacity = opacity.toString();
      }
      
      return;
    }
    
    // Swipe para ESQUERDA (abrir ações) - código original
    const distance = Math.abs(diff);
    const zone = getZone(distance);
    const resistance = calculateResistance(distance);
    
    // Calcular movimento com resistência
    let actualMove = 0;
    if (distance < 90) {
      actualMove = distance;
    } else if (distance < 165) {
      actualMove = 90 + ((distance - 90) / resistance);
    } else {
      actualMove = 140 + ((distance - 165) / resistance);
    }
    
    card.style.transition = 'none';
    card.style.transform = `translateX(-${actualMove}px)`;
    
    // Snap magnético zona 2 (ponto de repouso 140px)
    if (zone === 2 && distance > 130 && distance < 150) {
      card.style.transform = `translateX(-140px)`;
      if (navigator.vibrate) navigator.vibrate(10);
    }
    
    // Opacidade das ações
    if (actions) {
      const opacity = Math.min(distance / 90, 1);
      (actions as HTMLElement).style.opacity = opacity.toString();
    }
    
    // Feedback zona 3
    if (zone === 3) {
      card.classList.add('deleting-intent');
      deleteAction?.classList.add('active');
      if (navigator.vibrate) navigator.vibrate([10, 50, 10]);
    } else {
      card.classList.remove('deleting-intent');
      deleteAction?.classList.remove('active');
    }
  };

  const handleSwipeEnd = (e: React.TouchEvent) => {
    if (!swipingId) return;
    
    const endX = e.changedTouches[0].clientX;
    const diff = swipeStartX - endX;
    const distance = Math.abs(diff);
    const timeElapsed = Date.now() - swipeStartTime;
    const velocity = distance / timeElapsed; // px/ms
    
    const card = document.getElementById(`trabalho-${swipingId}`);
    const actions = card?.parentElement?.querySelector('.native-swipe-actions');
    
    if (!card) return;
    
    // SWIPE DIREITA: Fechar ações (cancelar)
    if (diff < 0) {
      const closeThreshold = 50; // Mínimo para fechar
      
      if (distance > closeThreshold || velocity > 0.3) {
        // Fechar com animação suave
        card.classList.add('returning');
        card.style.transition = 'transform 0.35s cubic-bezier(0.36, 0.66, 0.04, 1)';
        card.style.transform = 'translateX(0)';
        
        if (actions) {
          (actions as HTMLElement).style.transition = 'opacity 0.35s ease';
          (actions as HTMLElement).style.opacity = '1';
        }
        
        if (navigator.vibrate) navigator.vibrate(5);
        
        setTimeout(() => {
          card.classList.remove('returning');
          setSwipingId(null);
        }, 350);
      } else {
        // Voltar para posição aberta
        card.classList.add('returning');
        card.style.transition = 'transform 0.3s cubic-bezier(0.36, 0.66, 0.04, 1)';
        card.style.transform = 'translateX(-140px)';
        
        if (actions) {
          (actions as HTMLElement).style.transition = 'opacity 0.3s ease';
          (actions as HTMLElement).style.opacity = '1';
        }
        
        setTimeout(() => {
          card.classList.remove('returning');
        }, 300);
      }
      
      return;
    }
    
    // SWIPE ESQUERDA: Lógica original
    const zone = getZone(distance);
    
    // Zona 3: Exclusão intencional (velocidade > 0.8 OU distância > 200)
    if (zone === 3 && (velocity > 0.8 || distance > 200)) {
      card.classList.add('deleting');
      card.style.transition = 'all 0.35s cubic-bezier(0.4, 0, 1, 1)';
      card.style.transform = 'translateX(-100%)';
      card.style.opacity = '0';
      
      setTimeout(() => {
        deletarTrabalhoComUndo(swipingId);
        setSwipingId(null);
      }, 350);
    }
    // Zona 2: Ponto de repouso (140px)
    else if (zone === 2 || distance >= 90) {
      card.classList.add('returning');
      card.style.transition = 'transform 0.3s cubic-bezier(0.36, 0.66, 0.04, 1)';
      card.style.transform = 'translateX(-140px)';
    }
    // Zona 1: Retorna ao início
    else {
      card.classList.add('returning');
      card.style.transition = 'transform 0.35s cubic-bezier(0.36, 0.66, 0.04, 1)';
      card.style.transform = 'translateX(0)';
      setSwipingId(null);
    }
    
    setTimeout(() => {
      card.classList.remove('returning', 'deleting', 'deleting-intent');
    }, 400);
  };

  const confirmarExclusao = (trabalhoId: string) => {
    const card = document.getElementById(`trabalho-${trabalhoId}`);
    if (card) {
      card.classList.add('deleting');
      card.style.transition = 'all 0.35s cubic-bezier(0.4, 0, 1, 1)';
      card.style.transform = 'translateX(-100%)';
      card.style.opacity = '0';
    }
    
    setTimeout(() => {
      deletarTrabalhoComUndo(trabalhoId);
      setSwipingId(null);
    }, 350);
  };

  const deletarTrabalhoComUndo = (trabalhoId: string) => {
    const trabalho = trabalhos.find(t => t.id === trabalhoId);
    if (!trabalho) return;
    
    setTrabalhos(prev => prev.filter(t => t.id !== trabalhoId));
    
    const timeout = setTimeout(async () => {
      try {
        await trabalhoService.delete(trabalhoId);
        setDeletedWork(null);
        setShowToast(false);
      } catch (error) {
        console.error('Erro ao deletar trabalho:', error);
        setTrabalhos(prev => [...prev, trabalho]);
      }
    }, 5000);
    
    setDeletedWork({ trabalho, timeout });
    setShowToast(true);
  };

  const desfazerDelecao = () => {
    if (!deletedWork) return;
    
    clearTimeout(deletedWork.timeout);
    setTrabalhos(prev => [...prev, deletedWork.trabalho]);
    setDeletedWork(null);
    setShowToast(false);
  };

  const fecharToast = () => {
    if (deletedWork) {
      clearTimeout(deletedWork.timeout);
      trabalhoService.delete(deletedWork.trabalho.id);
    }
    setDeletedWork(null);
    setShowToast(false);
  };

  const cancelarNovoTrabalho = () => {
    setMostrarNovoTrabalho(false);
    setNovoTrabalho({
      cliente: '',
      clienteId: '',
      tipo: 'descarga',
      local: '',
      toneladas: '',
    });
  };

  const abrirModalEdicao = (trabalho: TrabalhoLocal) => {
    setTrabalhoEditando(trabalho);
    setMostrarModalEdicao(true);
  };

  const salvarEdicaoTrabalho = async () => {
    if (!trabalhoEditando) return;

    try {
      await trabalhoService.update(trabalhoEditando.id, {
        clienteNome: trabalhoEditando.cliente,
        localDescricao: trabalhoEditando.local,
        tonelagem: trabalhoEditando.toneladas,
        tipo: trabalhoEditando.tipo,
      } as any);

      // Atualizar lista local
      setTrabalhos(prev => prev.map(t => 
        t.id === trabalhoEditando.id ? trabalhoEditando : t
      ));

      setMostrarModalEdicao(false);
      setTrabalhoEditando(null);
      alert('✅ Trabalho atualizado com sucesso!');
      loadTrabalhos(); // Recarregar para garantir sincronização
    } catch (error) {
      console.error('Erro ao atualizar trabalho:', error);
      alert('❌ Erro ao atualizar trabalho');
    }
  };

  const cancelarEdicaoTrabalho = () => {
    setMostrarModalEdicao(false);
    setTrabalhoEditando(null);
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
                {(() => {
                  console.log('🎯 Modal aberto. Funcionários disponíveis:', funcionariosDisponiveis);
                  return null;
                })()}
                <div className="funcionarios-disponiveis">
                  {funcionariosDisponiveis.length === 0 ? (
                    <div className="empty-state">
                      <p>Nenhum funcionário cadastrado</p>
                      <small>Cadastre funcionários na aba Funcionários</small>
                    </div>
                  ) : (
                    funcionariosDisponiveis.map((func) => {
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
                    })
                  )}
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

        {/* Modal Novo Trabalho - iOS Premium */}
        {mostrarNovoTrabalho && (
          <div className="ops-sheet-overlay" onClick={cancelarNovoTrabalho}>
            <div className="ops-sheet-container" onClick={(e) => e.stopPropagation()}>
              {/* Drag Handle */}
              <div className="ops-sheet-handle" />
              
              {/* Header Premium */}
              <div className="ops-sheet-header">
                <div className="ops-header-content">
                  <h2 className="ops-title">Criar Operação</h2>
                  <p className="ops-subtitle">Leva menos de 30 segundos</p>
                </div>
                <button 
                  className="ops-close-btn"
                  onClick={cancelarNovoTrabalho}
                  aria-label="Fechar"
                >
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>
              
              {/* Body com Scroll */}
              <div className="ops-sheet-body">
                {/* Módulo Cliente */}
                <div className="ops-module">
                  {!mostrarClienteSearch ? (
                    <button 
                      className={`ops-cell ${novoTrabalho.cliente ? 'filled' : ''}`}
                      onClick={() => setMostrarClienteSearch(true)}
                    >
                      <div className="ops-cell-icon">
                        <Users size={20} />
                      </div>
                      <div className="ops-cell-content">
                        {novoTrabalho.cliente ? (
                          <>
                            <span className="ops-cell-label-small">Cliente</span>
                            <span className="ops-cell-value">{novoTrabalho.cliente}</span>
                          </>
                        ) : (
                          <span className="ops-cell-placeholder">Selecionar cliente</span>
                        )}
                      </div>
                      <ChevronRight size={18} className="ops-cell-chevron" />
                    </button>
                  ) : (
                    <div className="ops-autocomplete-wrapper">
                      <AutocompleteCliente
                        value={novoTrabalho.cliente}
                        onChange={(value) => setNovoTrabalho(prev => ({ ...prev, cliente: value }))}
                        onSelect={(cliente) => {
                          setNovoTrabalho(prev => ({ 
                            ...prev, 
                            cliente: cliente.nome,
                            clienteId: cliente.id 
                          }));
                          setMostrarClienteSearch(false);
                        }}
                        placeholder="Buscar cliente..."
                        className="ops-autocomplete-input"
                        autoFocus
                      />
                    </div>
                  )}
                </div>

                {/* Módulo Tipo - Segmented Control */}
                <div className="ops-module">
                  <div className="ops-module-label">Tipo de operação</div>
                  <div className="ops-segmented-control">
                    <button
                      className={`ops-segment ${novoTrabalho.tipo === 'descarga' ? 'active' : ''}`}
                      onClick={() => setNovoTrabalho(prev => ({ ...prev, tipo: 'descarga' }))}
                    >
                      <Truck size={18} />
                      <span>Descarga</span>
                    </button>
                    <button
                      className={`ops-segment ${novoTrabalho.tipo === 'carga' ? 'active' : ''}`}
                      onClick={() => setNovoTrabalho(prev => ({ ...prev, tipo: 'carga' }))}
                    >
                      <Truck size={18} />
                      <span>Carga</span>
                    </button>
                    <div 
                      className="ops-segment-indicator"
                      style={{
                        transform: novoTrabalho.tipo === 'carga' ? 'translateX(100%)' : 'translateX(0)'
                      }}
                    />
                  </div>
                </div>

                {/* Módulo Local */}
                <div className="ops-module">
                  {!mostrarLocalInput ? (
                    <button 
                      className={`ops-cell ${novoTrabalho.local ? 'filled' : ''}`}
                      onClick={() => setMostrarLocalInput(true)}
                    >
                      <div className="ops-cell-icon">
                        <MapPin size={20} />
                      </div>
                      <div className="ops-cell-content">
                        {novoTrabalho.local ? (
                          <>
                            <span className="ops-cell-label-small">Local</span>
                            <span className="ops-cell-value">{novoTrabalho.local}</span>
                          </>
                        ) : (
                          <span className="ops-cell-placeholder">Local da operação</span>
                        )}
                      </div>
                      <ChevronRight size={18} className="ops-cell-chevron" />
                    </button>
                  ) : (
                    <input
                      type="text"
                      className="ops-contextual-input"
                      placeholder="Galpão, setor, pátio..."
                      value={novoTrabalho.local}
                      onChange={(e) => setNovoTrabalho(prev => ({ ...prev, local: e.target.value }))}
                      onBlur={() => {
                        if (!novoTrabalho.local) {
                          setMostrarLocalInput(false);
                        }
                      }}
                      autoFocus
                    />
                  )}
                </div>

                {/* Módulo Tonelagem - Stepper */}
                <div className="ops-module">
                  <div className="ops-module-label">Tonelagem prevista</div>
                  <div className="ops-stepper">
                    <button 
                      className="ops-stepper-btn"
                      onClick={() => {
                        const current = parseFloat(novoTrabalho.toneladas) || 0;
                        if (current > 0) {
                          setNovoTrabalho(prev => ({ ...prev, toneladas: (current - 0.5).toFixed(1) }));
                        }
                      }}
                      disabled={!novoTrabalho.toneladas || parseFloat(novoTrabalho.toneladas) <= 0}
                    >
                      <Minus size={20} strokeWidth={2.5} />
                    </button>
                    
                    <div className="ops-stepper-value">
                      <input
                        type="number"
                        inputMode="decimal"
                        className="ops-stepper-input"
                        placeholder="0.0"
                        value={novoTrabalho.toneladas}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || parseFloat(value) >= 0) {
                            setNovoTrabalho(prev => ({ ...prev, toneladas: value }));
                          }
                        }}
                      />
                      <span className="ops-stepper-unit">t</span>
                    </div>
                    
                    <button 
                      className="ops-stepper-btn"
                      onClick={() => {
                        const current = parseFloat(novoTrabalho.toneladas) || 0;
                        setNovoTrabalho(prev => ({ ...prev, toneladas: (current + 0.5).toFixed(1) }));
                      }}
                    >
                      <Plus size={20} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer Fixo */}
              <div className="ops-sheet-footer">
                <button 
                  className="ops-cancel-link"
                  onClick={cancelarNovoTrabalho}
                  disabled={isCreating}
                >
                  Cancelar
                </button>
                <button 
                  className="ops-primary-btn"
                  onClick={async () => {
                    if (!novoTrabalho.cliente || !novoTrabalho.local || !novoTrabalho.toneladas) {
                      return;
                    }
                    
                    setIsCreating(true);
                    try {
                      await criarNovoTrabalho();
                    } finally {
                      setIsCreating(false);
                    }
                  }}
                  disabled={!novoTrabalho.cliente || !novoTrabalho.local || !novoTrabalho.toneladas || isCreating}
                >
                  <span>{isCreating ? 'Criando...' : 'Criar Operação'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Editar Trabalho */}
        {mostrarModalEdicao && trabalhoEditando && (
          <div className="modal-overlay" onClick={cancelarEdicaoTrabalho}>
            <div className="modal-novo-trabalho" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-titulo">Editar Operação</h3>
                <button 
                  className="modal-close-btn"
                  onClick={cancelarEdicaoTrabalho}
                  aria-label="Fechar"
                >
                  ×
                </button>
              </div>
              
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Cliente *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Nome do cliente"
                    value={trabalhoEditando.cliente}
                    onChange={(e) => setTrabalhoEditando(prev => prev ? { ...prev, cliente: e.target.value } : null)}
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tipo *</label>
                  <div className="tipo-selector">
                    <button
                      className={`tipo-option ${trabalhoEditando.tipo === 'descarga' ? 'active' : ''}`}
                      onClick={() => setTrabalhoEditando(prev => prev ? { ...prev, tipo: 'descarga' } : null)}
                    >
                      <Truck className="icon" />
                      <span>Descarga</span>
                    </button>
                    <button
                      className={`tipo-option ${trabalhoEditando.tipo === 'carga' ? 'active' : ''}`}
                      onClick={() => setTrabalhoEditando(prev => prev ? { ...prev, tipo: 'carga' } : null)}
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
                    value={trabalhoEditando.local}
                    onChange={(e) => setTrabalhoEditando(prev => prev ? { ...prev, local: e.target.value } : null)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tonelagem Prevista *</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    className="form-input"
                    placeholder="0.0"
                    value={trabalhoEditando.toneladas}
                    onChange={(e) => setTrabalhoEditando(prev => prev ? { ...prev, toneladas: parseFloat(e.target.value) || 0 } : null)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn-modal-cancelar" onClick={cancelarEdicaoTrabalho}>
                  Cancelar
                </button>
                <button className="btn-modal-criar" onClick={salvarEdicaoTrabalho}>
                  Salvar Alterações
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
                              {(trabalho.toneladas || 0).toFixed(1)}
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
                <div key={trabalho.id} className="native-card-wrapper">
                  <div 
                    id={`trabalho-${trabalho.id}`}
                    className="native-operation-card"
                    onTouchStart={(e) => handleSwipeStart(e, trabalho.id)}
                    onTouchMove={handleSwipeMove}
                    onTouchEnd={handleSwipeEnd}
                    style={{
                      touchAction: 'pan-y',
                      userSelect: 'none',
                    }}
                  >
                    {/* Conteúdo do Card Nativo */}
                    <div className="native-card-content">
                      {/* Chip de Tipo - Silencioso */}
                      <div className={`native-type-chip ${trabalho.tipo}`}>
                        <span>{trabalho.tipo === 'carga' ? 'CARGA' : 'DESCARGA'}</span>
                      </div>

                      {/* Nome do Cliente - Dominante */}
                      <h3 className="native-client-title">
                        {trabalho.cliente || 'Cliente não informado'}
                      </h3>

                      {/* Informações - Leitura Natural */}
                      <div className="native-info-group">
                        <div className="native-info-row">
                          <MapPin className="native-info-icon" size={15} strokeWidth={2} />
                          <span className="native-info-text">{trabalho.local || 'Local não informado'}</span>
                        </div>
                        <div className="native-info-row">
                          <Weight className="native-info-icon" size={15} strokeWidth={2} />
                          <span className="native-info-text">{(trabalho.toneladas || 0).toFixed(1)} toneladas</span>
                        </div>
                      </div>

                      {/* Botão Iniciar - Ação Nativa */}
                      <button 
                        className="native-action-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          iniciarTrabalho(trabalho.id);
                        }}
                      >
                        <Play className="native-action-icon" size={18} strokeWidth={2.5} />
                        <span>Iniciar Operação</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Ações Reveladas no Gesto - iOS Style */}
                  <div className="native-swipe-actions">
                    <button 
                      className="native-action-edit"
                      onClick={() => {
                        abrirModalEdicao(trabalho);
                      }}
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <button 
                      className="native-action-delete"
                      onClick={() => confirmarExclusao(trabalho.id)}
                    >
                      <Trash2 size={22} strokeWidth={2} />
                    </button>
                  </div>
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

      {/* Toast de Undo */}
      {showToast && deletedWork && (
        <div className="toast-undo">
          <div className="toast-content">
            <CheckCircle2 className="toast-icon" size={20} />
            <span className="toast-message">Trabalho excluído</span>
            <button 
              className="toast-btn-undo"
              onClick={desfazerDelecao}
            >
              Desfazer
            </button>
            <button 
              className="toast-btn-close"
              onClick={fecharToast}
            >
              <X size={18} />
            </button>
          </div>
          <div className="toast-progress" />
        </div>
      )}

      <Dock />
    </>
  );
};

export default TrabalhosPageCore;
