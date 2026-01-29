import React, { useState } from 'react';
import { 
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Users,
  Package,
  Clock,
  Activity,
  ArrowRight,
  Bot,
  User as UserIcon
} from 'lucide-react';
import { Dock } from '../components/core/Dock';
import { DashboardContainer } from '../components/dashboard/DashboardContainer';
import './DashboardPageCore.css';

interface StatusDia {
  emAndamento: number;
  finalizados: number;
  atrasados: number;
  agendadosHoje: number;
}

interface Alerta {
  id: string;
  tipo: 'risco' | 'atraso' | 'conflito' | 'sem_encerramento';
  mensagem: string;
  acao: string;
  rota: string;
}

interface CargaDia {
  descarregadas: number;
  previstas: number;
  capacidadeTotal: number;
  isEstimado: boolean;
}

interface EquipeStatus {
  ativos: number;
  total: number;
  alocadosAgora: number;
  faltas: number;
}

interface ClienteExecucao {
  id: string;
  nome: string;
  volume: number;
  status: 'em_andamento' | 'pausado';
}

interface EventoRecente {
  id: string;
  hora: string;
  tipo: 'finalizado' | 'ia_agendou' | 'ajuste_manual' | 'cancelado';
  descricao: string;
  origem?: 'ia' | 'manual';
}

const DashboardPageCore: React.FC = () => {
  const [statusDia] = useState<StatusDia>({
    emAndamento: 2,
    finalizados: 5,
    atrasados: 0,
    agendadosHoje: 3,
  });

  const [alertas] = useState<Alerta[]>([
    {
      id: '1',
      tipo: 'risco',
      mensagem: 'Agendamento em risco: Armazém Central',
      acao: 'Ver Agendamento',
      rota: '/agendamentos',
    },
  ]);

  const [cargaDia] = useState<CargaDia>({
    descarregadas: 85.5,
    previstas: 120,
    capacidadeTotal: 150,
    isEstimado: true,
  });

  const [equipe] = useState<EquipeStatus>({
    ativos: 8,
    total: 12,
    alocadosAgora: 2,
    faltas: 1,
  });

  const [clientesExecucao] = useState<ClienteExecucao[]>([
    { id: '1', nome: 'Armazém Central', volume: 45, status: 'em_andamento' },
    { id: '2', nome: 'Distribuidora Norte', volume: 30, status: 'em_andamento' },
  ]);

  const [eventosRecentes] = useState<EventoRecente[]>([
    { id: '1', hora: '15:30', tipo: 'finalizado', descricao: 'Trabalho finalizado: Logística Sul' },
    { id: '2', hora: '14:20', tipo: 'ia_agendou', descricao: 'IA agendou: Cliente Novo', origem: 'ia' },
    { id: '3', hora: '13:45', tipo: 'ajuste_manual', descricao: 'Ajuste manual: Armazém Central', origem: 'manual' },
  ]);

  const progressoCarga = (cargaDia.descarregadas / cargaDia.capacidadeTotal) * 100;
  const capacidadeRestante = cargaDia.capacidadeTotal - cargaDia.descarregadas;
  const podeAssumir = capacidadeRestante >= 30 && equipe.ativos - equipe.alocadosAgora >= 2;

  const navegarPara = (rota: string) => {
    alert(`Navegando para ${rota}`);
  };

  return (
    <>
      <DashboardContainer>
        {/* ESTADO DO SISTEMA */}
        <div className="system-state">
          <div className="system-mode">
            <span className="mode-name">RADAR OPERACIONAL</span>
            <div className="system-indicators">
              <div className="live-indicator">
                <div className="live-dot"></div>
                <span className="live-label">AO VIVO</span>
              </div>
              <time className="system-date">
                {new Date().toLocaleDateString('pt-BR', {
                  weekday: 'short',
                  day: '2-digit',
                  month: 'short',
                }).toUpperCase()}
              </time>
            </div>
          </div>
        </div>

        {/* INTERRUPÇÃO CRÍTICA */}
        {alertas.length > 0 && (
          <div className="system-interrupt">
            {alertas.map((alerta) => (
              <div key={alerta.id} className="critical-alert">
                <div className="alert-signal">
                  <AlertTriangle />
                </div>
                <div className="alert-content">
                  <div className="alert-message">{alerta.mensagem}</div>
                  <div className="alert-action" onClick={() => navegarPara(alerta.rota)}>
                    {alerta.acao}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ESTADOS VIVOS */}
        <div className="operational-states">
          <div className="primary-state">
            <div className="state-number">{statusDia.emAndamento}</div>
            <div className="state-context">EM ANDAMENTO</div>
            <div className="state-activity"></div>
          </div>
          
          <div className="secondary-states">
            <div className="state-item completed">
              <CheckCircle2 size={18} />
              <span className="state-count">{statusDia.finalizados}</span>
              <span className="state-desc">FINALIZADOS</span>
            </div>
            
            <div className="state-item scheduled">
              <Calendar size={18} />
              <span className="state-count">{statusDia.agendadosHoje}</span>
              <span className="state-desc">AGENDADOS</span>
            </div>
            
            {statusDia.atrasados > 0 && (
              <div className="state-item delayed">
                <AlertTriangle size={18} />
                <span className="state-count">{statusDia.atrasados}</span>
                <span className="state-desc">ATRASADOS</span>
              </div>
            )}
          </div>
        </div>

        {/* MEDIDOR DE CAPACIDADE */}
        <div className="capacity-instrument">
          <div className="instrument-header">
            <span className="instrument-title">CAPACIDADE</span>
            {cargaDia.isEstimado && <span className="estimate-flag">EST</span>}
          </div>
          
          <div className="capacity-reading">
            <span className="current-load">{cargaDia.descarregadas.toFixed(1)}</span>
            <span className="load-separator">de</span>
            <span className="max-capacity">{cargaDia.capacidadeTotal.toFixed(1)}</span>
            <span className="unit-label">toneladas</span>
          </div>
          
          <div className="capacity-gauge">
            <div className="gauge-track">
              <div 
                className="gauge-fill" 
                style={{ 
                  width: `${progressoCarga}%`,
                  background: progressoCarga > 85 ? 
                    'linear-gradient(90deg, #FF6B35 0%, #F7931E 100%)' : 
                    'linear-gradient(90deg, #00D4AA 0%, #00B894 100%)'
                }}
              />
            </div>
            <div className="gauge-markers">
              <div className="marker" style={{ left: '25%' }}></div>
              <div className="marker" style={{ left: '50%' }}></div>
              <div className="marker" style={{ left: '75%' }}></div>
            </div>
          </div>
          
          <div className="capacity-metrics">
            <div className="metric-group">
              <span className="metric-label">RESTANTE</span>
              <span className="metric-value">{capacidadeRestante.toFixed(1)}t</span>
            </div>
            <div className="metric-group">
              <span className="metric-label">PREVISTO</span>
              <span className="metric-value">{cargaDia.previstas.toFixed(1)}t</span>
            </div>
          </div>
        </div>

        {/* PRESENÇA HUMANA */}
        <div className="human-presence">
          <div className="presence-header">EQUIPE</div>
          <div className="presence-grid">
            <div className="presence-active">
              <Users size={20} />
              <div className="presence-count">
                <span className="active-count">{equipe.ativos}</span>
                <span className="total-count">/{equipe.total}</span>
              </div>
              <span className="presence-label">ATIVOS</span>
            </div>
            
            <div className="presence-allocated">
              <Activity size={20} />
              <div className="presence-count">
                <span className="allocated-count">{equipe.alocadosAgora}</span>
              </div>
              <span className="presence-label">ALOCADOS</span>
            </div>
            
            {equipe.faltas > 0 && (
              <div className="presence-absent">
                <AlertTriangle size={20} />
                <div className="presence-count">
                  <span className="absent-count">{equipe.faltas}</span>
                </div>
                <span className="presence-label">FALTAS</span>
              </div>
            )}
          </div>
        </div>

        {/* FRENTES ATIVAS */}
        <div className="active-fronts">
          <div className="fronts-header">FRENTES ATIVAS</div>
          <div className="fronts-container">
            {clientesExecucao.map((cliente, index) => (
              <div 
                key={cliente.id} 
                className={`front-mission ${index === 0 ? 'primary' : 'secondary'}`}
                onClick={() => navegarPara('/trabalhos')}
              >
                <div className="mission-status">
                  <div className="status-pulse"></div>
                </div>
                <div className="mission-info">
                  <div className="mission-name">{cliente.nome}</div>
                  <div className="mission-load">
                    <Package size={14} />
                    <span>{cliente.volume}t</span>
                  </div>
                </div>
                <div className="mission-access">
                  <ArrowRight size={16} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DECISÃO OPERACIONAL */}
        <div className="operational-decision">
          <div className="decision-question">POSSO ASSUMIR MAIS TRABALHO?</div>
          <div className={`decision-answer ${podeAssumir ? 'affirmative' : 'negative'}`}>
            {podeAssumir ? (
              <>
                <CheckCircle2 size={24} />
                <span>SIM — CAPACIDADE DISPONÍVEL</span>
              </>
            ) : (
              <>
                <AlertTriangle size={24} />
                <span>NÃO — CAPACIDADE LIMITADA</span>
              </>
            )}
          </div>
        </div>

        {/* LOG DO SISTEMA */}
        <div className="system-log">
          <div className="log-header">LOG DO SISTEMA</div>
          <div className="log-stream">
            {eventosRecentes.map((evento) => (
              <div key={evento.id} className="log-entry">
                <div className="log-timestamp">
                  <Clock size={12} />
                  <span>{evento.hora}</span>
                </div>
                <div className="log-message">{evento.descricao}</div>
                {evento.origem && (
                  <div className={`log-origin ${evento.origem}`}>
                    {evento.origem === 'ia' ? (
                      <><Bot size={12} /><span>IA</span></>
                    ) : (
                      <><UserIcon size={12} /><span>MANUAL</span></>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </DashboardContainer>

      <Dock />
    </>
  );
};

export default DashboardPageCore;
