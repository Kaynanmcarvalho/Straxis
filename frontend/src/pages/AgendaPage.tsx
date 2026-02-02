import React, { useState, useEffect } from 'react';
import { 
  Plus,
  Search,
  Clock,
  MapPin,
  Truck,
  Package,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  TrendingUp,
  XCircle,
  Sunrise,
  Sun,
  Moon,
  ArrowRight
} from 'lucide-react';
import { Dock } from '../components/core/Dock';
import './AgendaPage.css';

type OrigemAgendamento = 'ia' | 'manual';
type StatusAgendamento = 'pendente' | 'confirmado' | 'em_execucao' | 'cancelado';
type PeriodoDia = 'manha' | 'tarde' | 'noite';

interface Agendamento {
  id: string;
  cliente: string;
  local: string;
  data: Date;
  periodoInicio: string;
  periodoFim: string;
  periodo: PeriodoDia;
  tipo: 'carga' | 'descarga';
  volumeEstimado: number;
  origem: OrigemAgendamento;
  status: StatusAgendamento;
  conflitos?: { id: string; cliente: string }[];
  criadoEm: Date;
}

const AgendaPage: React.FC = () => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'pendente' | 'confirmado' | 'conflito'>('todos');
  const [modalAberto, setModalAberto] = useState(false);
  
  // Form state
  const [formCliente, setFormCliente] = useState('');
  const [formData, setFormData] = useState('');
  const [formHorarioInicio, setFormHorarioInicio] = useState('');
  const [formHorarioFim, setFormHorarioFim] = useState('');
  const [formTipo, setFormTipo] = useState<'carga' | 'descarga'>('descarga');
  const [formLocal, setFormLocal] = useState('');
  const [formTonelagem, setFormTonelagem] = useState('');

  // Carregar agendamentos reais do Firebase
  useEffect(() => {
    // TODO: Implementar carregamento de agendamentos do Firebase
    // Por enquanto, inicializa vazio
    setAgendamentos([]);
  }, []);

  // Filtrar e ordenar agendamentos
  const agendamentosFiltrados = agendamentos
    .filter(agendamento => {
      const matchSearch = agendamento.cliente.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agendamento.local.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchStatus = true;
      if (filtroStatus === 'pendente') matchStatus = agendamento.status === 'pendente';
      if (filtroStatus === 'confirmado') matchStatus = agendamento.status === 'confirmado';
      if (filtroStatus === 'conflito') matchStatus = !!agendamento.conflitos && agendamento.conflitos.length > 0;
      
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      // Prioridade: pendentes primeiro, depois confirmados, depois em execução
      const prioridade = { pendente: 0, confirmado: 1, em_execucao: 2, cancelado: 3 };
      return prioridade[a.status] - prioridade[b.status];
    });

  // Agrupar por período
  const agendamentosPorPeriodo = {
    manha: agendamentosFiltrados.filter(a => a.periodo === 'manha'),
    tarde: agendamentosFiltrados.filter(a => a.periodo === 'tarde'),
    noite: agendamentosFiltrados.filter(a => a.periodo === 'noite'),
  };

  const getPeriodoIcon = (periodo: PeriodoDia) => {
    switch (periodo) {
      case 'manha': return Sunrise;
      case 'tarde': return Sun;
      case 'noite': return Moon;
    }
  };

  const getPeriodoLabel = (periodo: PeriodoDia) => {
    switch (periodo) {
      case 'manha': return 'Manhã';
      case 'tarde': return 'Tarde';
      case 'noite': return 'Noite';
    }
  };

  const abrirModalNovo = () => {
    setFormCliente('');
    setFormData('');
    setFormHorarioInicio('');
    setFormHorarioFim('');
    setFormTipo('descarga');
    setFormLocal('');
    setFormTonelagem('');
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
  };

  const salvarAgendamento = () => {
    if (!formCliente.trim() || !formData || !formHorarioInicio) {
      alert('Cliente, data e horário são obrigatórios');
      return;
    }
    // TODO: Integrar com Firebase
    console.log('Salvando agendamento:', { 
      formCliente, formData, formHorarioInicio, formHorarioFim, 
      formTipo, formLocal, formTonelagem 
    });
    fecharModal();
  };

  const confirmarAgendamento = (id: string) => {
    setAgendamentos(prev => prev.map(a => 
      a.id === id ? { ...a, status: 'confirmado' as StatusAgendamento } : a
    ));
  };

  const rejeitarAgendamento = (id: string) => {
    setAgendamentos(prev => prev.map(a => 
      a.id === id ? { ...a, status: 'cancelado' as StatusAgendamento } : a
    ));
  };

  const iniciarTrabalho = (id: string) => {
    setAgendamentos(prev => prev.map(a => 
      a.id === id ? { ...a, status: 'em_execucao' as StatusAgendamento } : a
    ));
  };

  const totalPendentes = agendamentos.filter(a => a.status === 'pendente').length;
  const totalConfirmados = agendamentos.filter(a => a.status === 'confirmado').length;
  const totalConflitos = agendamentos.filter(a => a.conflitos && a.conflitos.length > 0).length;

  return (
    <>
      <div className="page-container agenda-hub">
        {/* Header Compacto */}
        <header className="agenda-header">
          <div className="agenda-title-group">
            <h1 className="agenda-title">Compromissos</h1>
            <div className="agenda-stats-inline">
              <span className="stat-inline pendente">{totalPendentes}</span>
              <span className="stat-inline confirmado">{totalConfirmados}</span>
              {totalConflitos > 0 && <span className="stat-inline conflito">{totalConflitos}</span>}
            </div>
          </div>
          <button className="btn-novo-agendamento" onClick={abrirModalNovo}>
            <Plus className="icon" />
          </button>
        </header>

        {/* Busca Rápida */}
        <div className="search-container">
          <div className="search-wrapper">
            <Search className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Cliente ou local..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="search-clear" onClick={() => setSearchQuery('')}>
                <X className="icon" />
              </button>
            )}
          </div>
        </div>

        {/* Filtros Compactos */}
        <div className="filtros-status">
          <button
            className={`filtro-btn ${filtroStatus === 'todos' ? 'active' : ''}`}
            onClick={() => setFiltroStatus('todos')}
          >
            Todos
          </button>
          <button
            className={`filtro-btn ${filtroStatus === 'pendente' ? 'active' : ''}`}
            onClick={() => setFiltroStatus('pendente')}
          >
            Pendentes
          </button>
          <button
            className={`filtro-btn ${filtroStatus === 'confirmado' ? 'active' : ''}`}
            onClick={() => setFiltroStatus('confirmado')}
          >
            Confirmados
          </button>
          {totalConflitos > 0 && (
            <button
              className={`filtro-btn ${filtroStatus === 'conflito' ? 'active' : ''}`}
              onClick={() => setFiltroStatus('conflito')}
            >
              Conflitos
            </button>
          )}
        </div>

        {/* Fila Operacional */}
        <div className="agenda-fila">
          {['manha', 'tarde', 'noite'].map((periodoKey) => {
            const periodo = periodoKey as PeriodoDia;
            const agendamentosPeriodo = agendamentosPorPeriodo[periodo];
            
            if (agendamentosPeriodo.length === 0) return null;
            
            const PeriodoIcon = getPeriodoIcon(periodo);
            
            return (
              <div key={periodo} className="periodo-section">
                <div className="periodo-header">
                  <PeriodoIcon className="periodo-icon" />
                  <span className="periodo-label">{getPeriodoLabel(periodo)}</span>
                  <span className="periodo-count">{agendamentosPeriodo.length}</span>
                </div>

                <div className="compromissos-list">
                  {agendamentosPeriodo.map((agendamento) => {
                    const temConflito = agendamento.conflitos && agendamento.conflitos.length > 0;
                    const isPendente = agendamento.status === 'pendente';
                    const isConfirmado = agendamento.status === 'confirmado';
                    const isEmExecucao = agendamento.status === 'em_execucao';
                    
                    return (
                      <div 
                        key={agendamento.id} 
                        className={`compromisso-card ${agendamento.status} ${temConflito ? 'conflito' : ''}`}
                      >
                        {/* Linha 1: Cliente + Horário */}
                        <div className="compromisso-header">
                          <h3 className="compromisso-cliente">{agendamento.cliente}</h3>
                          <div className="compromisso-horario">
                            <Clock className="icon" />
                            <span>{agendamento.periodoInicio}</span>
                          </div>
                        </div>

                        {/* Linha 2: Detalhes Operacionais */}
                        <div className="compromisso-detalhes">
                          <div className="detalhe-item">
                            <MapPin className="icon" />
                            <span>{agendamento.local}</span>
                          </div>
                          <div className="detalhe-item">
                            <Truck className="icon" />
                            <span>{agendamento.tipo === 'carga' ? 'Carga' : 'Descarga'}</span>
                          </div>
                          <div className="detalhe-item">
                            <Package className="icon" />
                            <span>{agendamento.volumeEstimado}t</span>
                          </div>
                        </div>

                        {/* Badges e Alertas */}
                        <div className="compromisso-badges">
                          {agendamento.origem === 'ia' && (
                            <div className="badge-ia">
                              <Sparkles className="icon" />
                              <span>IA</span>
                            </div>
                          )}
                          {temConflito && (
                            <div className="badge-conflito">
                              <AlertCircle className="icon" />
                              <span>Conflito com {agendamento.conflitos![0].cliente}</span>
                            </div>
                          )}
                        </div>

                        {/* Ações Diretas */}
                        {isPendente && (
                          <div className="compromisso-acoes">
                            <button 
                              className="acao-btn confirmar"
                              onClick={() => confirmarAgendamento(agendamento.id)}
                            >
                              <CheckCircle2 className="icon" />
                              <span>Confirmar</span>
                            </button>
                            <button 
                              className="acao-btn rejeitar"
                              onClick={() => rejeitarAgendamento(agendamento.id)}
                            >
                              <XCircle className="icon" />
                              <span>Rejeitar</span>
                            </button>
                          </div>
                        )}

                        {isConfirmado && (
                          <div className="compromisso-acoes">
                            <button 
                              className="acao-btn iniciar"
                              onClick={() => iniciarTrabalho(agendamento.id)}
                            >
                              <ArrowRight className="icon" />
                              <span>Iniciar Trabalho</span>
                            </button>
                          </div>
                        )}

                        {isEmExecucao && (
                          <div className="compromisso-status-execucao">
                            <TrendingUp className="icon" />
                            <span>Em execução</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {agendamentosFiltrados.length === 0 && (
          <div className="empty-state-agenda">
            <div className="empty-icon">
              <Clock className="icon" />
            </div>
            <h3 className="empty-titulo">
              {searchQuery ? 'Nenhum compromisso encontrado' : 'Nenhum compromisso hoje'}
            </h3>
            <p className="empty-descricao">
              {searchQuery 
                ? 'Tente buscar por outro cliente ou local' 
                : 'Adicione um compromisso para começar'}
            </p>
            {!searchQuery && (
              <button className="btn-empty-action" onClick={abrirModalNovo}>
                <Plus className="icon" />
                <span>Novo Compromisso</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal - Novo Compromisso */}
      {modalAberto && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Novo Compromisso</h2>
              <button className="modal-close" onClick={fecharModal}>
                <X className="icon" />
              </button>
            </div>

            <div className="modal-body">
              <div className="agendamento-form">
                <div className="form-group">
                  <label className="form-label">Cliente *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Nome do cliente"
                    value={formCliente}
                    onChange={(e) => setFormCliente(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Data *</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData}
                      onChange={(e) => setFormData(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Início *</label>
                    <input
                      type="time"
                      className="form-input"
                      value={formHorarioInicio}
                      onChange={(e) => setFormHorarioInicio(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Fim</label>
                    <input
                      type="time"
                      className="form-input"
                      value={formHorarioFim}
                      onChange={(e) => setFormHorarioFim(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Tipo *</label>
                  <div className="tipo-selector">
                    <button
                      type="button"
                      className={`tipo-option ${formTipo === 'descarga' ? 'active' : ''}`}
                      onClick={() => setFormTipo('descarga')}
                    >
                      <Truck className="icon" />
                      <span>Descarga</span>
                    </button>
                    <button
                      type="button"
                      className={`tipo-option ${formTipo === 'carga' ? 'active' : ''}`}
                      onClick={() => setFormTipo('carga')}
                    >
                      <Truck className="icon" />
                      <span>Carga</span>
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Local</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Galpão, setor, pátio..."
                    value={formLocal}
                    onChange={(e) => setFormLocal(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tonelagem Prevista</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.5"
                    className="form-input"
                    placeholder="0.0"
                    value={formTonelagem}
                    onChange={(e) => setFormTonelagem(e.target.value)}
                  />
                </div>

                <button 
                  className="btn-salvar-agendamento"
                  onClick={salvarAgendamento}
                >
                  <CheckCircle2 className="icon" />
                  <span>Criar Compromisso</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Dock />
    </>
  );
};

export default AgendaPage;
