import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { 
  Plus, Clock, Play, Pause, CheckCircle2, X, MapPin, Package, Users, Calendar,
  Edit, RotateCcw, XCircle
} from 'lucide-react';
import { Dock } from '../components/core/Dock';
import { useAuth } from '../contexts/AuthContext';
import './LinhaExecucaoPage.css';

type StatusOperacao = 'planejada' | 'em_andamento' | 'pausada' | 'concluida' | 'cancelada';
type FiltroView = 'hoje' | 'em_execucao' | 'planejadas' | 'historico';

interface Operacao {
  id: string;
  cliente: string;
  local: string;
  tipo: 'carga' | 'descarga';
  tonelagem: number;
  tonelagemReal?: number;
  status: StatusOperacao;
  scheduledAt?: Date;
  startedAt?: Date;
  finishedAt?: Date;
  equipe: string[];
  source?: 'manual' | 'agenda';
  duracao?: number;
  atrasada?: boolean;
}

const LinhaExecucaoPage: React.FC = () => {
  const { user } = useAuth();
  const [operacoes, setOperacoes] = useState<Operacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroAtivo, setFiltroAtivo] = useState<FiltroView>('hoje');
  const [operacaoSelecionada, setOperacaoSelecionada] = useState<Operacao | null>(null);
  const [showDetalhe, setShowDetalhe] = useState(false);
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
      const mockOperacoes: Operacao[] = [
        {
          id: '1',
          cliente: 'Transportadora ABC',
          local: 'Armazém Central - Setor B',
          tipo: 'descarga',
          tonelagem: 25.5,
          status: 'planejada',
          scheduledAt: new Date(),
          equipe: [],
          source: 'agenda',
          atrasada: false
        },
        {
          id: '2',
          cliente: 'Logística XYZ',
          local: 'Terminal Norte',
          tipo: 'carga',
          tonelagem: 18.0,
          status: 'em_andamento',
          startedAt: new Date(Date.now() - 60 * 60 * 1000),
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
    setOperacoes(prev => prev.map(op => 
      op.id === operacao.id 
        ? { ...op, status: 'em_andamento' as StatusOperacao, startedAt: new Date() }
        : op
    ));
  };

  const handleDetalhe = (operacao: Operacao) => {
    setOperacaoSelecionada(operacao);
    setShowDetalhe(true);
  };

  const handleTouchStart = (e: React.TouchEvent, id: string) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    
    longPressTimer.current = setTimeout(() => {
      const rect = e.currentTarget.getBoundingClientRect();
      setMenuPosition({ x: rect.left + rect.width / 2, y: rect.top });
      setLongPressId(id);
    }, 500);
  };

  const handleTouchMove = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const handleTouchEnd = (e: React.TouchEvent, operacao: Operacao) => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX.current;
    const deltaY = Math.abs(touchEndY - touchStartY.current);

    if (Math.abs(deltaX) > 80 && deltaY < 50) {
      if (deltaX > 0 && operacao.status === 'planejada') {
        handleIniciar(operacao);
      }
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
        <div className="linha-loading">
          <div className="loading-pulse" />
          <p>Carregando operações...</p>
        </div>
        <Dock />
      </>
    );
  }

  return (
    <>
      <div className="linha-execucao">
        {/* Header Editorial Fluido */}
        <header className="header-editorial">
          <h1>Operações</h1>
          <p className="subtexto">Hoje • {planejadas} planejadas • {emExecucao} em execução</p>
          <button className="btn-add-minimal" onClick={() => console.log('Nova')}>
            <Plus size={18} strokeWidth={2.5} />
          </button>
        </header>

        {/* Navegação Editorial */}
        <nav className="nav-editorial">
          <button className={filtroAtivo === 'hoje' ? 'active' : ''} onClick={() => setFiltroAtivo('hoje')}>Hoje</button>
          <button className={filtroAtivo === 'em_execucao' ? 'active' : ''} onClick={() => setFiltroAtivo('em_execucao')}>Em execução</button>
          <button className={filtroAtivo === 'planejadas' ? 'active' : ''} onClick={() => setFiltroAtivo('planejadas')}>Planejadas</button>
          <button className={filtroAtivo === 'historico' ? 'active' : ''} onClick={() => setFiltroAtivo('historico')}>Histórico</button>
        </nav>

        {/* Insight Discreto */}
        {atrasadas > 0 && (
          <div className="insight-discreto">
            <span>{atrasadas} operação{atrasadas > 1 ? 'ões' : ''} com SLA vencido</span>
            <button className="cta-discreto">Ver atrasadas</button>
          </div>
        )}

        {/* Timeline Operacional Viva */}
        <div className="timeline-viva">
          {operacoesFiltradas.length === 0 ? (
            <div className="empty-minimal">
              <Package size={48} strokeWidth={1.5} />
              <p>Nenhuma operação {filtroAtivo}</p>
            </div>
          ) : (
            operacoesFiltradas.map((op, i) => (
              <div
                key={op.id}
                className={`celula ${op.status} ${op.atrasada ? 'atrasada' : ''}`}
                onClick={() => handleDetalhe(op)}
                onTouchStart={(e) => handleTouchStart(e, op.id)}
                onTouchMove={handleTouchMove}
                onTouchEnd={(e) => handleTouchEnd(e, op)}
                style={{ animationDelay: `${i * 0.03}s` }}
              >
                <div className="status-line" />
                <div className="celula-content">
                  <div className="info">
                    <h3>{op.cliente}</h3>
                    <p className="detalhes">{op.local} — {op.tonelagem}t</p>
                    <p className="meta">
                      {op.tipo === 'carga' ? 'Carga' : 'Descarga'}
                      {op.source === 'agenda' && <span className="tag">Agendado</span>}
                    </p>
                  </div>
                  <div className="actions">
                    {op.status === 'planejada' && (
                      <button className="btn-contextual" onClick={(e) => { e.stopPropagation(); handleIniciar(op); }}>
                        Iniciar
                      </button>
                    )}
                    {op.status === 'em_andamento' && (
                      <div className="tempo-vivo">
                        <div className="pulse" />
                        <span>{formatTempo(op.duracao)}</span>
                      </div>
                    )}
                    {op.status === 'concluida' && op.finishedAt && (
                      <span className="data">{new Date(op.finishedAt).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}</span>
                    )}
                  </div>
                </div>
                <div className="separador" />
              </div>
            ))
          )}
        </div>
      </div>
      <Dock />

      {/* Menu Contextual */}
      {longPressId && ReactDOM.createPortal(
        <>
          <div className="menu-overlay" onClick={() => setLongPressId(null)} />
          <div className="menu-nativo" style={{ left: `${menuPosition.x}px`, top: `${menuPosition.y}px`, transform: 'translate(-50%, -100%)' }}>
            <button onClick={() => { handleIniciar(operacoes.find(o => o.id === longPressId)!); setLongPressId(null); }}>
              <Play size={18} />Iniciar
            </button>
            <button onClick={() => setLongPressId(null)}><Edit size={18} />Editar</button>
            <button onClick={() => setLongPressId(null)}><RotateCcw size={18} />Reagendar</button>
            <button className="danger" onClick={() => setLongPressId(null)}><XCircle size={18} />Cancelar</button>
          </div>
        </>,
        document.body
      )}

      {/* Sheet Detalhe */}
      {showDetalhe && operacaoSelecionada && ReactDOM.createPortal(
        <div className="sheet-overlay" onClick={(e) => { if (e.target === e.currentTarget) { setShowDetalhe(false); setOperacaoSelecionada(null); }}}>
          <div className="sheet-fluido">
            <div className="sheet-header">
              <div>
                <h2>{operacaoSelecionada.cliente}</h2>
                <p>{operacaoSelecionada.tipo === 'carga' ? 'Carga' : 'Descarga'} • {operacaoSelecionada.tonelagem}t</p>
              </div>
              <button className="btn-close" onClick={() => { setShowDetalhe(false); setOperacaoSelecionada(null); }}>
                <X size={20} />
              </button>
            </div>
            <div className="sheet-content">
              <section>
                <h3>Resumo</h3>
                <div className="info-grid">
                  <div><span>Local</span><span>{operacaoSelecionada.local}</span></div>
                  <div><span>Tonelagem</span><span>{operacaoSelecionada.tonelagem}t</span></div>
                </div>
              </section>
              <section>
                <h3>Equipe</h3>
                {operacaoSelecionada.equipe.length === 0 ? (
                  <p className="empty">Nenhum colaborador atribuído</p>
                ) : (
                  <div className="equipe">
                    {operacaoSelecionada.equipe.map(m => <div key={m}><Users size={16} /><span>{m}</span></div>)}
                  </div>
                )}
              </section>
            </div>
            <div className="sheet-actions">
              {operacaoSelecionada.status === 'planejada' && (
                <button className="primary"><Play size={18} />Iniciar operação</button>
              )}
              {operacaoSelecionada.status === 'em_andamento' && (
                <>
                  <button><Pause size={18} />Pausar</button>
                  <button className="success"><CheckCircle2 size={18} />Concluir</button>
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

export default LinhaExecucaoPage;
