import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { Plus, Play, Clock, Pause, CheckCircle2, AlertCircle, TrendingUp, Users, Package, MapPin, Timer, ChevronRight, Calendar, X, Building2 } from 'lucide-react';
import { Dock } from '../components/core/Dock';
import { useAuth } from '../contexts/AuthContext';
import trabalhoService, { Trabalho, TrabalhoMetrics } from '../services/trabalho.service';
import { AutocompleteCliente } from '../components/common/AutocompleteCliente';
import './CentralExecucaoPage.css';

interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

const CentralExecucaoPage: React.FC = () => {
  const { user } = useAuth();
  const [trabalhos, setTrabalhos] = useState<Trabalho[]>([]);
  const [metrics, setMetrics] = useState<TrabalhoMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtroAtivo, setFiltroAtivo] = useState<'todas' | 'ativas' | 'planejadas' | 'concluidas'>('todas');
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});
  const [showConfirmModal, setShowConfirmModal] = useState<{ show: boolean; trabalhoId: string; action: string } | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [trabalhoSelecionado, setTrabalhoSelecionado] = useState<Trabalho | null>(null);
  const [createStep, setCreateStep] = useState(1);
  const [createForm, setCreateForm] = useState({
    tipo: 'descarga' as 'carga' | 'descarga',
    clienteId: '',
    clienteNome: '',
    localDescricao: '',
    tonelagemPrevista: 0,
    scheduledAt: '',
    priority: 'normal' as 'normal' | 'alta' | 'critica',
    valorRecebidoCentavos: 0,
    observacoes: '',
  });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const toastIdRef = useRef(0);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = ++toastIdRef.current;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const loadTrabalhos = useCallback(async () => {
    try {
      setLoading(true);
      
      // Tentar carregar do backend
      try {
        const [trabalhosResponse, metricsData] = await Promise.all([
          trabalhoService.list(),
          trabalhoService.getMetrics()
        ]);
        
        setTrabalhos(trabalhosResponse.data);
        setMetrics(metricsData);
      } catch (apiError) {
        console.warn('Backend não disponível, usando dados mockados:', (apiError as Error).message);
        
        // Fallback para dados mockados
        const mockTrabalhos: Trabalho[] = [
          {
            id: '1',
            companyId: user?.companyId || '',
            source: 'agenda_approved',
            status: 'agendado',
            priority: 'alta',
            clienteNome: 'Transportadora ABC Logística',
            localDescricao: 'Armazém Central - Setor B',
            tipo: 'descarga',
            tonelagemPrevista: 25.5,
            tonelagemRealizada: 0,
            scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
            assignees: [],
            registrosPresenca: [],
            pausas: [],
            valorRecebidoCentavos: 0,
            totalPagoCentavos: 0,
            lucroCentavos: 0,
            historico: [],
            observacoes: 'Material frágil - cuidado no manuseio',
            createdBy: user?.uid || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deletedAt: null,
          },
          {
            id: '2',
            companyId: user?.companyId || '',
            source: 'manual',
            status: 'em_andamento',
            priority: 'normal',
            clienteNome: 'Logística XYZ Express',
            localDescricao: 'Terminal Norte - Pátio A',
            tipo: 'carga',
            tonelagemPrevista: 18.0,
            tonelagemRealizada: 0,
            startedAt: new Date(Date.now() - 70 * 60 * 1000).toISOString(),
            assignees: [],
            registrosPresenca: [],
            pausas: [],
            valorRecebidoCentavos: 0,
            totalPagoCentavos: 0,
            lucroCentavos: 0,
            historico: [],
            createdBy: user?.uid || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deletedAt: null,
          }
        ];
        
        setTrabalhos(mockTrabalhos);
        setMetrics({
          total: mockTrabalhos.length,
          emAndamento: 1,
          planejadas: 1,
          concluidas: 0,
          atrasadas: 0,
          totalTonelagem: 43.5,
        });
        
        showToast('Usando dados de demonstração (backend offline)', 'info');
      }
    } catch (error) {
      console.error('Erro ao carregar trabalhos:', error);
      showToast((error as Error).message || 'Erro ao carregar trabalhos', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast, user]);

  useEffect(() => {
    if (user?.companyId) {
      loadTrabalhos();
    }
  }, [user?.companyId, loadTrabalhos]);

  // Auto-refresh a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && user?.companyId) {
        loadTrabalhos();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [loading, user?.companyId, loadTrabalhos]);

  const trabalhosFiltrados = trabalhos.filter(t => {
    if (filtroAtivo === 'todas') return true;
    if (filtroAtivo === 'ativas') return t.status === 'em_andamento' || t.status === 'pausado';
    if (filtroAtivo === 'planejadas') return t.status === 'agendado' || t.status === 'pronto';
    if (filtroAtivo === 'concluidas') return t.status === 'concluido';
    return true;
  });

  const handleIniciar = async (trabalho: Trabalho, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const actionKey = `iniciar-${trabalho.id}`;
    if (actionLoading[actionKey]) return;

    try {
      setActionLoading(prev => ({ ...prev, [actionKey]: true }));
      
      try {
        await trabalhoService.iniciar(trabalho.id);
        showToast('Trabalho iniciado com sucesso', 'success');
      } catch (apiError) {
        // Fallback: atualizar localmente se backend offline
        setTrabalhos(prev => prev.map(t => 
          t.id === trabalho.id 
            ? { ...t, status: 'em_andamento', startedAt: new Date().toISOString() }
            : t
        ));
        showToast('Trabalho iniciado (modo offline)', 'info');
      }
      
      await loadTrabalhos();
    } catch (error) {
      showToast((error as Error).message || 'Erro ao iniciar trabalho', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  const handlePausar = async (trabalho: Trabalho, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const actionKey = `pausar-${trabalho.id}`;
    if (actionLoading[actionKey]) return;

    const motivo = prompt('Motivo da pausa:');
    if (!motivo) return;

    try {
      setActionLoading(prev => ({ ...prev, [actionKey]: true }));
      await trabalhoService.pausar(trabalho.id, motivo);
      showToast('Trabalho pausado', 'success');
      await loadTrabalhos();
    } catch (error) {
      showToast((error as Error).message || 'Erro ao pausar trabalho', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  const handleRetomar = async (trabalho: Trabalho, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const actionKey = `retomar-${trabalho.id}`;
    if (actionLoading[actionKey]) return;

    try {
      setActionLoading(prev => ({ ...prev, [actionKey]: true }));
      await trabalhoService.retomar(trabalho.id);
      showToast('Trabalho retomado', 'success');
      await loadTrabalhos();
    } catch (error) {
      showToast((error as Error).message || 'Erro ao retomar trabalho', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  const handleConcluir = async (trabalho: Trabalho, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirmModal({ show: true, trabalhoId: trabalho.id, action: 'concluir' });
  };

  const confirmConcluir = async () => {
    if (!showConfirmModal) return;
    
    const actionKey = `concluir-${showConfirmModal.trabalhoId}`;
    if (actionLoading[actionKey]) return;

    try {
      setActionLoading(prev => ({ ...prev, [actionKey]: true }));
      await trabalhoService.finalizar(showConfirmModal.trabalhoId);
      showToast('Trabalho concluído com sucesso', 'success');
      await loadTrabalhos();
      setShowConfirmModal(null);
    } catch (error) {
      showToast((error as Error).message || 'Erro ao concluir trabalho', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  const formatTempo = (minutos?: number) => {
    if (!minutos) return '0h00';
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    return `${h}h${m.toString().padStart(2, '0')}`;
  };

  const formatHora = (dateStr?: string) => {
    if (!dateStr) return '--:--';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const calcularDuracao = (startedAt?: string): number => {
    if (!startedAt) return 0;
    const inicio = new Date(startedAt);
    const agora = new Date();
    return Math.floor((agora.getTime() - inicio.getTime()) / (1000 * 60));
  };

  const calcularProgresso = (trabalho: Trabalho): number => {
    if (trabalho.status === 'concluido') return 100;
    if (!trabalho.startedAt) return 0;
    
    const duracao = calcularDuracao(trabalho.startedAt);
    const estimativa = 120; // TODO: pegar do backend
    
    return Math.min(Math.round((duracao / estimativa) * 100), 99);
  };

  const isAtrasado = (trabalho: Trabalho): boolean => {
    if (!trabalho.slaDueAt) return false;
    return new Date(trabalho.slaDueAt) < new Date();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendado':
      case 'pronto': return '#007AFF';
      case 'em_andamento': return '#34C759';
      case 'pausado': return '#FF9500';
      case 'concluido': return '#8E8E93';
      default: return '#8E8E93';
    }
  };

  const canUserEdit = () => {
    return user?.role === 'admin_platform' || user?.role === 'owner';
  };

  const handleDelete = async (trabalhoId: string) => {
    if (!canUserEdit()) {
      showToast('Você não tem permissão para deletar trabalhos', 'error');
      return;
    }

    if (!confirm('Tem certeza que deseja deletar este trabalho?')) {
      return;
    }

    try {
      await trabalhoService.delete(trabalhoId);
      showToast('Trabalho deletado com sucesso', 'success');
      await loadTrabalhos();
    } catch (error) {
      showToast((error as Error).message || 'Erro ao deletar trabalho', 'error');
    }
  };

  const handleOpenDetail = (trabalho: Trabalho) => {
    setTrabalhoSelecionado(trabalho);
    setShowDetailModal(true);
  };

  const handleCreateTrabalho = async () => {
    try {
      if (!createForm.clienteNome || !createForm.localDescricao || createForm.tonelagemPrevista <= 0) {
        showToast('Preencha todos os campos obrigatórios', 'error');
        return;
      }

      setActionLoading(prev => ({ ...prev, 'create': true }));

      const data = {
        ...createForm,
        scheduledAt: createForm.scheduledAt || undefined,
      };

      await trabalhoService.create(data);
      showToast('Trabalho criado com sucesso', 'success');
      setShowCreateModal(false);
      setCreateStep(1);
      setCreateForm({
        tipo: 'descarga',
        clienteId: '',
        clienteNome: '',
        localDescricao: '',
        tonelagemPrevista: 0,
        scheduledAt: '',
        priority: 'normal',
        valorRecebidoCentavos: 0,
        observacoes: '',
      });
      
      await loadTrabalhos();
    } catch (error) {
      console.error('Erro ao criar trabalho:', error);
      showToast((error as Error).message || 'Erro ao criar trabalho', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, 'create': false }));
    }
  };

  const canProceedStep = () => {
    if (createStep === 1) return createForm.clienteNome.length > 0;
    if (createStep === 2) {
      return (
        createForm.localDescricao.length > 0 && 
        createForm.tonelagemPrevista > 0
      );
    }
    return true;
  };

  if (loading) {
    return (
      <>
        <div className="command-loading">
          <div className="loading-pulse">
            <div className="pulse-ring" />
            <div className="pulse-core" />
          </div>
          <p className="loading-text">Carregando operações</p>
        </div>
        <Dock />
      </>
    );
  }

  return (
    <>
      <div className="command-center">
        <header className="hero-header">
          <div className="hero-blur-layer" />
          <div className="hero-content">
            <div className="hero-title-group">
              <h1 className="hero-title">Centro de Comando</h1>
              <p className="hero-subtitle">Operações em tempo real</p>
            </div>
            
            <div className="metrics-grid">
              <div className="metric-cell">
                <div className="metric-icon" style={{ background: 'linear-gradient(135deg, #34C759 0%, #248A3D 100%)' }}>
                  <TrendingUp size={16} strokeWidth={2.5} />
                </div>
                <div className="metric-data">
                  <span className="metric-value">{metrics?.emAndamento || 0}</span>
                  <span className="metric-label">Ativas</span>
                </div>
              </div>
              
              <div className="metric-cell">
                <div className="metric-icon" style={{ background: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)' }}>
                  <Calendar size={16} strokeWidth={2.5} />
                </div>
                <div className="metric-data">
                  <span className="metric-value">{metrics?.planejadas || 0}</span>
                  <span className="metric-label">Planejadas</span>
                </div>
              </div>
              
              <div className="metric-cell">
                <div className="metric-icon" style={{ background: 'linear-gradient(135deg, #8E8E93 0%, #636366 100%)' }}>
                  <Package size={16} strokeWidth={2.5} />
                </div>
                <div className="metric-data">
                  <span className="metric-value">{metrics?.totalTonelagem.toFixed(1) || 0}t</span>
                  <span className="metric-label">Total</span>
                </div>
              </div>
              
              <div className="metric-cell">
                <div className="metric-icon" style={{ background: 'linear-gradient(135deg, #FF3B30 0%, #D70015 100%)' }}>
                  <AlertCircle size={16} strokeWidth={2.5} />
                </div>
                <div className="metric-data">
                  <span className="metric-value">{metrics?.atrasadas || 0}</span>
                  <span className="metric-label">Atrasadas</span>
                </div>
              </div>
            </div>

            <div className="segment-control" ref={scrollRef}>
              <button 
                className={`segment-btn ${filtroAtivo === 'todas' ? 'active' : ''}`}
                onClick={(e) => {
                  setFiltroAtivo('todas');
                  e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }}
              >
                Todas
              </button>
              <button 
                className={`segment-btn ${filtroAtivo === 'ativas' ? 'active' : ''}`}
                onClick={(e) => {
                  setFiltroAtivo('ativas');
                  e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }}
              >
                Ativas
              </button>
              <button 
                className={`segment-btn ${filtroAtivo === 'planejadas' ? 'active' : ''}`}
                onClick={(e) => {
                  setFiltroAtivo('planejadas');
                  e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }}
              >
                Planejadas
              </button>
              <button 
                className={`segment-btn ${filtroAtivo === 'concluidas' ? 'active' : ''}`}
                onClick={(e) => {
                  setFiltroAtivo('concluidas');
                  e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }}
              >
                Concluídas
              </button>
            </div>
          </div>
        </header>

        <button className="fab-command" onClick={() => setShowCreateModal(true)}>
          <Plus size={24} strokeWidth={2.5} />
        </button>

        <div className="operations-stream">
          {trabalhosFiltrados.length === 0 ? (
            <div className="empty-state-command">
              <div className="empty-orb-large" />
              <h3 className="empty-title">Nenhuma operação</h3>
              <p className="empty-description">
                {filtroAtivo === 'todas' 
                  ? 'Comece criando uma nova operação'
                  : `Nenhuma operação ${filtroAtivo === 'ativas' ? 'ativa' : filtroAtivo === 'planejadas' ? 'planejada' : 'concluída'} no momento`
                }
              </p>
            </div>
          ) : (
            trabalhosFiltrados.map((trabalho, i) => {
              const duracao = calcularDuracao(trabalho.startedAt);
              const progresso = calcularProgresso(trabalho);
              const atrasado = isAtrasado(trabalho);
              const statusDisplay = atrasado ? 'atrasada' : trabalho.status;

              return (
                <div
                  key={trabalho.id}
                  className={`operation-card ${statusDisplay} ${trabalho.priority}`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                  onClick={() => handleOpenDetail(trabalho)}
                >
                  <div className="operation-content">
                    <div 
                      className="status-bar-lateral" 
                      style={{ background: getStatusColor(trabalho.status) }}
                    />

                    <div className="operation-header">
                      <div className="header-left">
                        <h3 className="operation-cliente">{trabalho.clienteNome}</h3>
                        <div className="operation-badges">
                          <span className="badge-tipo" style={{ 
                            background: trabalho.tipo === 'carga' ? 'rgba(0, 122, 255, 0.1)' : 'rgba(255, 149, 0, 0.1)',
                            color: trabalho.tipo === 'carga' ? '#007AFF' : '#FF9500'
                          }}>
                            {trabalho.tipo === 'carga' ? 'CARGA' : 'DESCARGA'}
                          </span>
                          {trabalho.source === 'agenda_approved' && (
                            <span className="badge-source">
                              <Calendar size={10} />
                              AGENDADO
                            </span>
                          )}
                          {trabalho.priority === 'alta' && (
                            <span className="badge-priority high">ALTA</span>
                          )}
                          {trabalho.priority === 'critica' && (
                            <span className="badge-priority high">CRÍTICA</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="operation-location">
                      <MapPin size={14} strokeWidth={2} />
                      <span>{trabalho.localDescricao}</span>
                    </div>

                    <div className="data-grid">
                      <div className="data-cell">
                        <span className="data-label">Tonelagem</span>
                        <span className="data-value">{trabalho.tonelagemPrevista}t</span>
                      </div>
                      {trabalho.assignees && trabalho.assignees.length > 0 && (
                        <div className="data-cell">
                          <span className="data-label">Equipe</span>
                          <span className="data-value">
                            <Users size={12} />
                            {trabalho.assignees.length}
                          </span>
                        </div>
                      )}
                      {trabalho.scheduledAt && (trabalho.status === 'agendado' || trabalho.status === 'pronto') && (
                        <div className="data-cell">
                          <span className="data-label">Início</span>
                          <span className="data-value">{formatHora(trabalho.scheduledAt)}</span>
                        </div>
                      )}
                    </div>

                    {(trabalho.status === 'em_andamento' || trabalho.status === 'pausado' || atrasado) && (
                      <>
                        <div className="progress-section">
                          <div className="progress-header">
                            <span className="progress-label">Progresso</span>
                            <span className="progress-percentage">{progresso}%</span>
                          </div>
                          <div className="progress-track">
                            <div 
                              className="progress-fill" 
                              style={{ 
                                width: `${progresso}%`,
                                background: atrasado
                                  ? 'linear-gradient(90deg, #FF3B30 0%, #FF6B60 100%)'
                                  : 'linear-gradient(90deg, #34C759 0%, #30D158 100%)'
                              }}
                            />
                          </div>
                        </div>

                        <div className="timer-display">
                          <div className="timer-icon">
                            <Timer size={16} />
                          </div>
                          <div className="timer-data">
                            <span className="timer-elapsed">{formatTempo(duracao)}</span>
                          </div>
                          {atrasado && (
                            <span className="timer-warning">ATRASADO</span>
                          )}
                        </div>
                      </>
                    )}

                    <div className="operation-actions">
                      {(trabalho.status === 'agendado' || trabalho.status === 'pronto') && (
                        <button 
                          className="action-btn primary"
                          onClick={(e) => handleIniciar(trabalho, e)}
                          disabled={actionLoading[`iniciar-${trabalho.id}`]}
                        >
                          {actionLoading[`iniciar-${trabalho.id}`] ? (
                            <Clock size={16} className="spin" />
                          ) : (
                            <Play size={16} strokeWidth={2.5} />
                          )}
                          Iniciar
                        </button>
                      )}
                      
                      {trabalho.status === 'em_andamento' && (
                        <>
                          <button 
                            className="action-btn secondary"
                            onClick={(e) => handlePausar(trabalho, e)}
                            disabled={actionLoading[`pausar-${trabalho.id}`]}
                          >
                            {actionLoading[`pausar-${trabalho.id}`] ? (
                              <Clock size={16} className="spin" />
                            ) : (
                              <Pause size={16} strokeWidth={2.5} />
                            )}
                            Pausar
                          </button>
                          <button 
                            className="action-btn success"
                            onClick={(e) => handleConcluir(trabalho, e)}
                            disabled={actionLoading[`concluir-${trabalho.id}`]}
                          >
                            {actionLoading[`concluir-${trabalho.id}`] ? (
                              <Clock size={16} className="spin" />
                            ) : (
                              <CheckCircle2 size={16} strokeWidth={2.5} />
                            )}
                            Concluir
                          </button>
                        </>
                      )}
                      
                      {trabalho.status === 'pausado' && (
                        <button 
                          className="action-btn primary"
                          onClick={(e) => handleRetomar(trabalho, e)}
                          disabled={actionLoading[`retomar-${trabalho.id}`]}
                        >
                          {actionLoading[`retomar-${trabalho.id}`] ? (
                            <Clock size={16} className="spin" />
                          ) : (
                            <Play size={16} strokeWidth={2.5} />
                          )}
                          Retomar
                        </button>
                      )}

                      <button className="action-btn ghost">
                        Detalhes
                        <ChevronRight size={16} />
                      </button>

                      {canUserEdit() && (
                        <button 
                          className="action-btn ghost danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(trabalho.id);
                          }}
                        >
                          Deletar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Toast Container */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {t.message}
          </div>
        ))}
      </div>

      {/* Confirm Modal */}
      {showConfirmModal?.show && ReactDOM.createPortal(
        <div className="modal-overlay-command" onClick={() => setShowConfirmModal(null)}>
          <div className="modal-confirm" onClick={(e) => e.stopPropagation()}>
            <h3>Confirmar Conclusão</h3>
            <p>Tem certeza que deseja concluir este trabalho?</p>
            <div className="modal-confirm-actions">
              <button className="btn-cancel" onClick={() => setShowConfirmModal(null)}>
                Cancelar
              </button>
              <button 
                className="btn-confirm" 
                onClick={confirmConcluir}
                disabled={actionLoading[`concluir-${showConfirmModal.trabalhoId}`]}
              >
                {actionLoading[`concluir-${showConfirmModal.trabalhoId}`] ? 'Concluindo...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Create Modal - Wizard Funcional */}
      {showCreateModal && ReactDOM.createPortal(
        <div className="modal-overlay-command" onClick={() => setShowCreateModal(false)}>
          <div className="modal-create-wizard" onClick={(e) => e.stopPropagation()}>
            <div className="wizard-header">
              <h2>Novo Trabalho</h2>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="wizard-steps">
              <div className={`step-indicator ${createStep >= 1 ? 'active' : ''}`}>1</div>
              <div className={`step-line ${createStep >= 2 ? 'active' : ''}`}></div>
              <div className={`step-indicator ${createStep >= 2 ? 'active' : ''}`}>2</div>
              <div className={`step-line ${createStep >= 3 ? 'active' : ''}`}></div>
              <div className={`step-indicator ${createStep >= 3 ? 'active' : ''}`}>3</div>
            </div>

            <div className="wizard-content">
              {/* Step 1: Native Mobile Premium - Redesign Revolucionário */}
              {createStep === 1 && (
                <div className="wizard-step-native">
                  
                  {/* Hero Section com Gradiente */}
                  <div className="native-hero-section">
                    <div className="native-hero-icon">
                      <Package size={28} strokeWidth={2.5} />
                    </div>
                    <h3 className="native-hero-title">Natureza da Operação</h3>
                    <p className="native-hero-subtitle">Selecione o tipo de movimentação</p>
                  </div>

                  {/* Segmented Control iOS Native */}
                  <div className="native-segmented-control">
                    <div className="segmented-track">
                      <div 
                        className="segmented-slider"
                        style={{
                          transform: createForm.tipo === 'carga' ? 'translateX(0)' : 'translateX(100%)'
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      className={`segmented-option ${createForm.tipo === 'carga' ? 'active' : ''}`}
                      onClick={() => setCreateForm({...createForm, tipo: 'carga'})}
                    >
                      <div className="segmented-icon">
                        <Package size={20} strokeWidth={2.5} />
                      </div>
                      <span className="segmented-label">Carga</span>
                    </button>
                    <button
                      type="button"
                      className={`segmented-option ${createForm.tipo === 'descarga' ? 'active' : ''}`}
                      onClick={() => setCreateForm({...createForm, tipo: 'descarga'})}
                    >
                      <div className="segmented-icon">
                        <Package size={20} strokeWidth={2.5} />
                      </div>
                      <span className="segmented-label">Descarga</span>
                    </button>
                  </div>

                  {/* Divider Sutil */}
                  <div className="native-divider" />

                  {/* Cliente Section Premium */}
                  <div className="native-client-section">
                    <div className="native-section-header">
                      <div className="section-header-icon">
                        <Building2 size={18} strokeWidth={2.5} />
                      </div>
                      <span className="section-header-title">Responsável Financeiro</span>
                    </div>
                    
                    {!createForm.clienteId ? (
                      <div className="native-search-container">
                        <div className="native-search-wrapper">
                          <div className="native-search-icon">
                            <Building2 size={18} strokeWidth={2.5} />
                          </div>
                          <AutocompleteCliente
                            value={createForm.clienteNome}
                            onChange={(value) => setCreateForm({...createForm, clienteNome: value})}
                            onSelect={(cliente) => {
                              setCreateForm({
                                ...createForm,
                                clienteId: cliente.id,
                                clienteNome: cliente.nome,
                              });
                            }}
                            placeholder="Buscar cliente"
                            autoFocus={false}
                            className="native-search-input"
                          />
                        </div>
                        <p className="native-search-hint">Digite o nome do cliente para buscar</p>
                      </div>
                    ) : (
                      <div className="native-client-card">
                        <div className="native-client-avatar">
                          <Building2 size={22} strokeWidth={2.5} />
                        </div>
                        <div className="native-client-info">
                          <span className="native-client-name">{createForm.clienteNome}</span>
                          <span className="native-client-status">
                            <span className="status-dot" />
                            Cliente ativo
                          </span>
                        </div>
                        <button
                          type="button"
                          className="native-client-remove"
                          onClick={() => setCreateForm({...createForm, clienteId: '', clienteNome: ''})}
                        >
                          <X size={18} strokeWidth={2.5} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Operacional - Reconstruído Premium */}
              {createStep === 2 && (
                <div className="wizard-step">
                  <h3 className="step-title">Dados Operacionais</h3>
                  
                  {/* BLOCO A — LOCAL */}
                  <div className="operational-block">
                    <div className="block-icon">
                      <MapPin size={20} strokeWidth={2} />
                    </div>
                    <div className="block-content">
                      <input
                        type="text"
                        className="block-input"
                        placeholder="Local de operação"
                        value={createForm.localDescricao}
                        onChange={(e) => setCreateForm({...createForm, localDescricao: e.target.value})}
                      />
                      <span className="block-hint">Endereço ou descrição do local</span>
                    </div>
                  </div>

                  {/* BLOCO B — TONELAGEM */}
                  <div className="operational-block-centered">
                    <span className="block-hint-centered">Tonelagem prevista</span>
                    <div className="stepper-control-centered">
                      <button
                        type="button"
                        className="stepper-btn"
                        onClick={() => setCreateForm({
                          ...createForm, 
                          tonelagemPrevista: Math.max(0, createForm.tonelagemPrevista - 0.5)
                        })}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        className="stepper-value"
                        value={createForm.tonelagemPrevista || ''}
                        onChange={(e) => setCreateForm({
                          ...createForm, 
                          tonelagemPrevista: Math.max(0, parseFloat(e.target.value) || 0)
                        })}
                        min="0"
                        step="0.1"
                      />
                      <span className="stepper-unit">t</span>
                      <button
                        type="button"
                        className="stepper-btn"
                        onClick={() => setCreateForm({
                          ...createForm, 
                          tonelagemPrevista: createForm.tonelagemPrevista + 0.5
                        })}
                      >
                        +
                      </button>
                    </div>
                    {createForm.tonelagemPrevista > 50 && (
                      <div className="block-insight-premium">
                        <div className="insight-icon">
                          <AlertCircle size={18} strokeWidth={2.5} />
                        </div>
                        <span className="insight-text">Operação de grande porte — considere equipe adicional</span>
                      </div>
                    )}
                  </div>

                  {/* BLOCO C — PRIORIDADE */}
                  <div className="operational-block priority-block">
                    <div className="block-content">
                      <div className="priority-selector">
                        <button
                          type="button"
                          className={`priority-btn ${createForm.priority === 'normal' ? 'active' : ''}`}
                          onClick={() => setCreateForm({...createForm, priority: 'normal'})}
                        >
                          Normal
                        </button>
                        <button
                          type="button"
                          className={`priority-btn ${createForm.priority === 'alta' ? 'active' : ''}`}
                          onClick={() => setCreateForm({...createForm, priority: 'alta'})}
                        >
                          Alta
                        </button>
                        <button
                          type="button"
                          className={`priority-btn ${createForm.priority === 'critica' ? 'active' : ''}`}
                          onClick={() => setCreateForm({...createForm, priority: 'critica'})}
                        >
                          Urgente
                        </button>
                      </div>
                      <span className="block-hint">Nível de prioridade</span>
                    </div>
                  </div>

                  {/* BLOCO D — DATA E HORA */}
                  <div className="operational-block">
                    <div className="block-icon">
                      <Calendar size={20} strokeWidth={2} />
                    </div>
                    <div className="block-content">
                      <input
                        type="datetime-local"
                        className="datetime-input"
                        value={createForm.scheduledAt}
                        onChange={(e) => setCreateForm({...createForm, scheduledAt: e.target.value})}
                      />
                      {createForm.scheduledAt && (
                        <div className="datetime-preview">
                          {new Date(createForm.scheduledAt).toLocaleDateString('pt-BR', { 
                            day: '2-digit', 
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                          {new Date(createForm.scheduledAt).toDateString() === new Date().toDateString() && (
                            <span className="today-badge">Hoje</span>
                          )}
                        </div>
                      )}
                      <span className="block-hint">Data e hora agendada (opcional)</span>
                    </div>
                  </div>

                  {/* BLOCO E — VALOR RECEBIDO */}
                  <div className="operational-block">
                    <div className="block-icon">
                      <span className="currency-symbol">R$</span>
                    </div>
                    <div className="block-content">
                      <input
                        type="number"
                        className="financial-input"
                        placeholder="0,00"
                        value={createForm.valorRecebidoCentavos / 100 || ''}
                        onChange={(e) => setCreateForm({
                          ...createForm, 
                          valorRecebidoCentavos: Math.max(0, Math.round(parseFloat(e.target.value || '0') * 100))
                        })}
                        min="0"
                        step="0.01"
                      />
                      <span className="block-hint">Valor recebido (opcional)</span>
                      {createForm.valorRecebidoCentavos > 0 && (
                        <div className="financial-preview">
                          <span className="financial-label">Valor total:</span>
                          <span className="financial-value">
                            {new Intl.NumberFormat('pt-BR', { 
                              style: 'currency', 
                              currency: 'BRL' 
                            }).format(createForm.valorRecebidoCentavos / 100)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Review Native Premium - Redesign Revolucionário */}
              {createStep === 3 && (
                <div className="wizard-step-native">
                  
                  {/* Hero Review Header */}
                  <div className="review-hero-header">
                    <div className="review-hero-icon">
                      <CheckCircle2 size={26} strokeWidth={2.5} />
                    </div>
                    <h3 className="review-hero-title">Confirmação da Operação</h3>
                    <p className="review-hero-subtitle">Revise os detalhes antes de criar</p>
                  </div>

                  {/* Identity Card Premium */}
                  <div className="review-identity-card">
                    <div className="identity-card-header">
                      <span className={`identity-type-badge ${createForm.tipo}`}>
                        <Package size={14} strokeWidth={2.5} />
                        {createForm.tipo === 'carga' ? 'Carga' : 'Descarga'}
                      </span>
                    </div>
                    <h4 className="identity-client-name">{createForm.clienteNome}</h4>
                    <div className="identity-location">
                      <MapPin size={16} strokeWidth={2.5} />
                      <span>{createForm.localDescricao}</span>
                    </div>
                  </div>

                  {/* Data Grid Premium */}
                  <div className="review-data-section">
                    <div className="review-section-label">Detalhes Operacionais</div>
                    <div className="review-data-cards">
                      <div className="review-data-card">
                        <div className="data-card-icon blue">
                          <Package size={18} strokeWidth={2.5} />
                        </div>
                        <div className="data-card-content">
                          <span className="data-card-label">Tonelagem</span>
                          <span className="data-card-value">{createForm.tonelagemPrevista}t</span>
                        </div>
                      </div>
                      
                      <div className="review-data-card">
                        <div className="data-card-icon purple">
                          <TrendingUp size={18} strokeWidth={2.5} />
                        </div>
                        <div className="data-card-content">
                          <span className="data-card-label">Prioridade</span>
                          <span className="data-card-value">{createForm.priority}</span>
                        </div>
                      </div>
                    </div>

                    {createForm.scheduledAt && (
                      <div className="review-data-card full">
                        <div className="data-card-icon green">
                          <Calendar size={18} strokeWidth={2.5} />
                        </div>
                        <div className="data-card-content">
                          <span className="data-card-label">Agendamento</span>
                          <span className="data-card-value">
                            {new Date(createForm.scheduledAt).toLocaleDateString('pt-BR', { 
                              day: '2-digit', 
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                            {new Date(createForm.scheduledAt).toDateString() === new Date().toDateString() && (
                              <span className="today-pill">Hoje</span>
                            )}
                          </span>
                        </div>
                      </div>
                    )}

                    {createForm.valorRecebidoCentavos > 0 && (
                      <div className="review-data-card full financial">
                        <div className="data-card-icon gold">
                          <span className="currency-symbol-icon">R$</span>
                        </div>
                        <div className="data-card-content">
                          <span className="data-card-label">Valor Recebido</span>
                          <span className="data-card-value financial-value">
                            {new Intl.NumberFormat('pt-BR', { 
                              style: 'currency', 
                              currency: 'BRL' 
                            }).format(createForm.valorRecebidoCentavos / 100)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Insight Premium */}
                  {createForm.tonelagemPrevista > 50 && (
                    <div className="review-insight-premium">
                      <div className="insight-premium-icon">
                        <AlertCircle size={18} strokeWidth={2.5} />
                      </div>
                      <span className="insight-premium-text">Operação de grande porte — considere equipe adicional</span>
                    </div>
                  )}

                  {/* Observações Native */}
                  <div className="review-notes-section">
                    <div className="review-section-label">Observações</div>
                    <div className="native-textarea-wrapper">
                      <textarea
                        className="native-textarea"
                        placeholder="Adicione observações sobre esta operação (opcional)"
                        rows={4}
                        value={createForm.observacoes}
                        onChange={(e) => setCreateForm({...createForm, observacoes: e.target.value})}
                      />
                      <div className="textarea-char-count">
                        {createForm.observacoes.length} caracteres
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="wizard-actions">
              {createStep > 1 && (
                <button
                  className="wizard-btn secondary"
                  onClick={() => setCreateStep(createStep - 1)}
                >
                  Voltar
                </button>
              )}
              
              {createStep < 3 ? (
                <button
                  className="wizard-btn primary"
                  onClick={() => setCreateStep(createStep + 1)}
                  disabled={!canProceedStep()}
                >
                  Próximo
                </button>
              ) : (
                <button
                  className="wizard-btn primary create-operation"
                  onClick={handleCreateTrabalho}
                  disabled={actionLoading['create']}
                >
                  {actionLoading['create'] ? (
                    <>
                      <Clock size={24} strokeWidth={2.5} className="spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={24} strokeWidth={2.5} />
                      Criar Operação
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal Detalhes - Design Premium Nativo */}
      {showDetailModal && trabalhoSelecionado && ReactDOM.createPortal(
        <div className="modal-overlay-command" onClick={() => setShowDetailModal(false)}>
          <div className="premium-detail-modal" onClick={(e) => e.stopPropagation()}>
            
            {/* Hero Header com Glassmorphism */}
            <div className="premium-hero">
              <button className="premium-close" onClick={() => setShowDetailModal(false)}>
                <X size={18} strokeWidth={2.5} />
              </button>
              
              <div className="premium-hero-content">
                <div className="premium-badge-row">
                  <span className={`premium-type-badge ${trabalhoSelecionado.tipo}`}>
                    <Package size={12} strokeWidth={2.5} />
                    {trabalhoSelecionado.tipo === 'carga' ? 'Carga' : 'Descarga'}
                  </span>
                  <span className={`premium-status-badge status-${trabalhoSelecionado.status}`}>
                    {trabalhoSelecionado.status}
                  </span>
                </div>
                
                <h1 className="premium-title">{trabalhoSelecionado.clienteNome}</h1>
                
                <div className="premium-location">
                  <MapPin size={14} strokeWidth={2.5} />
                  <span>{trabalhoSelecionado.localDescricao}</span>
                </div>
              </div>
            </div>

            {/* Scroll Content */}
            <div className="premium-scroll">
              
              {/* Stats Cards Grid */}
              <div className="premium-stats-grid">
                <div className="premium-stat-card">
                  <div className="stat-icon-wrapper blue">
                    <Package size={18} strokeWidth={2.5} />
                  </div>
                  <div className="stat-content">
                    <span className="stat-label">Tonelagem</span>
                    <span className="stat-value">{trabalhoSelecionado.tonelagemPrevista}t</span>
                  </div>
                </div>
                
                <div className="premium-stat-card">
                  <div className="stat-icon-wrapper purple">
                    <TrendingUp size={18} strokeWidth={2.5} />
                  </div>
                  <div className="stat-content">
                    <span className="stat-label">Prioridade</span>
                    <span className="stat-value">{trabalhoSelecionado.priority}</span>
                  </div>
                </div>
                
                {trabalhoSelecionado.assignees && trabalhoSelecionado.assignees.length > 0 && (
                  <div className="premium-stat-card">
                    <div className="stat-icon-wrapper green">
                      <Users size={18} strokeWidth={2.5} />
                    </div>
                    <div className="stat-content">
                      <span className="stat-label">Equipe</span>
                      <span className="stat-value">{trabalhoSelecionado.assignees.length} pessoas</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Timeline Section */}
              <div className="premium-section">
                <div className="premium-section-header">
                  <Clock size={16} strokeWidth={2.5} />
                  <h3 className="premium-section-title">Linha do Tempo</h3>
                </div>
                
                <div className="premium-timeline-horizontal">
                  <div className="timeline-track-horizontal" />
                  
                  <div className="timeline-step completed">
                    <div className="timeline-step-dot">
                      <div className="timeline-step-pulse" />
                    </div>
                    <div className="timeline-step-info">
                      <span className="timeline-step-label">Criado</span>
                      <span className="timeline-step-date">
                        {new Date(trabalhoSelecionado.createdAt).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        }).replace(',', '')}
                      </span>
                    </div>
                  </div>
                  
                  {trabalhoSelecionado.scheduledAt && (
                    <div className={`timeline-step ${trabalhoSelecionado.startedAt ? 'completed' : 'pending'}`}>
                      <div className="timeline-step-dot">
                        {trabalhoSelecionado.startedAt && <div className="timeline-step-pulse" />}
                      </div>
                      <div className="timeline-step-info">
                        <span className="timeline-step-label">Agendado</span>
                        <span className="timeline-step-date">
                          {new Date(trabalhoSelecionado.scheduledAt).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          }).replace(',', '')}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {trabalhoSelecionado.startedAt && (
                    <div className={`timeline-step ${trabalhoSelecionado.finishedAt ? 'completed' : 'active'}`}>
                      <div className="timeline-step-dot">
                        <div className="timeline-step-pulse" />
                      </div>
                      <div className="timeline-step-info">
                        <span className="timeline-step-label">Iniciado</span>
                        <span className="timeline-step-date">
                          {new Date(trabalhoSelecionado.startedAt).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          }).replace(',', '')}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {trabalhoSelecionado.finishedAt && (
                    <div className="timeline-step completed">
                      <div className="timeline-step-dot">
                        <div className="timeline-step-pulse" />
                      </div>
                      <div className="timeline-step-info">
                        <span className="timeline-step-label">Concluído</span>
                        <span className="timeline-step-date">
                          {new Date(trabalhoSelecionado.finishedAt).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          }).replace(',', '')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Financial Section */}
              <div className="premium-section">
                <div className="premium-section-header">
                  <span className="currency-icon">R$</span>
                  <h3 className="premium-section-title">Financeiro</h3>
                </div>
                
                <div className="premium-financial-card">
                  <div className="financial-row">
                    <div className="financial-item">
                      <span className="financial-label">Recebido</span>
                      <span className="financial-value positive">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                          .format(trabalhoSelecionado.valorRecebidoCentavos / 100)}
                      </span>
                    </div>
                    <div className="financial-divider" />
                    <div className="financial-item">
                      <span className="financial-label">Pago</span>
                      <span className="financial-value negative">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                          .format(trabalhoSelecionado.totalPagoCentavos / 100)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="financial-total">
                    <span className="financial-total-label">Lucro Líquido</span>
                    <span className={`financial-total-value ${
                      trabalhoSelecionado.lucroCentavos > 0 ? 'profit' : 
                      trabalhoSelecionado.lucroCentavos < 0 ? 'loss' : 'neutral'
                    }`}>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                        .format(trabalhoSelecionado.lucroCentavos / 100)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Observações */}
              {trabalhoSelecionado.observacoes && (
                <div className="premium-section">
                  <div className="premium-section-header">
                    <AlertCircle size={16} strokeWidth={2.5} />
                    <h3 className="premium-section-title">Observações</h3>
                  </div>
                  <div className="premium-obs-card">
                    <p className="premium-obs-text">{trabalhoSelecionado.observacoes}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="premium-actions">
              {(trabalhoSelecionado.status === 'agendado' || trabalhoSelecionado.status === 'pronto') && (
                <>
                  <button 
                    className="premium-btn primary"
                    onClick={(e) => {
                      setShowDetailModal(false);
                      handleIniciar(trabalhoSelecionado, e);
                    }}
                    disabled={actionLoading[`iniciar-${trabalhoSelecionado.id}`]}
                  >
                    <Play size={18} strokeWidth={2.5} />
                    <span>Iniciar Operação</span>
                  </button>
                  <button 
                    className="premium-btn ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDetailModal(false);
                      handleDelete(trabalhoSelecionado.id);
                    }}
                  >
                    Cancelar
                  </button>
                </>
              )}

              {trabalhoSelecionado.status === 'em_andamento' && (
                <>
                  <button 
                    className="premium-btn secondary"
                    onClick={(e) => {
                      setShowDetailModal(false);
                      handlePausar(trabalhoSelecionado, e);
                    }}
                    disabled={actionLoading[`pausar-${trabalhoSelecionado.id}`]}
                  >
                    <Pause size={18} strokeWidth={2.5} />
                    <span>Pausar</span>
                  </button>
                  <button 
                    className="premium-btn primary"
                    onClick={(e) => {
                      setShowDetailModal(false);
                      handleConcluir(trabalhoSelecionado, e);
                    }}
                    disabled={actionLoading[`concluir-${trabalhoSelecionado.id}`]}
                  >
                    <CheckCircle2 size={18} strokeWidth={2.5} />
                    <span>Concluir</span>
                  </button>
                </>
              )}

              {trabalhoSelecionado.status === 'pausado' && (
                <button 
                  className="premium-btn primary full"
                  onClick={(e) => {
                    setShowDetailModal(false);
                    handleRetomar(trabalhoSelecionado, e);
                  }}
                  disabled={actionLoading[`retomar-${trabalhoSelecionado.id}`]}
                >
                  <Play size={18} strokeWidth={2.5} />
                  <span>Retomar Operação</span>
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      <Dock />
    </>
  );
};

export default CentralExecucaoPage;
