import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Plus,
  Filter,
  ChevronLeft,
  ChevronRight,
  Truck,
  DollarSign,
  Users,
  AlertCircle,
  X,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Dock } from '../components/core/Dock';
import { AutocompleteCliente } from '../components/common/AutocompleteCliente';
import { useAuth } from '../contexts/AuthContext';
import { agendamentoService } from '../services/agendamento.service';
import { Agendamento } from '../types/agendamento.types';
import './PlanejamentoPage.css';
import './AgendaPageModal.css';

interface Compromisso {
  id: string;
  horario: string;
  tipo: 'descarga' | 'carga' | 'cobranca' | 'reuniao';
  titulo: string;
  cliente: string;
  clienteId?: string;
  local?: string;
  valor?: number;
  tonelagem?: number;
  status: 'pendente' | 'confirmado' | 'em_andamento' | 'concluido';
  prioridade?: 'critica' | 'alta' | 'normal';
  conflito?: { id: string; horario: string; titulo: string };
  data: Date;
}

const PlanejamentoPage: React.FC = () => {
  const { user } = useAuth();
  const [semanaAtual, setSemanaAtual] = useState(0);
  const [compromissos, setCompromissos] = useState<Compromisso[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form states
  const [formCliente, setFormCliente] = useState('');
  const [formClienteId, setFormClienteId] = useState('');
  const [formData, setFormData] = useState('');
  const [formHorario, setFormHorario] = useState('');
  const [formTipo, setFormTipo] = useState<'descarga' | 'carga' | 'cobranca' | 'reuniao'>('descarga');
  const [formLocal, setFormLocal] = useState('');
  const [formValor, setFormValor] = useState('');
  const [formTonelagem, setFormTonelagem] = useState('');
  const [formPrioridade, setFormPrioridade] = useState<'normal' | 'alta' | 'critica'>('normal');
  
  // Swipe states
  const [swipingId, setSwipingId] = useState<string | null>(null);
  const [swipeX, setSwipeX] = useState(0);
  const touchStartX = useRef(0);

  const carregarCompromissos = useCallback(async () => {
    if (!user?.companyId) return;
    
    setLoading(true);
    try {
      const agendamentos = await agendamentoService.list();
      
      // Converter agendamentos para compromissos
      const compromissosConvertidos: Compromisso[] = agendamentos.map(ag => {
        const dataObj = new Date(ag.data);
        
        return {
          id: ag.id,
          horario: ag.horarioInicio,
          tipo: ag.tipo as 'carga' | 'descarga',
          titulo: `${ag.tipo === 'carga' ? 'Carga' : 'Descarga'} - ${ag.tonelagem}t`,
          cliente: ag.clienteNome,
          clienteId: ag.clienteId,
          local: ag.localDescricao,
          valor: ag.valorEstimadoCentavos / 100,
          tonelagem: ag.tonelagem,
          status: ag.status as any,
          prioridade: ag.prioridade as any,
          data: dataObj,
        };
      });
      
      setCompromissos(compromissosConvertidos);
    } catch (error) {
      console.error('Erro ao carregar compromissos:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.companyId]);

  useEffect(() => {
    carregarCompromissos();
  }, [carregarCompromissos, semanaAtual]);

  const getDataSemana = () => {
    const hoje = new Date();
    const inicio = new Date(hoje);
    inicio.setDate(hoje.getDate() - hoje.getDay() + semanaAtual * 7);
    const fim = new Date(inicio);
    fim.setDate(inicio.getDate() + 6);
    
    return {
      inicio,
      fim,
      texto: `${inicio.getDate()}–${fim.getDate()} ${fim.toLocaleDateString('pt-BR', { month: 'short' })}`
    };
  };

  const getDataAtual = () => {
    const hoje = new Date();
    const diaSemana = hoje.toLocaleDateString('pt-BR', { weekday: 'long' });
    const data = hoje.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
    return `${diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)}, ${data}`;
  };

  const navegarSemana = (direcao: number) => {
    setSemanaAtual(prev => prev + direcao);
    if (navigator.vibrate) navigator.vibrate(10);
  };

  const abrirModal = () => {
    setFormCliente('');
    setFormClienteId('');
    setFormData('');
    setFormHorario('');
    setFormTipo('descarga');
    setFormLocal('');
    setFormValor('');
    setFormTonelagem('');
    setFormPrioridade('normal');
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
  };

  const salvarCompromisso = async () => {
    if (!formCliente || !formData || !formHorario) {
      alert('Preencha cliente, data e horário');
      return;
    }

    if (!formLocal) {
      alert('Preencha o local');
      return;
    }

    if (!formTonelagem || parseFloat(formTonelagem) <= 0) {
      alert('Preencha a tonelagem (maior que zero)');
      return;
    }

    try {
      const dataHora = new Date(`${formData}T${formHorario}`);
      const horarioFim = new Date(dataHora);
      horarioFim.setHours(horarioFim.getHours() + 2); // 2 horas de duração padrão
      
      await agendamentoService.create({
        clienteNome: formCliente,
        clienteId: formClienteId || undefined,
        data: dataHora,
        horarioInicio: formHorario,
        horarioFim: horarioFim.toTimeString().slice(0, 5),
        tipo: formTipo === 'carga' || formTipo === 'descarga' ? formTipo : 'descarga',
        localDescricao: formLocal,
        tonelagem: parseFloat(formTonelagem),
        valorEstimadoCentavos: formValor ? Math.round(parseFloat(formValor) * 100) : 0,
        funcionarios: [],
        prioridade: formPrioridade,
      });
      
      await carregarCompromissos();
      fecharModal();
      if (navigator.vibrate) navigator.vibrate([10, 50, 10]);
    } catch (error) {
      console.error('Erro ao salvar compromisso:', error);
      alert('Erro ao salvar compromisso');
    }
  };

  const confirmarCompromisso = async (id: string) => {
    try {
      await agendamentoService.updateStatus(id, 'confirmado');
      await carregarCompromissos();
      if (navigator.vibrate) navigator.vibrate(20);
    } catch (error) {
      console.error('Erro ao confirmar compromisso:', error);
    }
  };

  const cancelarCompromisso = async (id: string) => {
    if (confirm('Cancelar este compromisso?')) {
      try {
        await agendamentoService.delete(id);
        await carregarCompromissos();
        if (navigator.vibrate) navigator.vibrate([10, 30, 10]);
      } catch (error) {
        console.error('Erro ao cancelar compromisso:', error);
      }
    }
  };

  const ajustarConflito = () => {
    // TODO: Implementar lógica de ajuste automático
    alert('Ajuste automático em desenvolvimento');
  };

  // Swipe handlers
  const handleTouchStart = (e: React.TouchEvent, id: string) => {
    touchStartX.current = e.touches[0].clientX;
    setSwipingId(id);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swipingId) return;
    const currentX = e.touches[0].clientX;
    const diff = touchStartX.current - currentX;
    if (diff > 0 && diff < 120) {
      setSwipeX(diff);
    }
  };

  const handleTouchEnd = () => {
    if (swipeX > 60) {
      // Mantém aberto
    } else {
      setSwipeX(0);
      setSwipingId(null);
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'descarga':
      case 'carga':
        return Truck;
      case 'cobranca':
        return DollarSign;
      case 'reuniao':
        return Users;
      default:
        return Truck;
    }
  };

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      descarga: 'Descarga',
      carga: 'Carga',
      cobranca: 'Cobrança',
      reuniao: 'Reunião'
    };
    return labels[tipo] || tipo;
  };

  const semana = getDataSemana();
  const isHoje = semanaAtual === 0;
  
  // Filtrar compromissos da data selecionada
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  const compromissosHoje = compromissos.filter(c => {
    const dataCompromisso = new Date(c.data);
    dataCompromisso.setHours(0, 0, 0, 0);
    return dataCompromisso.getTime() === hoje.getTime();
  });
  
  const temCompromissosHoje = compromissosHoje.length > 0;

  return (
    <>
      <div className="planejamento-editorial">
        {/* Header Editorial */}
        <header className="editorial-header">
          <h1 className="editorial-title">Centro de Planejamento</h1>
          <p className="editorial-subtitle">
            {isHoje ? 'Hoje' : semana.texto} • {getDataAtual()}
          </p>
          <p className="editorial-count">{compromissos.length} compromissos</p>
          
          <button 
            className="btn-filtro-float"
            onClick={() => alert('Filtros em desenvolvimento')}
            aria-label="Filtros"
          >
            <Filter size={18} strokeWidth={2} />
          </button>
        </header>

        {/* Navegação de Período */}
        <div className="periodo-nav">
          <button 
            className="periodo-btn"
            onClick={() => navegarSemana(-1)}
            aria-label="Semana anterior"
          >
            <ChevronLeft size={20} strokeWidth={2} />
          </button>
          
          <span className="periodo-label">
            {isHoje ? 'Semana atual' : semana.texto}
          </span>
          
          <button 
            className="periodo-btn"
            onClick={() => navegarSemana(1)}
            aria-label="Próxima semana"
          >
            <ChevronRight size={20} strokeWidth={2} />
          </button>
        </div>

        {/* Timeline Vertical */}
        <div className="timeline-editorial">
          {loading ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#86868b' }}>
              Carregando...
            </div>
          ) : compromissos.length === 0 ? (
            <div className="empty-editorial">
              <div className="empty-icon-minimal">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="1.5" opacity="0.2"/>
                  <path d="M24 16v8l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="empty-title-minimal">
                {isHoje ? 'Hoje está livre' : 'Nenhum compromisso'}
              </h3>
              <p className="empty-subtitle-minimal">
                {isHoje 
                  ? 'Organize sua próxima operação ou cobrança'
                  : 'Não há compromissos neste período'
                }
              </p>
              <div className="empty-actions-minimal">
                <button className="btn-empty-primary-minimal" onClick={abrirModal}>
                  Criar compromisso
                </button>
                <button className="btn-empty-secondary-minimal" onClick={() => navegarSemana(1)}>
                  Planejar semana
                </button>
              </div>
            </div>
          ) : (
            <div className="timeline-list">
              {compromissos.map((item) => {
                const Icon = getTipoIcon(item.tipo);
                const isSwipping = swipingId === item.id;
                
                return (
                  <div 
                    key={item.id} 
                    className="timeline-entry-wrapper"
                    onTouchStart={(e) => handleTouchStart(e, item.id)}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    <div 
                      className="timeline-entry"
                      style={{
                        transform: isSwipping ? `translateX(-${swipeX}px)` : 'translateX(0)',
                        transition: isSwipping ? 'none' : 'transform 200ms ease'
                      }}
                    >
                      <div className="entry-time">{item.horario}</div>
                      
                      <div className="entry-content">
                        {item.prioridade === 'critica' && <div className="entry-indicator critical" />}
                        
                        <div className="entry-header">
                          <div className="entry-type">
                            <Icon size={14} strokeWidth={2} />
                            <span>{getTipoLabel(item.tipo)}</span>
                          </div>
                          {item.status === 'confirmado' && (
                            <CheckCircle2 size={14} color="#34C759" strokeWidth={2} />
                          )}
                        </div>
                        
                        <h4 className="entry-title">{item.titulo}</h4>
                        
                        <div className="entry-meta">
                          <span className="entry-client">{item.cliente}</span>
                          {item.local && (
                            <>
                              <span className="entry-sep">•</span>
                              <span className="entry-location">{item.local}</span>
                            </>
                          )}
                          {item.valor && (
                            <>
                              <span className="entry-sep">•</span>
                              <span className="entry-value">R$ {item.valor.toLocaleString('pt-BR')}</span>
                            </>
                          )}
                        </div>
                        
                        {item.conflito && (
                          <div className="entry-conflict">
                            <AlertCircle size={12} strokeWidth={2} />
                            <span>Conflito com {item.conflito.titulo} às {item.conflito.horario}</span>
                            <button 
                              className="conflict-action"
                              onClick={ajustarConflito}
                            >
                              Ajustar automaticamente
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {isSwipping && (
                      <div className="swipe-actions">
                        {item.status === 'pendente' && (
                          <button 
                            className="swipe-action confirm"
                            onClick={() => confirmarCompromisso(item.id)}
                          >
                            <CheckCircle2 size={20} />
                          </button>
                        )}
                        <button 
                          className="swipe-action cancel"
                          onClick={() => cancelarCompromisso(item.id)}
                        >
                          <XCircle size={20} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* FAB */}
      <button 
        className="fab-editorial"
        onClick={abrirModal}
        aria-label="Novo compromisso"
      >
        <Plus size={22} strokeWidth={2.5} />
      </button>

      {/* Modal Criar Compromisso */}
      {modalAberto && (
        <div className="agenda-sheet-overlay" onClick={fecharModal}>
          <div className="agenda-sheet-container" onClick={(e) => e.stopPropagation()}>
            <div className="agenda-sheet-handle" />
            
            <div className="agenda-sheet-header">
              <div className="agenda-header-content">
                <h2 className="agenda-title">Novo Compromisso</h2>
                <p className="agenda-subtitle">Adicionar à agenda</p>
              </div>
              <button className="agenda-close-btn" onClick={fecharModal}>
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>
            
            <div className="agenda-sheet-body">
              {/* Cliente */}
              <div className="agenda-module">
                <div className="agenda-module-label">Cliente</div>
                <AutocompleteCliente
                  value={formCliente}
                  onChange={(nome: string, id?: string) => {
                    setFormCliente(nome);
                    setFormClienteId(id || '');
                  }}
                  placeholder="Selecionar cliente..."
                />
              </div>

              {/* Data e Horário */}
              <div className="agenda-module">
                <div className="agenda-module-label">Data e Horário</div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input
                    type="date"
                    className="agenda-contextual-input"
                    value={formData}
                    onChange={(e) => setFormData(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <input
                    type="time"
                    className="agenda-contextual-input"
                    value={formHorario}
                    onChange={(e) => setFormHorario(e.target.value)}
                    style={{ flex: 1 }}
                  />
                </div>
              </div>

              {/* Tipo */}
              <div className="agenda-module">
                <div className="agenda-module-label">Tipo de operação</div>
                <div className="agenda-segmented-control-scroll">
                  <div className="agenda-segmented-control">
                    {(['descarga', 'carga', 'cobranca', 'reuniao'] as const).map((tipo, index) => (
                      <button
                        key={tipo}
                        className={`agenda-segment ${formTipo === tipo ? 'active' : ''}`}
                        onClick={() => {
                          setFormTipo(tipo);
                          // Scroll para mostrar opção selecionada
                          const container = document.querySelector('.agenda-segmented-control-scroll');
                          const button = container?.children[0]?.children[index] as HTMLElement;
                          if (container && button) {
                            button.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                          }
                        }}
                      >
                        <span>{getTipoLabel(tipo)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Local */}
              {(formTipo === 'descarga' || formTipo === 'carga') && (
                <div className="agenda-module">
                  <div className="agenda-module-label">Local</div>
                  <input
                    type="text"
                    className="agenda-contextual-input"
                    placeholder="Galpão, setor, pátio..."
                    value={formLocal}
                    onChange={(e) => setFormLocal(e.target.value)}
                  />
                </div>
              )}

              {/* Valor */}
              {formTipo === 'cobranca' && (
                <div className="agenda-module">
                  <div className="agenda-module-label">Valor</div>
                  <input
                    type="number"
                    className="agenda-contextual-input"
                    placeholder="0,00"
                    value={formValor}
                    onChange={(e) => setFormValor(e.target.value)}
                  />
                </div>
              )}

              {/* Tonelagem */}
              {(formTipo === 'carga' || formTipo === 'descarga') && (
                <div className="agenda-module">
                  <div className="agenda-module-label">Tonelagem prevista</div>
                  <input
                    type="number"
                    className="agenda-contextual-input"
                    placeholder="0.0"
                    value={formTonelagem}
                    onChange={(e) => setFormTonelagem(e.target.value)}
                  />
                </div>
              )}

              {/* Prioridade */}
              <div className="agenda-module">
                <div className="agenda-module-label">Prioridade</div>
                <div className="agenda-segmented-control-scroll">
                  <div className="agenda-segmented-control">
                    {(['normal', 'alta', 'critica'] as const).map((prioridade, index) => (
                      <button
                        key={prioridade}
                        className={`agenda-segment ${formPrioridade === prioridade ? 'active' : ''}`}
                        onClick={() => {
                          setFormPrioridade(prioridade);
                          // Scroll para mostrar opção selecionada
                          const containers = document.querySelectorAll('.agenda-segmented-control-scroll');
                          const container = containers[containers.length - 1];
                          const button = container?.children[0]?.children[index] as HTMLElement;
                          if (container && button) {
                            button.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                          }
                        }}
                      >
                        <span>{prioridade.charAt(0).toUpperCase() + prioridade.slice(1)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="agenda-sheet-footer">
              <button className="agenda-cancel-link" onClick={fecharModal}>
                Cancelar
              </button>
              <button 
                className="agenda-primary-btn"
                onClick={salvarCompromisso}
                disabled={!formCliente || !formData || !formHorario}
              >
                <span>Criar Compromisso</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <Dock />
    </>
  );
};

export default PlanejamentoPage;
