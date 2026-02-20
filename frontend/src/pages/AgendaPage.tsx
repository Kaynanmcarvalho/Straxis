import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Truck,
  Package,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  XCircle,
  PlayCircle,
  AlertTriangle,
  Minus
} from 'lucide-react';
import { Dock } from '../components/core/Dock';
import { useAuth } from '../contexts/AuthContext';
import { agendamentoService } from '../services/agendamento.service';
import { Agendamento, AgendamentoConflito } from '../types/agendamento.types';
import { AutocompleteCliente } from '../components/common/AutocompleteCliente';
import './AgendaPage.css';

const AgendaPage: React.FC = () => {
  const { user } = useAuth();
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [diaSelecionado, setDiaSelecionado] = useState(0); // 0 = hoje
  const [modalAberto, setModalAberto] = useState(false);
  const [modalAcao, setModalAcao] = useState<{
    show: boolean;
    tipo: 'aprovar' | 'rejeitar' | 'converter';
    agendamentoId: string;
  } | null>(null);
  const [motivoRejeicao, setMotivoRejeicao] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Form state
  const [formClienteId, setFormClienteId] = useState('');
  const [formClienteNome, setFormClienteNome] = useState('');
  const [formData, setFormData] = useState('');
  const [formHorarioInicio, setFormHorarioInicio] = useState('');
  const [formHorarioFim, setFormHorarioFim] = useState('');
  const [formTipo, setFormTipo] = useState<'carga' | 'descarga'>('descarga');
  const [formLocal, setFormLocal] = useState('');
  const [formTonelagem, setFormTonelagem] = useState('');
  const [conflitosDetectados, setConflitosDetectados] = useState<AgendamentoConflito[]>([]);

  const loadAgendamentos = useCallback(async () => {
    if (!user?.companyId) return;
    
    try {
      setLoading(true);
      const data = await agendamentoService.list();
      setAgendamentos(data);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.companyId]);

  useEffect(() => {
    loadAgendamentos();
  }, [loadAgendamentos]);

  // Gerar dias da semana
  const getDiasSemana = () => {
    const dias = [];
    const hoje = new Date();
    
    for (let i = -3; i <= 10; i++) {
      const data = new Date(hoje);
      data.setDate(hoje.getDate() + i);
      dias.push({
        offset: i,
        data,
        diaSemana: data.toLocaleDateString('pt-BR', { weekday: 'short' }).toUpperCase(),
        dia: data.getDate(),
        mes: data.toLocaleDateString('pt-BR', { month: 'short' }),
        isHoje: i === 0
      });
    }
    
    return dias;
  };

  const dias = getDiasSemana();
  const diaAtual = dias.find(d => d.offset === diaSelecionado);

  // Filtrar agendamentos do dia selecionado
  const agendamentosDoDia = agendamentos.filter(ag => {
    const dataAg = new Date(ag.data);
    const dataSel = diaAtual?.data;
    if (!dataSel) return false;
    
    return dataAg.getDate() === dataSel.getDate() &&
           dataAg.getMonth() === dataSel.getMonth() &&
           dataAg.getFullYear() === dataSel.getFullYear();
  }).sort((a, b) => a.horarioInicio.localeCompare(b.horarioInicio));

  const totalPendentes = agendamentos.filter(a => a.status === 'pendente' || a.status === 'solicitado').length;
  const totalConflitos = agendamentos.filter(a => a.conflitoDetectado).length;

  const navegarDia = (direcao: number) => {
    setDiaSelecionado(prev => prev + direcao);
    if (navigator.vibrate) navigator.vibrate(10);
  };

  const selecionarDia = (offset: number) => {
    setDiaSelecionado(offset);
    if (navigator.vibrate) navigator.vibrate(10);
  };

  const abrirModalNovo = () => {
    const dataInicial = diaAtual?.data || new Date();
    setFormData(dataInicial.toISOString().split('T')[0]);
    setFormClienteId('');
    setFormClienteNome('');
    setFormHorarioInicio('');
    setFormHorarioFim('');
    setFormTipo('descarga');
    setFormLocal('');
    setFormTonelagem('');
    setConflitosDetectados([]);
    setModalAberto(true);
  };

  const salvarAgendamento = async () => {
    if (!formClienteNome.trim() || !formData || !formHorarioInicio || !formHorarioFim || !formLocal.trim()) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    if (!formTonelagem || parseFloat(formTonelagem) <= 0) {
      alert('Tonelagem deve ser maior que zero');
      return;
    }

    try {
      const dataHora = new Date(formData);
      
      const resultado = await agendamentoService.create({
        origem: 'manual',
        clienteId: formClienteId || undefined,
        clienteNome: formClienteNome,
        data: dataHora,
        horarioInicio: formHorarioInicio,
        horarioFim: formHorarioFim,
        tipo: formTipo,
        localDescricao: formLocal,
        tonelagem: parseFloat(formTonelagem),
        valorEstimadoCentavos: 0,
        funcionarios: [],
        prioridade: 'normal',
        conflitoDetectado: false,
        conflitos: [],
        convertidoEmTrabalho: false,
        historico: []
      });
      
      if (resultado.disponibilidade.conflitos.length > 0) {
        setConflitosDetectados(resultado.disponibilidade.conflitos);
      }
      
      await loadAgendamentos();
      setModalAberto(false);
      if (navigator.vibrate) navigator.vibrate([10, 50, 10]);
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      alert('Erro ao criar agendamento');
    }
  };

  const executarAcao = async () => {
    if (!modalAcao) return;

    try {
      if (modalAcao.tipo === 'aprovar') {
        await agendamentoService.aprovar(modalAcao.agendamentoId);
      } else if (modalAcao.tipo === 'rejeitar') {
        if (!motivoRejeicao.trim()) {
          alert('Motivo da rejeição é obrigatório');
          return;
        }
        await agendamentoService.rejeitar(modalAcao.agendamentoId, motivoRejeicao);
      } else if (modalAcao.tipo === 'converter') {
        await agendamentoService.converter(modalAcao.agendamentoId);
      }
      
      await loadAgendamentos();
      setModalAcao(null);
      setMotivoRejeicao('');
      if (navigator.vibrate) navigator.vibrate([10, 50, 10]);
    } catch (error) {
      console.error('Erro ao executar ação:', error);
      alert('Erro ao executar ação');
    }
  };

  if (loading) {
    return (
      <>
        <div className="agenda-premium-container">
          <div className="agenda-loading">
            <div className="loading-spinner-premium" />
          </div>
        </div>
        <Dock />
      </>
    );
  }

  return (
    <>
      <div className="agenda-premium-container">
        {/* Header Premium com Profundidade */}
        <header className="agenda-premium-header">
          <div className="agenda-header-blur" />
          <div className="agenda-header-content">
            <h1 className="agenda-premium-title">Centro de Planejamento</h1>
            <p className="agenda-premium-subtitle">
              {diaAtual?.isHoje ? 'Hoje' : diaAtual?.diaSemana} • {agendamentosDoDia.length} compromisso{agendamentosDoDia.length !== 1 ? 's' : ''}
              <br />
              <span className="agenda-date-full">
                {diaAtual?.data.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
            </p>
          </div>
        </header>

        {/* Insights Inteligentes */}
        {(totalPendentes > 0 || totalConflitos > 0) && (
          <div className="agenda-insights">
            {totalPendentes > 0 && (
              <div className="insight-card pendente">
                <AlertCircle size={20} />
                <div className="insight-text">
                  <strong>{totalPendentes} solicitaç{totalPendentes === 1 ? 'ão' : 'ões'} aguardando aprovação</strong>
                  <span>Revisar agendamentos pendentes</span>
                </div>
              </div>
            )}
            {totalConflitos > 0 && (
              <div className="insight-card conflito">
                <AlertTriangle size={20} />
                <div className="insight-text">
                  <strong>{totalConflitos} conflito{totalConflitos !== 1 ? 's' : ''} detectado{totalConflitos !== 1 ? 's' : ''}</strong>
                  <span>Atenção necessária</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navegação de Dias Premium */}
        <div className="agenda-nav-dias">
          <button 
            className="nav-dia-btn"
            onClick={() => navegarDia(-1)}
            aria-label="Dia anterior"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>

          <div className="dias-scroll-container" ref={scrollRef}>
            <div className="dias-scroll">
              {dias.map((dia) => (
                <button
                  key={dia.offset}
                  className={`dia-pill ${dia.offset === diaSelecionado ? 'active' : ''} ${dia.isHoje ? 'hoje' : ''}`}
                  onClick={() => selecionarDia(dia.offset)}
                >
                  <span className="dia-semana">{dia.diaSemana}</span>
                  <span className="dia-numero">{dia.dia}</span>
                  {dia.isHoje && <div className="dia-indicator" />}
                </button>
              ))}
            </div>
          </div>

          <button 
            className="nav-dia-btn"
            onClick={() => navegarDia(1)}
            aria-label="Próximo dia"
          >
            <ChevronRight size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Timeline Vertical Premium */}
        <div className="agenda-timeline-container">
          {agendamentosDoDia.length === 0 ? (
            <div className="agenda-empty-premium">
              <div className="empty-icon-premium">
                <Clock size={48} strokeWidth={1.5} />
              </div>
              <h3 className="empty-title-premium">
                {diaAtual?.isHoje ? 'Hoje está livre' : 'Nenhum compromisso'}
              </h3>
              <p className="empty-subtitle-premium">
                {diaAtual?.isHoje 
                  ? 'Organize sua próxima operação ou cobrança'
                  : 'Não há compromissos agendados para este dia'
                }
              </p>
              <button className="btn-empty-premium" onClick={abrirModalNovo}>
                <Plus size={20} strokeWidth={2.5} />
                <span>Criar compromisso</span>
              </button>
            </div>
          ) : (
            <div className="agenda-timeline">
              {agendamentosDoDia.map((agendamento, index) => {
                const isPendente = agendamento.status === 'pendente' || agendamento.status === 'solicitado';
                const isAprovado = agendamento.status === 'aprovado';
                const isConvertido = agendamento.status === 'convertido';
                const temConflito = agendamento.conflitoDetectado;
                const isIA = agendamento.origem === 'ia' || agendamento.origem === 'whatsapp';
                
                return (
                  <div key={agendamento.id} className="timeline-entry-premium">
                    {/* Linha vertical */}
                    {index < agendamentosDoDia.length - 1 && <div className="timeline-line" />}
                    
                    {/* Marcador circular */}
                    <div className={`timeline-marker ${agendamento.status} ${temConflito ? 'conflito' : ''}`}>
                      <div className="marker-inner" />
                    </div>

                    {/* Bloco de Agendamento Premium */}
                    <div className={`agendamento-block ${agendamento.tipo} ${agendamento.status} ${temConflito ? 'com-conflito' : ''}`}>
                      {/* Barra lateral de prioridade */}
                      {agendamento.prioridade === 'alta' && <div className="priority-bar alta" />}
                      {agendamento.prioridade === 'critica' && <div className="priority-bar critica" />}
                      
                      {/* Camada 1: Horário */}
                      <div className="block-horario">
                        <Clock size={16} strokeWidth={2} />
                        <span>{agendamento.horarioInicio}</span>
                        <span className="horario-separator">—</span>
                        <span>{agendamento.horarioFim}</span>
                      </div>

                      {/* Camada 2: Cliente e Badges */}
                      <div className="block-header">
                        <h3 className="block-cliente">{agendamento.clienteNome}</h3>
                        <div className="block-badges">
                          {isIA && (
                            <div className="badge-ia-premium">
                              <Sparkles size={12} strokeWidth={2.5} />
                              <span>IA</span>
                            </div>
                          )}
                          {isPendente && (
                            <div className="badge-status pendente">
                              Aguardando
                            </div>
                          )}
                          {isAprovado && (
                            <div className="badge-status aprovado">
                              Aprovado
                            </div>
                          )}
                          {isConvertido && (
                            <div className="badge-status convertido">
                              Em execução
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Camada 3: Detalhes Operacionais */}
                      <div className="block-detalhes">
                        <div className="detalhe-row">
                          <div className="detalhe-item-premium">
                            <Truck size={14} strokeWidth={2} />
                            <span>{agendamento.tipo === 'carga' ? 'Carga' : 'Descarga'}</span>
                          </div>
                          <div className="detalhe-item-premium">
                            <Package size={14} strokeWidth={2} />
                            <span>{agendamento.tonelagem}t</span>
                          </div>
                        </div>
                        <div className="detalhe-row">
                          <div className="detalhe-item-premium local">
                            <MapPin size={14} strokeWidth={2} />
                            <span>{agendamento.localDescricao}</span>
                          </div>
                        </div>
                      </div>

                      {/* Conflitos */}
                      {temConflito && agendamento.conflitos.length > 0 && (
                        <div className="block-conflitos">
                          <AlertTriangle size={16} strokeWidth={2} />
                          <span>{agendamento.conflitos.length} conflito{agendamento.conflitos.length !== 1 ? 's' : ''} detectado{agendamento.conflitos.length !== 1 ? 's' : ''}</span>
                        </div>
                      )}

                      {/* Ações Premium */}
                      {isPendente && (
                        <div className="block-acoes-premium">
                          <button 
                            className="acao-premium aprovar"
                            onClick={() => setModalAcao({ show: true, tipo: 'aprovar', agendamentoId: agendamento.id })}
                          >
                            <CheckCircle2 size={18} strokeWidth={2} />
                            <span>Aprovar</span>
                          </button>
                          <button 
                            className="acao-premium rejeitar"
                            onClick={() => setModalAcao({ show: true, tipo: 'rejeitar', agendamentoId: agendamento.id })}
                          >
                            <XCircle size={18} strokeWidth={2} />
                            <span>Rejeitar</span>
                          </button>
                        </div>
                      )}

                      {isAprovado && (
                        <div className="block-acoes-premium">
                          <button 
                            className="acao-premium converter"
                            onClick={() => setModalAcao({ show: true, tipo: 'converter', agendamentoId: agendamento.id })}
                          >
                            <PlayCircle size={18} strokeWidth={2} />
                            <span>Converter em Trabalho</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* FAB Premium */}
        <button className="fab-premium" onClick={abrirModalNovo} aria-label="Novo compromisso">
          <Plus size={24} strokeWidth={2.5} />
        </button>
      </div>

      {/* Modal Premium */}
      {modalAberto && (
        <div className="modal-overlay-premium" onClick={() => setModalAberto(false)}>
          <div className="modal-sheet-premium" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            
            <div className="modal-header-premium">
              <div>
                <h2 className="modal-title-premium">Novo Compromisso</h2>
                <p className="modal-subtitle-premium">Adicionar à agenda</p>
              </div>
              <button className="modal-close-premium" onClick={() => setModalAberto(false)}>
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>
            
            <div className="modal-body-premium">
              <div className="form-module-premium">
                <label className="form-label-premium">Cliente</label>
                <AutocompleteCliente
                  value={formClienteNome || ''}
                  onChange={(value) => setFormClienteNome(value)}
                  onSelect={(cliente) => {
                    setFormClienteId(cliente.id);
                    setFormClienteNome(cliente.nome);
                  }}
                  placeholder="Selecionar cliente..."
                />
              </div>

              <div className="form-module-premium">
                <label className="form-label-premium">Data</label>
                <input
                  type="date"
                  className="form-input-premium"
                  value={formData}
                  onChange={(e) => setFormData(e.target.value)}
                />
              </div>

              <div className="form-module-premium">
                <label className="form-label-premium">Horário</label>
                <div className="time-picker-premium">
                  <input
                    type="time"
                    className="time-input-premium"
                    value={formHorarioInicio}
                    onChange={(e) => setFormHorarioInicio(e.target.value)}
                  />
                  <span className="time-arrow-premium">→</span>
                  <input
                    type="time"
                    className="time-input-premium"
                    value={formHorarioFim}
                    onChange={(e) => setFormHorarioFim(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-module-premium">
                <label className="form-label-premium">Tipo de operação</label>
                <div className="segmented-control-premium">
                  <button
                    className={`segment-premium ${formTipo === 'descarga' ? 'active' : ''}`}
                    onClick={() => setFormTipo('descarga')}
                  >
                    <Truck size={18} />
                    <span>Descarga</span>
                  </button>
                  <button
                    className={`segment-premium ${formTipo === 'carga' ? 'active' : ''}`}
                    onClick={() => setFormTipo('carga')}
                  >
                    <Truck size={18} />
                    <span>Carga</span>
                  </button>
                </div>
              </div>

              <div className="form-module-premium">
                <label className="form-label-premium">Local da operação</label>
                <input
                  type="text"
                  className="form-input-premium"
                  placeholder="Galpão, setor, pátio..."
                  value={formLocal}
                  onChange={(e) => setFormLocal(e.target.value)}
                />
              </div>

              <div className="form-module-premium">
                <label className="form-label-premium">Tonelagem prevista</label>
                <div className="stepper-premium">
                  <button 
                    className="stepper-btn-premium"
                    onClick={() => {
                      const current = parseFloat(formTonelagem) || 0;
                      if (current > 0) setFormTonelagem((current - 0.5).toFixed(1));
                    }}
                  >
                    <Minus size={20} strokeWidth={2.5} />
                  </button>
                  <div className="stepper-value-premium">
                    <input
                      type="number"
                      inputMode="decimal"
                      className="stepper-input-premium"
                      placeholder="0.0"
                      value={formTonelagem}
                      onChange={(e) => setFormTonelagem(e.target.value)}
                    />
                    <span className="stepper-unit-premium">t</span>
                  </div>
                  <button 
                    className="stepper-btn-premium"
                    onClick={() => {
                      const current = parseFloat(formTonelagem) || 0;
                      setFormTonelagem((current + 0.5).toFixed(1));
                    }}
                  >
                    <Plus size={20} strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {conflitosDetectados.length > 0 && (
                <div className="alert-conflitos-premium">
                  <AlertTriangle size={20} />
                  <div>
                    <strong>{conflitosDetectados.length} conflito(s) detectado(s)</strong>
                    {conflitosDetectados.map((c, i) => (
                      <p key={i}>{c.descricao}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer-premium">
              <button className="btn-cancel-premium" onClick={() => setModalAberto(false)}>
                Cancelar
              </button>
              <button 
                className="btn-primary-premium"
                onClick={salvarAgendamento}
              >
                Criar Compromisso
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Ação */}
      {modalAcao && (
        <div className="modal-overlay-premium" onClick={() => setModalAcao(null)}>
          <div className="modal-sheet-premium modal-acao" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            
            <div className="modal-header-premium">
              <div>
                <h2 className="modal-title-premium">
                  {modalAcao.tipo === 'aprovar' && 'Aprovar Agendamento'}
                  {modalAcao.tipo === 'rejeitar' && 'Rejeitar Agendamento'}
                  {modalAcao.tipo === 'converter' && 'Converter em Trabalho'}
                </h2>
              </div>
              <button className="modal-close-premium" onClick={() => setModalAcao(null)}>
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>
            
            <div className="modal-body-premium">
              {modalAcao.tipo === 'rejeitar' && (
                <div className="form-module-premium">
                  <label className="form-label-premium">Motivo da rejeição</label>
                  <textarea
                    className="form-textarea-premium"
                    placeholder="Descreva o motivo..."
                    value={motivoRejeicao}
                    onChange={(e) => setMotivoRejeicao(e.target.value)}
                    rows={4}
                  />
                </div>
              )}
            </div>

            <div className="modal-footer-premium">
              <button className="btn-cancel-premium" onClick={() => setModalAcao(null)}>
                Cancelar
              </button>
              <button 
                className="btn-primary-premium"
                onClick={executarAcao}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      <Dock style={{ display: (modalAberto || modalAcao) ? 'none' : 'flex' }} />
    </>
  );
};

export default AgendaPage;
