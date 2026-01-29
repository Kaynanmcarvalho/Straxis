import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Plus, 
  Clock, 
  MapPin, 
  Truck,
  AlertTriangle,
  CheckCircle2,
  Bot,
  User,
  Play,
  X,
  Edit3,
  Package
} from 'lucide-react';
import { Dock } from '../components/core/Dock';
import './CorePages.css';
import './AgendamentosPageCore.css';

type OrigemAgendamento = 'ia' | 'manual' | 'ajustado' | 'reagendado';
type StatusAgendamento = 'pendente' | 'confirmado' | 'em_risco' | 'cancelado';
type PeriodoDia = 'manha' | 'tarde' | 'noite';

interface Agendamento {
  id: string;
  cliente: string;
  local: string;
  data: Date;
  periodoInicio: string; // "08:00"
  periodoFim: string; // "11:00"
  periodo: PeriodoDia;
  tipo: 'carga' | 'descarga';
  volumeEstimado: number; // toneladas
  origem: OrigemAgendamento;
  status: StatusAgendamento;
  observacoes?: string;
  conflitos?: string[];
  criadoPor?: string;
  criadoEm: Date;
}

const AgendamentosPageCore: React.FC = () => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [dataAtual] = useState(new Date());

  useEffect(() => {
    // Mock data - demonstração
    const hoje = new Date();
    setAgendamentos([
      {
        id: '1',
        cliente: 'Armazém Central',
        local: 'Galpão 3 - Setor B',
        data: hoje,
        periodoInicio: '08:00',
        periodoFim: '11:00',
        periodo: 'manha',
        tipo: 'descarga',
        volumeEstimado: 45,
        origem: 'ia',
        status: 'pendente',
        observacoes: 'Cliente solicitou via WhatsApp',
        criadoEm: new Date(hoje.getTime() - 3600000),
      },
      {
        id: '2',
        cliente: 'Distribuidora Norte',
        local: 'Pátio A',
        data: hoje,
        periodoInicio: '09:00',
        periodoFim: '12:00',
        periodo: 'manha',
        tipo: 'carga',
        volumeEstimado: 30,
        origem: 'ia',
        status: 'pendente',
        conflitos: ['Sobreposição de horário com Armazém Central'],
        criadoEm: new Date(hoje.getTime() - 1800000),
      },
      {
        id: '3',
        cliente: 'Logística Sul',
        local: 'Terminal 5',
        data: hoje,
        periodoInicio: '14:00',
        periodoFim: '17:00',
        periodo: 'tarde',
        tipo: 'descarga',
        volumeEstimado: 60,
        origem: 'manual',
        status: 'confirmado',
        criadoPor: 'Kaynan',
        criadoEm: new Date(hoje.getTime() - 7200000),
      },
    ]);
  }, []);

  const agendamentosHoje = agendamentos.filter(a => 
    a.data.toDateString() === dataAtual.toDateString()
  );

  const agendamentosPorPeriodo = {
    manha: agendamentosHoje.filter(a => a.periodo === 'manha'),
    tarde: agendamentosHoje.filter(a => a.periodo === 'tarde'),
    noite: agendamentosHoje.filter(a => a.periodo === 'noite'),
  };

  const confirmarAgendamento = (id: string) => {
    setAgendamentos(prev => prev.map(a => 
      a.id === id ? { ...a, status: 'confirmado' as StatusAgendamento } : a
    ));
  };

  const cancelarAgendamento = (id: string) => {
    setAgendamentos(prev => prev.map(a => 
      a.id === id ? { ...a, status: 'cancelado' as StatusAgendamento } : a
    ));
  };

  const iniciarTrabalho = (id: string) => {
    alert(`Iniciando trabalho a partir do agendamento ${id}. Transição para /trabalhos...`);
  };

  const getOrigemIndicator = (origem: OrigemAgendamento) => {
    switch (origem) {
      case 'ia': return '◉';
      case 'manual': return '◎';
      case 'ajustado': return '◐';
      case 'reagendado': return '◑';
    }
  };

  const totalConfirmados = agendamentosHoje.filter(a => a.status === 'confirmado').length;
  const totalPendentes = agendamentosHoje.filter(a => a.status === 'pendente').length;
  const totalConflitos = agendamentosHoje.filter(a => a.conflitos && a.conflitos.length > 0).length;

  return (
    <>
      <div className="coordination-system">
        {/* CONTEXTO DO DIA */}
        <div className="temporal-context">
          <div className="context-primary">
            <span className="context-state">HOJE</span>
            <span className="context-date">
              {dataAtual.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
              }).toUpperCase()}
            </span>
          </div>
          <div className="context-metrics">
            <span className="metric-value">{agendamentosHoje.length}</span>
            <span className="metric-label">COMPROMISSOS</span>
          </div>
          <div className="context-action" onClick={() => alert('Criar novo agendamento')}>
            <Plus size={20} />
          </div>
        </div>

        {/* INTERRUPÇÃO DE SISTEMA - CONFLITOS */}
        {totalConflitos > 0 && (
          <div className="system-interrupt">
            <div className="interrupt-signal">
              <AlertTriangle size={18} />
            </div>
            <div className="interrupt-message">
              {totalConflitos} conflito{totalConflitos > 1 ? 's' : ''} de horário detectado{totalConflitos > 1 ? 's' : ''}
            </div>
          </div>
        )}

        {/* VISÃO DE CAPACIDADE */}
        <div className="capacity-overview">
          <div className="capacity-segment confirmed">
            <span className="segment-value">{totalConfirmados}</span>
            <span className="segment-context">CONFIRMADOS</span>
          </div>
          <div className="capacity-segment pending">
            <span className="segment-value">{totalPendentes}</span>
            <span className="segment-context">PENDENTES</span>
          </div>
          <div className="capacity-segment risks">
            <span className="segment-value">{totalConflitos}</span>
            <span className="segment-context">RISCOS</span>
          </div>
        </div>

        {/* LINHA TEMPORAL OPERACIONAL */}
        <div className="temporal-flow">
          {/* MANHÃ */}
          {agendamentosPorPeriodo.manha.length > 0 && (
            <div className="temporal-anchor">
              <div className="anchor-label">MANHÃ</div>
              <div className="temporal-stream">
                {agendamentosPorPeriodo.manha.map((agendamento) => {
                  const temConflito = agendamento.conflitos && agendamento.conflitos.length > 0;
                  
                  return (
                    <div 
                      key={agendamento.id} 
                      className={`operational-promise ${agendamento.status} ${temConflito ? 'conflict' : ''}`}
                    >
                      {/* CONTEXTO TEMPORAL */}
                      <div className="promise-temporal">
                        <span className="temporal-span">{agendamento.periodoInicio}–{agendamento.periodoFim}</span>
                        <span className="temporal-origin">{getOrigemIndicator(agendamento.origem)}</span>
                      </div>

                      {/* IDENTIDADE PRINCIPAL */}
                      <div className="promise-identity">
                        <div className="identity-primary">{agendamento.cliente}</div>
                        <div className="identity-context">
                          <span className="context-location">{agendamento.local}</span>
                          <span className="context-operation">{agendamento.tipo === 'carga' ? 'CARGA' : 'DESCARGA'}</span>
                          <span className="context-volume">{agendamento.volumeEstimado}t</span>
                        </div>
                      </div>

                      {/* ESTADO IMPLÍCITO */}
                      <div className={`promise-state ${agendamento.status}`}>
                        {agendamento.status === 'confirmado' && <CheckCircle2 size={16} />}
                        {agendamento.status === 'pendente' && <Clock size={16} />}
                        {agendamento.status === 'em_risco' && <AlertTriangle size={16} />}
                      </div>

                      {/* INTERRUPÇÃO DE CONFLITO */}
                      {temConflito && (
                        <div className="conflict-interrupt">
                          <AlertTriangle size={14} />
                          <span>CONFLITO DE HORÁRIO</span>
                        </div>
                      )}

                      {/* DECISÕES DE SISTEMA */}
                      <div className="promise-decisions">
                        {agendamento.status === 'pendente' && (
                          <>
                            <div 
                              className="decision confirm"
                              onClick={() => confirmarAgendamento(agendamento.id)}
                            >
                              CONFIRMAR
                            </div>
                            <div 
                              className="decision reject"
                              onClick={() => cancelarAgendamento(agendamento.id)}
                            >
                              CANCELAR
                            </div>
                          </>
                        )}
                        {agendamento.status === 'confirmado' && (
                          <div 
                            className="decision execute"
                            onClick={() => iniciarTrabalho(agendamento.id)}
                          >
                            INICIAR EXECUÇÃO
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TARDE */}
          {agendamentosPorPeriodo.tarde.length > 0 && (
            <div className="temporal-anchor">
              <div className="anchor-label">TARDE</div>
              <div className="temporal-stream">
                {agendamentosPorPeriodo.tarde.map((agendamento) => {
                  const temConflito = agendamento.conflitos && agendamento.conflitos.length > 0;
                  
                  return (
                    <div 
                      key={agendamento.id} 
                      className={`operational-promise ${agendamento.status} ${temConflito ? 'conflict' : ''}`}
                    >
                      <div className="promise-temporal">
                        <span className="temporal-span">{agendamento.periodoInicio}–{agendamento.periodoFim}</span>
                        <span className="temporal-origin">{getOrigemIndicator(agendamento.origem)}</span>
                      </div>

                      <div className="promise-identity">
                        <div className="identity-primary">{agendamento.cliente}</div>
                        <div className="identity-context">
                          <span className="context-location">{agendamento.local}</span>
                          <span className="context-operation">{agendamento.tipo === 'carga' ? 'CARGA' : 'DESCARGA'}</span>
                          <span className="context-volume">{agendamento.volumeEstimado}t</span>
                        </div>
                      </div>

                      <div className={`promise-state ${agendamento.status}`}>
                        {agendamento.status === 'confirmado' && <CheckCircle2 size={16} />}
                        {agendamento.status === 'pendente' && <Clock size={16} />}
                        {agendamento.status === 'em_risco' && <AlertTriangle size={16} />}
                      </div>

                      {temConflito && (
                        <div className="conflict-interrupt">
                          <AlertTriangle size={14} />
                          <span>CONFLITO DE HORÁRIO</span>
                        </div>
                      )}

                      <div className="promise-decisions">
                        {agendamento.status === 'pendente' && (
                          <>
                            <div 
                              className="decision confirm"
                              onClick={() => confirmarAgendamento(agendamento.id)}
                            >
                              CONFIRMAR
                            </div>
                            <div 
                              className="decision reject"
                              onClick={() => cancelarAgendamento(agendamento.id)}
                            >
                              CANCELAR
                            </div>
                          </>
                        )}
                        {agendamento.status === 'confirmado' && (
                          <div 
                            className="decision execute"
                            onClick={() => iniciarTrabalho(agendamento.id)}
                          >
                            INICIAR EXECUÇÃO
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* NOITE */}
          {agendamentosPorPeriodo.noite.length > 0 && (
            <div className="temporal-anchor">
              <div className="anchor-label">NOITE</div>
              <div className="temporal-stream">
                {agendamentosPorPeriodo.noite.map((agendamento) => (
                  <div key={agendamento.id} className={`operational-promise ${agendamento.status}`}>
                    {/* Mesmo layout */}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ESTADO VAZIO */}
          {agendamentosHoje.length === 0 && (
            <div className="temporal-void">
              <Calendar size={32} />
              <span className="void-message">NENHUMA PROMESSA REGISTRADA</span>
              <span className="void-context">Agenda livre para coordenação</span>
            </div>
          )}
        </div>
      </div>

      <Dock />
    </>
  );
};

export default AgendamentosPageCore;
