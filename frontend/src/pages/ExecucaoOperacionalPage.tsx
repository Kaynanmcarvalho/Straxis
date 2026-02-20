import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { 
  Plus,
  Clock,
  AlertTriangle,
  Play,
  Pause,
  CheckCircle2,
  X,
  MapPin,
  Package,
  Users,
  Calendar,
  Edit,
  RotateCcw,
  XCircle
} from 'lucide-react';
import { Dock } from '../components/core/Dock';
import { useAuth } from '../contexts/AuthContext';
import './ExecucaoOperacionalPage.css';

// Estados oficiais
type StatusOperacao = 'planejada' | 'em_andamento' | 'pausada' | 'concluida' | 'cancelada';
type FiltroView = 'hoje' | 'em_execucao' | 'planejadas' | 'historico';

interface Operacao {
  id: string;
  cliente: string;
  clienteId: string;
  local: string;
  tipo: 'carga' | 'descarga';
  tonelagem: number;
  tonelagemReal?: number;
  status: StatusOperacao;
  scheduledAt?: Date;
  startedAt?: Date;
  finishedAt?: Date;
  pausedAt?: Date;
  equipe: string[];
  sla?: Date;
  source?: 'manual' | 'agenda';
  duracao?: number; // em minutos
  atrasada?: boolean;
}

const ExecucaoOperacionalPage: React.FC = () => {
  const { user } = useAuth();
  const [operacoes, setOperacoes] = useState<Operacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroAtivo, setFiltroAtivo] = useState<FiltroView>('hoje');
  const [operacaoSelecionada, setOperacaoSelecionada] = useState<Operacao | null>(null);
  const [showDetalhe, setShowDetalhe] = useState(false);
  const [swipedId, setSwipedId] = useState<string | null>(null);
  const [longPressId, setLongPressId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadOperacoes();
  }, [user?.companyId]);

  const loadOperacoes = async () => {
    try {
      setLoading(true);
      // TODO: Integrar com Firebase
      // Mock temporário
      const mockOperacoes: Operacao[] = [
        {
          id: '1',
          cliente: 'Transportadora ABC',
          clienteId: 'abc123',
          local: 'Armazém Central - Setor B',
          tipo: 'descarga',
          tonelagem: 25.5,
          status: 'planejada',
          scheduledAt: new Date(),
          equipe: [],
          sla: new Date(Date.now() + 2 * 60 * 60 * 1000),
          source: 'agenda',
          atrasada: false
        },
        {
          id: '2',
          cliente: 'Logística XYZ',
          clienteId: 'xyz456',
          local: 'Terminal Norte',
          tipo: 'carga',
          tonelagem: 18.0,
          status: 'em_andamento',
          scheduledAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
          startedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
          equipe: ['João Silva', 'Maria Santos'],
          duracao: 60,
          atrasada: false
        }
      ];
      setOperacoes(mockOperacoes);
    } catch (error) {
      console.error('Erro ao carregar operações:', error);
    } finally {
      setLoading(false);
    }
  };

  const operacoesFiltradas = operacoes.filter(op => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    if (filtroAtivo === 'hoje') {
      const opDate = op.scheduledAt ? new Date(op.scheduledAt) : new Date();
      opDate.setHours(0, 0, 0, 0);
      return opDate.getTime() === hoje.getTime() && op.status !== 'concluida';
    }
    if (filtroAtivo === 'em_execucao') return op.status === 'em_andamento' || op.status === 'pausada';
    if (filtroAtivo === 'planejadas') return op.status === 'planejada';
    if (filtroAtivo === 'historico') return op.status === 'concluida';
    return false;
  });

  const emExecucao = operacoes.filter(op => op.status === 'em_andamento').length;
  const planejadas = operacoes.filter(op => op.status === 'planejada').length;
  const atrasadas = operacoes.filter(op => op.atrasada && op.status !== 'concluida').length;

  const handleIniciar = (operacao: Operacao) => {
    // TODO: Implementar lógica de início
    console.log('Iniciar operação:', operacao.id);
    // Simular transição suave
    setOperacoes(prev => prev.map(op => 
      op.id === operacao.id 
        ? { ...op, status: 'em_andamento' as StatusOperacao, startedAt: new Date() }
        : op
    ));
  };

  const handleConcluir = (operacao: Operacao) => {
    // TODO: Implementar lógica de conclusão
    console.log('Concluir operação:', operacao.id);
  };

  const handleDetalhe = (operacao: Operacao) => {
    setOperacaoSelecionada(operacao);
    setShowDetalhe(true);
  };

  // Swipe handlers
  const handleTouchStart = (e: React.TouchEvent, id: string) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    
    // Long press
    longPressTimer.current = setTimeout(() => {
      handleLongPress(e, id);
    }, 500);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent, operacao: Operacao) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX.current;
    const deltaY = Math.abs(touchEndY - touchStartY.current);

    // Swipe horizontal (não vertical)
    if (Math.abs(deltaX) > 80 && deltaY < 50) {
      if (deltaX > 0 && operacao.status === 'planejada') {
        // Swipe direita: Iniciar
        handleIniciar(operacao);
      } else if (deltaX < 0) {
        // Swipe esquerda: Reatribuir
        console.log('Reatribuir:', operacao.id);
      }
    }
  };

  const handleLongPress = (e: React.TouchEvent | React.MouseEvent, id: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({ x: rect.left + rect.width / 2, y: rect.top });
    setLongPressId(id);
  };

  const closeMenu = () => {
    setLongPressId(null);
  };

  const getStatusColor = (status: StatusOperacao) => {
    switch (status) {
      case 'planejada': return '#0070F3';
      case 'em_andamento': return '#34C759';
      case 'pausada': return '#FF9500';
      case 'concluida': return '#8E8E93';
      case 'cancelada': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const getStatusText = (status: StatusOperacao) => {
    switch (status) {
      case 'planejada': return 'Planejada';
      case 'em_andamento': return 'Em andamento';
      case 'pausada': return 'Pausada';
      case 'concluida': return 'Concluída';
      case 'cancelada': return 'Cancelada';
      default: return status;
    }
  };

  const formatTempo = (minutos?: number) => {
    if (!minutos) return '--';
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    return `${h}h${m}m`;
  };

  if (loading) {
    return (
      <>
        <div className="execucao-loading">
          <div className="loading-skeleton">
            <div className="skeleton-pulse" />
            <p>Carregando operações...</p>
          </div>
        </div>
        <Dock />
      </>
    );
  }

  return (
    <>
      <div className="linha-execucao">
        {/* Header Editorial Fluido */}
        <header className="execucao-header-editorial">
          <h1 className="titulo-principal">Operações</h1>
          <p className="subtexto-fluido">
            Hoje • {planejadas} planejadas • {emExecucao} em execução
          </p>
          <button 
            className="btn-add-minimal" 
            onClick={() => console.log('Nova operação')}
            aria-label="Nova operação"
          >
            <Plus size={18} strokeWidth={2.5} />
          </button>
        </header>

        {/* Navegação Editorial */}
        <nav className="navegacao-editorial">
          <button
            className={`nav-item ${filtroAtivo === 'hoje' ? 'active' : ''}`}
            onClick={() => setFiltroAtivo('hoje')}
          >
            Hoje
          </button>
          <button
            className={`nav-item ${filtroAtivo === 'em_execucao' ? 'active' : ''}`}
            onClick={() => setFiltroAtivo('em_execucao')}
          >
            Em execução
          </button>
          <button
            className={`nav-item ${filtroAtivo === 'planejadas' ? 'active' : ''}`}
            onClick={() => setFiltroAtivo('planejadas')}
          >
            Planejadas
          </button>
          <button
            className={`nav-item ${filtroAtivo === 'historico' ? 'active' : ''}`}
            onClick={() => setFiltroAtivo('historico')}
          >
            Histórico
          </button>
        </nav>

        {/* Insight Contextual Discreto */}
        {atrasadas > 0 && (
          <div className="insight-discreto">
            <span>{atrasadas} operação{atrasadas > 1 ? 'ões' : ''} com SLA vencido</span>
            <button className="cta-discreto">Ver atrasadas</button>
          </div>
        )}

        {/* Timeline Operacional Viva */}
        <div className="timeline-operacional">
          {operacoesFiltradas.length === 0 ? (
            <div className="empty-state-minimal">
              <Package size={48} strokeWidth={1.5} />
              <p>Nenhuma operação {filtroAtivo === 'hoje' ? 'para hoje' : filtroAtivo}</p>
            </div>
          ) : (
            operacoesFiltradas.map((operacao, index) => (
              <div
                key={operacao.id}
                className={`celula-operacao ${operacao.status} ${operacao.atrasada ? 'atrasada' : ''}`}
                onClick={() => handleDetalhe(operacao)}
                onTouchStart={(e) => handleTouchStart(e, operacao.id)}
                onTouchMove={handleTouchMove}
                onTouchEnd={(e) => handleTouchEnd(e, operacao)}
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                {/* Linha Lateral de Status */}
                <div className="status-line" />

                {/* Conteúdo da Célula */}
                <div className="celula-content">
                  <div className="celula-info">
                    <h3 className="cliente-nome">{operacao.cliente}</h3>
                    <p className="operacao-detalhes">
                      {operacao.local} — {operacao.tonelagem}t
                    </p>
                    <p className="operacao-meta">
                      {operacao.tipo === 'carga' ? 'Carga' : 'Descarga'}
                      {operacao.source === 'agenda' && (
                        <span className="tag-agendado">Agendado</span>
                      )}
                    </p>
                  </div>

                  <div className="celula-actions">
                    {operacao.status === 'planejada' && (
                      <button
                        className="btn-contextual"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleIniciar(operacao);
                        }}
                      >
                        Iniciar
                      </button>
                    )}
                    
                    {operacao.status === 'em_andamento' && (
                      <div className="tempo-vivo">
                        <div className="pulse-indicator" />
                        <span>{formatTempo(operacao.duracao)}</span>
                      </div>
                    )}

                    {operacao.status === 'concluida' && operacao.finishedAt && (
                      <span className="data-conclusao">
                        {new Date(operacao.finishedAt).toLocaleDateString('pt-BR', { 
                          day: 'numeric', 
                          month: 'short' 
                        })}
                      </span>
                    )}
                  </div>
                </div>

                {/* Separador Invisível */}
                <div className="separador-invisivel" />
              </div>
            ))
          )}
        </div>
      </div>
      <Dock />

      {/* Sheet de Detalhe */}
      {showDetalhe && operacaoSelecionada && ReactDOM.createPortal(
        <div 
          className="sheet-overlay"
          onClick={(e) => { 
            if (e.target === e.currentTarget) {
              setShowDetalhe(false); 
              setOperacaoSelecionada(null);
            }
          }}
        >
          <div className="sheet-detalhe">
            {/* Header */}
            <div className="sheet-header">
              <div>
                <h2>{operacaoSelecionada.cliente}</h2>
                <p className="sheet-subtitle">
                  {operacaoSelecionada.tipo === 'carga' ? 'Carga' : 'Descarga'} • {operacaoSelecionada.tonelagem}t
                </p>
              </div>
              <button 
                className="btn-close-sheet"
                onClick={() => {
                  setShowDetalhe(false);
                  setOperacaoSelecionada(null);
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="sheet-content">
              {/* Resumo */}
              <section className="sheet-section">
                <h3 className="section-title">Resumo</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Status</span>
                    <span className="info-value" style={{ color: getStatusColor(operacaoSelecionada.status) }}>
                      {getStatusText(operacaoSelecionada.status)}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Local</span>
                    <span className="info-value">{operacaoSelecionada.local}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Tonelagem prevista</span>
                    <span className="info-value">{operacaoSelecionada.tonelagem}t</span>
                  </div>
                  {operacaoSelecionada.tonelagemReal && (
                    <div className="info-item">
                      <span className="info-label">Tonelagem real</span>
                      <span className="info-value">{operacaoSelecionada.tonelagemReal}t</span>
                    </div>
                  )}
                </div>
              </section>

              {/* Equipe */}
              <section className="sheet-section">
                <h3 className="section-title">Equipe atribuída</h3>
                {operacaoSelecionada.equipe.length === 0 ? (
                  <p className="empty-text">Nenhum colaborador atribuído</p>
                ) : (
                  <div className="equipe-lista">
                    {operacaoSelecionada.equipe.map(membro => (
                      <div key={membro} className="equipe-item">
                        <Users size={16} />
                        <span>{membro}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Linha do Tempo */}
              <section className="sheet-section">
                <h3 className="section-title">Linha do tempo</h3>
                <div className="timeline">
                  {operacaoSelecionada.scheduledAt && (
                    <div className="timeline-item">
                      <Calendar size={16} />
                      <div>
                        <span className="timeline-label">Planejada</span>
                        <span className="timeline-date">
                          {new Date(operacaoSelecionada.scheduledAt).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  )}
                  {operacaoSelecionada.startedAt && (
                    <div className="timeline-item">
                      <Play size={16} />
                      <div>
                        <span className="timeline-label">Iniciada</span>
                        <span className="timeline-date">
                          {new Date(operacaoSelecionada.startedAt).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  )}
                  {operacaoSelecionada.finishedAt && (
                    <div className="timeline-item">
                      <CheckCircle2 size={16} />
                      <div>
                        <span className="timeline-label">Concluída</span>
                        <span className="timeline-date">
                          {new Date(operacaoSelecionada.finishedAt).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Ações */}
            <div className="sheet-actions">
              {operacaoSelecionada.status === 'planejada' && (
                <button className="btn-sheet-action primary">
                  <Play size={18} />
                  Iniciar operação
                </button>
              )}
              {operacaoSelecionada.status === 'em_andamento' && (
                <>
                  <button className="btn-sheet-action">
                    <Pause size={18} />
                    Pausar
                  </button>
                  <button className="btn-sheet-action success">
                    <CheckCircle2 size={18} />
                    Concluir
                  </button>
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default ExecucaoOperacionalPage;
