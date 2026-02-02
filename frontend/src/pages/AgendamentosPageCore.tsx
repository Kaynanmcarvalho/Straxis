import React, { useState, useEffect } from 'react';
import { Plus, Sparkles, Calendar, X, ArrowDown, ArrowUp } from 'lucide-react';
import { Dock } from '../components/core/Dock';
import { AutocompleteCliente } from '../components/common/AutocompleteCliente';
import './AgendamentosPageCore.css';

type OrigemAgendamento = 'ia' | 'manual';
type StatusAgendamento = 'pendente' | 'confirmado';
type PeriodoDia = 'manha' | 'tarde' | 'noite';

interface Agendamento {
  id: string;
  cliente: string;
  local: string;
  data: Date;
  horarioInicio: string;
  horarioFim: string;
  periodo: PeriodoDia;
  tipo: 'carga' | 'descarga';
  tonelagem: number;
  origem: OrigemAgendamento;
  status: StatusAgendamento;
  conflito?: boolean;
}

const AgendamentosPageCore: React.FC = () => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [dataAtual] = useState(new Date());
  const [mostrarModal, setMostrarModal] = useState(false);
  const [novoAgendamento, setNovoAgendamento] = useState({
    cliente: '', data: '', horarioInicio: '', horarioFim: '',
    tipo: 'descarga' as 'carga' | 'descarga', local: '', tonelagem: '',
  });

  useEffect(() => {
    // Carregar agendamentos reais do Firebase
    // TODO: Implementar carregamento de agendamentos
    setAgendamentos([]);
  }, []);

  const agendamentosHoje = agendamentos.filter(a => 
    a.data.toDateString() === dataAtual.toDateString()
  );

  const agendamentosPorPeriodo = {
    manha: agendamentosHoje.filter(a => a.periodo === 'manha'),
    tarde: agendamentosHoje.filter(a => a.periodo === 'tarde'),
    noite: agendamentosHoje.filter(a => a.periodo === 'noite'),
  };

  const totalAgendamentos = agendamentosHoje.length;
  const totalTonelagem = agendamentosHoje.reduce((sum, a) => sum + a.tonelagem, 0);
  const totalIA = agendamentosHoje.filter(a => a.origem === 'ia').length;

  const confirmarAgendamento = (id: string) => {
    setAgendamentos(prev => prev.map(a => 
      a.id === id ? { ...a, status: 'confirmado' as StatusAgendamento } : a
    ));
  };

  const ajustarAgendamento = (id: string) => {
    alert(`Ajustar agendamento: ${id}`);
  };

  const resolverConflito = (id: string) => {
    alert(`Resolver conflito: ${id}`);
  };

  const criarAgendamento = () => {
    if (!novoAgendamento.cliente || !novoAgendamento.data || !novoAgendamento.horarioInicio) {
      alert('Preencha os campos obrigatórios');
      return;
    }
    const novo: Agendamento = {
      id: Date.now().toString(),
      cliente: novoAgendamento.cliente,
      local: novoAgendamento.local,
      data: new Date(novoAgendamento.data),
      horarioInicio: novoAgendamento.horarioInicio,
      horarioFim: novoAgendamento.horarioFim || novoAgendamento.horarioInicio,
      periodo: 'manha',
      tipo: novoAgendamento.tipo,
      tonelagem: parseFloat(novoAgendamento.tonelagem) || 0,
      origem: 'manual',
      status: 'pendente',
    };
    setAgendamentos(prev => [...prev, novo]);
    setMostrarModal(false);
    setNovoAgendamento({
      cliente: '', data: '', horarioInicio: '', horarioFim: '',
      tipo: 'descarga', local: '', tonelagem: '',
    });
  };

  return (
    <>
      <div className="agenda-luxury-container">
        {/* Topo Editorial */}
        <div className="agenda-header">
          <div className="agenda-title-group">
            <h1 className="agenda-title">Hoje</h1>
            <div className="agenda-meta">
              <span className="agenda-date">
                {dataAtual.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
              </span>
              <span className="agenda-separator">•</span>
              <span className="agenda-live">
                <span className="live-dot"></span>
                Ao vivo
              </span>
            </div>
          </div>
          <button className="agenda-btn-add" onClick={() => setMostrarModal(true)}>
            <Plus size={20} strokeWidth={2} />
          </button>
        </div>

        {/* Resumo do Dia */}
        <div className="agenda-summary">
          <div className="summary-item">
            <span className="summary-value">{totalAgendamentos}</span>
            <span className="summary-label">compromissos</span>
          </div>
          <span className="summary-separator">•</span>
          <div className="summary-item">
            <span className="summary-value">{totalTonelagem}t</span>
            <span className="summary-label">previstas</span>
          </div>
          <span className="summary-separator">•</span>
          <div className="summary-item">
            <span className="summary-value">{totalIA}</span>
            <span className="summary-label">da IA</span>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="agenda-content">
          {/* Manhã */}
          {agendamentosPorPeriodo.manha.length > 0 && (
            <div className="agenda-section">
              <div className="period-divider">
                <div className="period-line"></div>
                <span className="period-label">Manhã</span>
              </div>
              {agendamentosPorPeriodo.manha.map((agendamento, index) => (
                <div 
                  key={agendamento.id} 
                  className={`agenda-card-luxury ${agendamento.conflito ? 'has-conflict' : ''} ${agendamento.status === 'confirmado' ? 'confirmed' : ''}`}
                  style={{ '--index': index } as React.CSSProperties}
                >
                  {/* Container principal */}
                  <div className="card-content-luxury">
                    
                    {/* Lado esquerdo: Ícone + Info */}
                    <div className="card-left-luxury">
                      
                      {/* Ícone grande com badge de tonelagem */}
                      <div className="icon-container-luxury">
                        <div className={`icon-badge-luxury ${agendamento.tipo === 'descarga' ? 'descarga' : 'carga'}`}>
                          <svg className="truck-icon-luxury" viewBox="0 0 32 32" width="32" height="32">
                            {/* Cabine */}
                            <path d="M4 12h8v8H4z" fill="currentColor" opacity="0.9"/>
                            {/* Carroceria */}
                            <path d="M12 10h12v10H12z" fill="currentColor"/>
                            {/* Rodas */}
                            <circle cx="8" cy="22" r="2.5" fill="currentColor" opacity="0.8"/>
                            <circle cx="20" cy="22" r="2.5" fill="currentColor" opacity="0.8"/>
                            {/* Detalhes */}
                            <path d="M14 12h8M14 14h8M14 16h8" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
                          </svg>
                        </div>
                        <div className="icon-counter-luxury">{agendamento.tonelagem}t</div>
                      </div>
                      
                      {/* Informações */}
                      <div className="info-stack-luxury">
                        <div className="client-code-luxury">{agendamento.cliente}</div>
                        <div className="address-primary-luxury">{agendamento.local}</div>
                        <div className="metadata-luxury">
                          <span className={`status-dot-luxury ${agendamento.status}`}></span>
                          <span className="status-text-luxury">
                            {agendamento.status === 'confirmado' ? 'Confirmado' : 'Agendado'}
                          </span>
                          <span className="separator-luxury">•</span>
                          <span className="time-luxury">{agendamento.horarioInicio}</span>
                          {agendamento.origem === 'ia' && (
                            <>
                              <span className="separator-luxury">•</span>
                              <div className="ia-badge-inline" title="Sugerido pela IA">
                                <Sparkles size={12} strokeWidth={2} />
                                <span>IA</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Lado direito: Ação */}
                    <div className="card-right-luxury">
                      {agendamento.status === 'pendente' && !agendamento.conflito && (
                        <button 
                          className="action-button-luxury"
                          onClick={() => confirmarAgendamento(agendamento.id)}
                        >
                          <span className="button-text-luxury">Iniciar</span>
                          <svg className="button-arrow-luxury" viewBox="0 0 20 20" width="20" height="20">
                            <path d="M5 10h10M10 5l5 5-5 5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      )}
                      {agendamento.status === 'confirmado' && (
                        <button 
                          className="action-button-luxury confirmed"
                          onClick={() => ajustarAgendamento(agendamento.id)}
                        >
                          <span className="button-text-luxury">Detalhes</span>
                          <svg className="button-arrow-luxury" viewBox="0 0 20 20" width="20" height="20">
                            <path d="M5 10h10M10 5l5 5-5 5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      )}
                      {agendamento.conflito && (
                        <button 
                          className="action-button-luxury conflict"
                          onClick={() => resolverConflito(agendamento.id)}
                        >
                          <span className="button-text-luxury">Resolver</span>
                          <svg className="button-arrow-luxury" viewBox="0 0 20 20" width="20" height="20">
                            <path d="M5 10h10M10 5l5 5-5 5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      )}
                    </div>
                    
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tarde */}
          {agendamentosPorPeriodo.tarde.length > 0 && (
            <div className="agenda-section">
              <div className="period-divider">
                <div className="period-line"></div>
                <span className="period-label">Tarde</span>
              </div>
              {agendamentosPorPeriodo.tarde.map((agendamento, index) => (
                <div 
                  key={agendamento.id} 
                  className={`agenda-card-luxury ${agendamento.conflito ? 'has-conflict' : ''} ${agendamento.status === 'confirmado' ? 'confirmed' : ''}`}
                  style={{ '--index': index } as React.CSSProperties}
                >
                  {/* Container principal */}
                  <div className="card-content-luxury">
                    
                    {/* Lado esquerdo: Ícone + Info */}
                    <div className="card-left-luxury">
                      
                      {/* Ícone grande com badge de tonelagem */}
                      <div className="icon-container-luxury">
                        <div className={`icon-badge-luxury ${agendamento.tipo === 'descarga' ? 'descarga' : 'carga'}`}>
                          <svg className="truck-icon-luxury" viewBox="0 0 32 32" width="32" height="32">
                            <path d="M4 12h8v8H4z" fill="currentColor" opacity="0.9"/>
                            <path d="M12 10h12v10H12z" fill="currentColor"/>
                            <circle cx="8" cy="22" r="2.5" fill="currentColor" opacity="0.8"/>
                            <circle cx="20" cy="22" r="2.5" fill="currentColor" opacity="0.8"/>
                            <path d="M14 12h8M14 14h8M14 16h8" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
                          </svg>
                        </div>
                        <div className="icon-counter-luxury">{agendamento.tonelagem}t</div>
                      </div>
                      
                      {/* Informações */}
                      <div className="info-stack-luxury">
                        <div className="client-code-luxury">{agendamento.cliente}</div>
                        <div className="address-primary-luxury">{agendamento.local}</div>
                        <div className="metadata-luxury">
                          <span className={`status-dot-luxury ${agendamento.status}`}></span>
                          <span className="status-text-luxury">
                            {agendamento.status === 'confirmado' ? 'Confirmado' : 'Agendado'}
                          </span>
                          <span className="separator-luxury">•</span>
                          <span className="time-luxury">{agendamento.horarioInicio}</span>
                          {agendamento.origem === 'ia' && (
                            <>
                              <span className="separator-luxury">•</span>
                              <div className="ia-badge-inline" title="Sugerido pela IA">
                                <Sparkles size={12} strokeWidth={2} />
                                <span>IA</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Lado direito: Ação */}
                    <div className="card-right-luxury">
                      {agendamento.status === 'pendente' && !agendamento.conflito && (
                        <button 
                          className="action-button-luxury"
                          onClick={() => confirmarAgendamento(agendamento.id)}
                        >
                          <span className="button-text-luxury">Iniciar</span>
                          <svg className="button-arrow-luxury" viewBox="0 0 20 20" width="20" height="20">
                            <path d="M5 10h10M10 5l5 5-5 5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      )}
                      {agendamento.status === 'confirmado' && (
                        <button 
                          className="action-button-luxury confirmed"
                          onClick={() => ajustarAgendamento(agendamento.id)}
                        >
                          <span className="button-text-luxury">Detalhes</span>
                          <svg className="button-arrow-luxury" viewBox="0 0 20 20" width="20" height="20">
                            <path d="M5 10h10M10 5l5 5-5 5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      )}
                      {agendamento.conflito && (
                        <button 
                          className="action-button-luxury conflict"
                          onClick={() => resolverConflito(agendamento.id)}
                        >
                          <span className="button-text-luxury">Resolver</span>
                          <svg className="button-arrow-luxury" viewBox="0 0 20 20" width="20" height="20">
                            <path d="M5 10h10M10 5l5 5-5 5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      )}
                    </div>
                    
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Noite */}
          {agendamentosPorPeriodo.noite.length > 0 ? (
            <div className="agenda-section">
              <div className="period-divider">
                <div className="period-line"></div>
                <span className="period-label">Noite</span>
              </div>
              {agendamentosPorPeriodo.noite.map((agendamento, index) => (
                <div 
                  key={agendamento.id} 
                  className={`agenda-card-luxury ${agendamento.conflito ? 'has-conflict' : ''} ${agendamento.status === 'confirmado' ? 'confirmed' : ''}`}
                  style={{ '--index': index } as React.CSSProperties}
                >
                  {/* Container principal */}
                  <div className="card-content-luxury">
                    
                    {/* Lado esquerdo: Ícone + Info */}
                    <div className="card-left-luxury">
                      
                      {/* Ícone grande com badge de tonelagem */}
                      <div className="icon-container-luxury">
                        <div className={`icon-badge-luxury ${agendamento.tipo === 'descarga' ? 'descarga' : 'carga'}`}>
                          <svg className="truck-icon-luxury" viewBox="0 0 32 32" width="32" height="32">
                            <path d="M4 12h8v8H4z" fill="currentColor" opacity="0.9"/>
                            <path d="M12 10h12v10H12z" fill="currentColor"/>
                            <circle cx="8" cy="22" r="2.5" fill="currentColor" opacity="0.8"/>
                            <circle cx="20" cy="22" r="2.5" fill="currentColor" opacity="0.8"/>
                            <path d="M14 12h8M14 14h8M14 16h8" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
                          </svg>
                        </div>
                        <div className="icon-counter-luxury">{agendamento.tonelagem}t</div>
                      </div>
                      
                      {/* Informações */}
                      <div className="info-stack-luxury">
                        <div className="client-code-luxury">{agendamento.cliente}</div>
                        <div className="address-primary-luxury">{agendamento.local}</div>
                        <div className="metadata-luxury">
                          <span className={`status-dot-luxury ${agendamento.status}`}></span>
                          <span className="status-text-luxury">
                            {agendamento.status === 'confirmado' ? 'Confirmado' : 'Agendado'}
                          </span>
                          <span className="separator-luxury">•</span>
                          <span className="time-luxury">{agendamento.horarioInicio}</span>
                          {agendamento.origem === 'ia' && (
                            <>
                              <span className="separator-luxury">•</span>
                              <div className="ia-badge-inline" title="Sugerido pela IA">
                                <Sparkles size={12} strokeWidth={2} />
                                <span>IA</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Lado direito: Ação */}
                    <div className="card-right-luxury">
                      {agendamento.status === 'pendente' && !agendamento.conflito && (
                        <button 
                          className="action-button-luxury"
                          onClick={() => confirmarAgendamento(agendamento.id)}
                        >
                          <span className="button-text-luxury">Iniciar</span>
                          <svg className="button-arrow-luxury" viewBox="0 0 20 20" width="20" height="20">
                            <path d="M5 10h10M10 5l5 5-5 5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      )}
                      {agendamento.status === 'confirmado' && (
                        <button 
                          className="action-button-luxury confirmed"
                          onClick={() => ajustarAgendamento(agendamento.id)}
                        >
                          <span className="button-text-luxury">Detalhes</span>
                          <svg className="button-arrow-luxury" viewBox="0 0 20 20" width="20" height="20">
                            <path d="M5 10h10M10 5l5 5-5 5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      )}
                      {agendamento.conflito && (
                        <button 
                          className="action-button-luxury conflict"
                          onClick={() => resolverConflito(agendamento.id)}
                        >
                          <span className="button-text-luxury">Resolver</span>
                          <svg className="button-arrow-luxury" viewBox="0 0 20 20" width="20" height="20">
                            <path d="M5 10h10M10 5l5 5-5 5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      )}
                    </div>
                    
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="agenda-section">
              <div className="period-divider">
                <div className="period-line"></div>
                <span className="period-label">Noite</span>
              </div>
              <div className="agenda-empty">
                <div className="empty-icon">
                  <Calendar size={48} strokeWidth={1.5} />
                </div>
                <h3 className="empty-title">Nenhum compromisso</h3>
                <p className="empty-desc">
                  Você não tem agendamentos para este período
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Novo Agendamento - REDESIGN LUXURY */}
        {mostrarModal && (
          <div className="modal-overlay-luxury" onClick={() => setMostrarModal(false)}>
            <div className="modal-container-luxury" onClick={(e) => e.stopPropagation()}>
              
              {/* Header */}
              <div className="modal-header-luxury">
                <h2 className="modal-title-luxury">Novo Compromisso</h2>
                <button className="modal-close-luxury" onClick={() => setMostrarModal(false)}>
                  <X size={22} strokeWidth={2} />
                </button>
              </div>
              
              {/* Body com scroll */}
              <div className="modal-body-luxury">
                
                {/* Cliente */}
                <div className="modal-field-luxury">
                  <label className="modal-label-luxury">Cliente *</label>
                  <AutocompleteCliente
                    value={novoAgendamento.cliente}
                    onChange={(value) => setNovoAgendamento(prev => ({ ...prev, cliente: value }))}
                    placeholder="Nome do cliente"
                    autoFocus
                  />
                </div>
                
                {/* Data e Horário */}
                <div className="modal-row-luxury">
                  <div className="modal-field-luxury">
                    <label className="modal-label-luxury">Data *</label>
                    <input
                      type="date"
                      className="modal-input-luxury"
                      value={novoAgendamento.data}
                      onChange={(e) => setNovoAgendamento(prev => ({ ...prev, data: e.target.value }))}
                    />
                  </div>
                </div>
                
                {/* Horário Início e Fim */}
                <div className="modal-field-luxury">
                  <label className="modal-label-luxury">Horário *</label>
                  <div className="modal-time-group-luxury">
                    <input
                      type="time"
                      className="modal-input-luxury time-input"
                      value={novoAgendamento.horarioInicio}
                      onChange={(e) => setNovoAgendamento(prev => ({ ...prev, horarioInicio: e.target.value }))}
                      placeholder="Início"
                    />
                    <span className="time-separator-luxury">até</span>
                    <input
                      type="time"
                      className="modal-input-luxury time-input"
                      value={novoAgendamento.horarioFim}
                      onChange={(e) => setNovoAgendamento(prev => ({ ...prev, horarioFim: e.target.value }))}
                      placeholder="Fim"
                    />
                  </div>
                </div>
                
                {/* Tipo (Carga/Descarga) */}
                <div className="modal-field-luxury">
                  <label className="modal-label-luxury">Tipo *</label>
                  <div className="modal-tipo-selector-luxury">
                    <button
                      type="button"
                      className={`tipo-option-luxury ${novoAgendamento.tipo === 'descarga' ? 'active' : ''}`}
                      onClick={() => setNovoAgendamento(prev => ({ ...prev, tipo: 'descarga' }))}
                    >
                      <ArrowDown size={20} strokeWidth={2} />
                      <span>Descarga</span>
                    </button>
                    <button
                      type="button"
                      className={`tipo-option-luxury ${novoAgendamento.tipo === 'carga' ? 'active' : ''}`}
                      onClick={() => setNovoAgendamento(prev => ({ ...prev, tipo: 'carga' }))}
                    >
                      <ArrowUp size={20} strokeWidth={2} />
                      <span>Carga</span>
                    </button>
                  </div>
                </div>
                
                {/* Local */}
                <div className="modal-field-luxury">
                  <label className="modal-label-luxury">Local</label>
                  <input
                    type="text"
                    className="modal-input-luxury"
                    placeholder="Galpão, setor, pátio..."
                    value={novoAgendamento.local}
                    onChange={(e) => setNovoAgendamento(prev => ({ ...prev, local: e.target.value }))}
                  />
                </div>
                
                {/* Tonelagem */}
                <div className="modal-field-luxury">
                  <label className="modal-label-luxury">Tonelagem Prevista</label>
                  <div className="modal-input-with-unit-luxury">
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.1"
                      className="modal-input-luxury"
                      placeholder="0.0"
                      value={novoAgendamento.tonelagem}
                      onChange={(e) => setNovoAgendamento(prev => ({ ...prev, tonelagem: e.target.value }))}
                    />
                    <span className="input-unit-luxury">t</span>
                  </div>
                </div>
                
              </div>
              
              {/* Footer fixo */}
              <div className="modal-footer-luxury">
                <button 
                  type="button"
                  className="modal-btn-luxury modal-btn-cancel-luxury" 
                  onClick={() => setMostrarModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="button"
                  className="modal-btn-luxury modal-btn-create-luxury" 
                  onClick={criarAgendamento}
                >
                  Criar Compromisso
                </button>
              </div>
              
            </div>
          </div>
        )}
      </div>

      <Dock />
    </>
  );
};

export default AgendamentosPageCore;
