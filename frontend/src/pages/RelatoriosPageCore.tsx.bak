import React, { useState, useEffect } from 'react';
import { 
  Plus, Clock, MapPin, Truck, Package, CheckCircle2, AlertCircle,
  Sunrise, Sun, Moon, TrendingUp, Sparkles, X
} from 'lucide-react';
import { Dock } from '../components/core/Dock';

type OrigemAgendamento = 'ia' | 'manual' | 'ajustado' | 'reagendado';
type StatusAgendamento = 'pendente' | 'confirmado' | 'em_risco' | 'cancelado';
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
  observacoes?: string;
  conflitos?: string[];
  criadoPor?: string;
  criadoEm: Date;
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
    const hoje = new Date();
    setAgendamentos([
      {
        id: '1', cliente: 'Armazém Central', local: 'Galpão 3 - Setor B',
        data: hoje, periodoInicio: '08:00', periodoFim: '11:00', periodo: 'manha',
        tipo: 'descarga', volumeEstimado: 45, origem: 'ia', status: 'pendente',
        observacoes: 'Cliente solicitou via WhatsApp', criadoEm: new Date(hoje.getTime() - 3600000),
      },
      {
        id: '2', cliente: 'Distribuidora Norte', local: 'Pátio A',
        data: hoje, periodoInicio: '09:00', periodoFim: '12:00', periodo: 'manha',
        tipo: 'carga', volumeEstimado: 30, origem: 'ia', status: 'pendente',
        conflitos: ['Sobreposição de horário'], criadoEm: new Date(hoje.getTime() - 1800000),
      },
      {
        id: '3', cliente: 'Logística Sul', local: 'Terminal 5',
        data: hoje, periodoInicio: '14:00', periodoFim: '17:00', periodo: 'tarde',
        tipo: 'descarga', volumeEstimado: 60, origem: 'manual', status: 'confirmado',
        criadoPor: 'Kaynan', criadoEm: new Date(hoje.getTime() - 7200000),
      },
    ]);
  }, []);

  const agendamentosHoje = agendamentos.filter(a => a.data.toDateString() === dataAtual.toDateString());
  const agendamentosPorPeriodo = {
    manha: agendamentosHoje.filter(a => a.periodo === 'manha'),
    tarde: agendamentosHoje.filter(a => a.periodo === 'tarde'),
    noite: agendamentosHoje.filter(a => a.periodo === 'noite'),
  };

  const confirmarAgendamento = (id: string) => {
    setAgendamentos(prev => prev.map(a => a.id === id ? { ...a, status: 'confirmado' as StatusAgendamento } : a));
  };

  const cancelarAgendamento = (id: string) => {
    setAgendamentos(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelado' as StatusAgendamento } : a));
  };

  const iniciarTrabalho = (id: string) => {
    alert(`Transição para execução: ${id}`);
  };

  const criarAgendamento = () => {
    if (!novoAgendamento.cliente || !novoAgendamento.data || !novoAgendamento.horarioInicio) {
      alert('Preencha os campos obrigatórios');
      return;
    }
    const novo: Agendamento = {
      id: Date.now().toString(), cliente: novoAgendamento.cliente, local: novoAgendamento.local,
      data: new Date(novoAgendamento.data), periodoInicio: novoAgendamento.horarioInicio,
      periodoFim: novoAgendamento.horarioFim || novoAgendamento.horarioInicio, periodo: 'manha',
      tipo: novoAgendamento.tipo, volumeEstimado: parseFloat(novoAgendamento.tonelagem) || 0,
      origem: 'manual', status: 'pendente', criadoEm: new Date(),
    };
    setAgendamentos(prev => [...prev, novo]);
    setMostrarModal(false);
    setNovoAgendamento({ cliente: '', data: '', horarioInicio: '', horarioFim: '', tipo: 'descarga', local: '', tonelagem: '' });
  };

  const totalConfirmados = agendamentosHoje.filter(a => a.status === 'confirmado').length;
  const totalPendentes = agendamentosHoje.filter(a => a.status === 'pendente').length;
  const totalConflitos = agendamentosHoje.filter(a => a.conflitos && a.conflitos.length > 0).length;

  const renderAgendamento = (agendamento: Agendamento) => {
    const temConflito = agendamento.conflitos && agendamento.conflitos.length > 0;
    return (
      <div key={agendamento.id} className={`agd-card ${agendamento.status} ${temConflito ? 'conflict' : ''}`}>
        <div className="agd-header">
          <div className="agd-time">
            <Clock size={16} strokeWidth={2} />
            <span>{agendamento.periodoInicio} - {agendamento.periodoFim}</span>
          </div>
          {agendamento.status === 'confirmado' && (
            <div className="agd-badge confirmed"><CheckCircle2 size={14} strokeWidth={2.5} /></div>
          )}
          {agendamento.status === 'pendente' && (
            <div className="agd-badge pending"><Clock size={14} strokeWidth={2.5} /></div>
          )}
        </div>
        <div className="agd-body">
          <h3 className="agd-client">{agendamento.cliente}</h3>
          <div className="agd-details">
            <div className="agd-detail"><MapPin size={14} strokeWidth={2} /><span>{agendamento.local}</span></div>
            <div className="agd-detail"><Truck size={14} strokeWidth={2} /><span>{agendamento.tipo === 'carga' ? 'Carga' : 'Descarga'}</span></div>
            <div className="agd-detail"><Package size={14} strokeWidth={2} /><span>{agendamento.volumeEstimado}t</span></div>
          </div>
        </div>
        {agendamento.origem === 'ia' && (
          <div className="agd-ia-badge"><Sparkles size={12} strokeWidth={2} /><span>Sugerido automaticamente</span></div>
        )}
        {temConflito && (
          <div className="agd-conflict"><AlertCircle size={14} strokeWidth={2} /><span>Conflito de horário detectado</span></div>
        )}
        <div className="agd-actions">
          {agendamento.status === 'pendente' && (
            <>
              <button className="agd-btn confirm" onClick={() => confirmarAgendamento(agendamento.id)}>
                <CheckCircle2 size={16} strokeWidth={2} /><span>Confirmar</span>
              </button>
              <button className="agd-btn cancel" onClick={() => cancelarAgendamento(agendamento.id)}>Cancelar</button>
            </>
          )}
          {agendamento.status === 'confirmado' && (
            <button className="agd-btn start" onClick={() => iniciarTrabalho(agendamento.id)}>
              <TrendingUp size={16} strokeWidth={2} /><span>Iniciar Trabalho</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        .agd-container {
          background: #F2F2F7;
          min-height: 100vh;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        .agd-nav {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px) saturate(180%);
          border-bottom: 0.33px solid rgba(0, 0, 0, 0.1);
          position: sticky;
          top: 0;
          z-index: 100;
          padding: 20px;
        }
        .agd-nav-content {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 16px;
        }
        .agd-title-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .agd-title {
          font-size: 34px;
          font-weight: 700;
          color: #000;
          letter-spacing: -0.8px;
          line-height: 1;
          margin: 0;
        }
        .agd-subtitle {
          font-size: 13px;
          font-weight: 400;
          color: #8E8E93;
          letter-spacing: -0.08px;
          text-transform: capitalize;
        }
        .agd-btn-add {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #007AFF 0%, #0051D5 100%);
          border: none;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3), 0 2px 4px rgba(0, 122, 255, 0.2);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          color: #FFF;
        }
        .agd-btn-add:hover { transform: scale(1.05); box-shadow: 0 6px 16px rgba(0, 122, 255, 0.35); }
        .agd-btn-add:active { transform: scale(0.95); }
        .agd-overview {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          padding: 20px;
          background: #F2F2F7;
        }
        .agd-overview-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: #FFF;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .agd-overview-card:active { transform: scale(0.98); }
        .agd-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          flex-shrink: 0;
        }
        .agd-overview-card.confirmed .agd-icon {
          background: linear-gradient(135deg, #34C759 0%, #30D158 100%);
          color: #FFF;
        }
        .agd-overview-card.pending .agd-icon {
          background: linear-gradient(135deg, #FF9500 0%, #FF8C00 100%);
          color: #FFF;
        }
        .agd-overview-card.conflicts .agd-icon {
          background: linear-gradient(135deg, #FF3B30 0%, #FF2D55 100%);
          color: #FFF;
        }
        .agd-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .agd-value {
          font-size: 22px;
          font-weight: 600;
          color: #000;
          line-height: 1;
          font-variant-numeric: tabular-nums;
        }
        .agd-label {
          font-size: 12px;
          font-weight: 400;
          color: #8E8E93;
          letter-spacing: -0.05px;
        }
        .agd-timeline {
          padding: 24px 20px 140px;
          display: flex;
          flex-direction: column;
          gap: 32px;
          background: #F2F2F7;
        }
        .agd-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .agd-section-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 4px;
        }
        .agd-section-header svg {
          color: #8E8E93;
          flex-shrink: 0;
        }
        .agd-section-title {
          font-size: 17px;
          font-weight: 600;
          color: #000;
          letter-spacing: -0.4px;
        }
        .agd-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .agd-card {
          display: flex;
          flex-direction: column;
          gap: 14px;
          padding: 18px;
          background: #FFF;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .agd-card:active { transform: scale(0.99); }
        .agd-card.confirmado::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: linear-gradient(180deg, #34C759 0%, #30D158 100%);
        }
        .agd-card.pendente::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: linear-gradient(180deg, #FF9500 0%, #FF8C00 100%);
        }
        .agd-card.conflict {
          background: linear-gradient(90deg, rgba(255, 59, 48, 0.03) 0%, #FFF 100%);
          border: 1px solid rgba(255, 59, 48, 0.15);
        }
        .agd-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .agd-time {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          background: rgba(0, 0, 0, 0.04);
          border-radius: 10px;
        }
        .agd-time svg { color: #8E8E93; flex-shrink: 0; }
        .agd-time span {
          font-size: 14px;
          font-weight: 600;
          color: #1D1D1F;
          font-variant-numeric: tabular-nums;
          letter-spacing: -0.2px;
        }
        .agd-badge {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .agd-badge.confirmed {
          background: rgba(52, 199, 89, 0.15);
          color: #34C759;
        }
        .agd-badge.pending {
          background: rgba(255, 149, 0, 0.15);
          color: #FF9500;
        }
        .agd-body {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .agd-client {
          font-size: 20px;
          font-weight: 600;
          color: #000;
          line-height: 1.3;
          letter-spacing: -0.5px;
          margin: 0;
        }
        .agd-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .agd-detail {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .agd-detail svg { color: #8E8E93; flex-shrink: 0; }
        .agd-detail span {
          font-size: 15px;
          font-weight: 400;
          color: #3C3C43;
          letter-spacing: -0.2px;
        }
        .agd-ia-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 10px;
          background: linear-gradient(135deg, rgba(88, 86, 214, 0.1) 0%, rgba(88, 86, 214, 0.05) 100%);
          border-radius: 8px;
          margin-bottom: 4px;
        }
        .agd-ia-badge svg { color: #5856D6; flex-shrink: 0; opacity: 0.9; }
        .agd-ia-badge span {
          font-size: 12px;
          font-weight: 500;
          color: #5856D6;
          letter-spacing: -0.08px;
        }
        .agd-conflict {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          background: rgba(255, 59, 48, 0.1);
          border: 1px solid rgba(255, 59, 48, 0.2);
          border-radius: 12px;
        }
        .agd-conflict svg { color: #FF3B30; flex-shrink: 0; }
        .agd-conflict span {
          font-size: 13px;
          font-weight: 500;
          color: #FF3B30;
          letter-spacing: -0.1px;
        }
        .agd-actions {
          display: flex;
          gap: 10px;
          padding-top: 4px;
        }
        .agd-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 14px 16px;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: -0.2px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          min-height: 48px;
        }
        .agd-btn:active { transform: scale(0.97); }
        .agd-btn svg { flex-shrink: 0; }
        .agd-btn.confirm {
          background: linear-gradient(135deg, #34C759 0%, #30D158 100%);
          color: #FFF;
          box-shadow: 0 4px 12px rgba(52, 199, 89, 0.3), 0 2px 4px rgba(52, 199, 89, 0.2);
        }
        .agd-btn.confirm:hover { box-shadow: 0 6px 16px rgba(52, 199, 89, 0.35); }
        .agd-btn.cancel {
          background: rgba(0, 0, 0, 0.05);
          color: #FF3B30;
          border: 1px solid rgba(0, 0, 0, 0.1);
        }
        .agd-btn.cancel:hover { background: rgba(0, 0, 0, 0.08); }
        .agd-btn.start {
          background: linear-gradient(135deg, #007AFF 0%, #0051D5 100%);
          color: #FFF;
          box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3), 0 2px 4px rgba(0, 122, 255, 0.2);
        }
        .agd-btn.start:hover { box-shadow: 0 6px 16px rgba(0, 122, 255, 0.35); }
        .agd-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          padding: 80px 32px;
          text-align: center;
        }
        .agd-empty-icon {
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(0, 122, 255, 0.1), rgba(0, 122, 255, 0.05));
          border-radius: 24px;
          color: #007AFF;
        }
        .agd-empty-title {
          font-size: 22px;
          font-weight: 600;
          color: #000;
          letter-spacing: -0.5px;
          margin: 0;
        }
        .agd-empty-desc {
          font-size: 15px;
          font-weight: 400;
          color: #8E8E93;
          line-height: 1.5;
          letter-spacing: -0.2px;
          max-width: 280px;
          margin: 0;
        }
        .agd-empty-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 24px;
          background: linear-gradient(135deg, #007AFF 0%, #0051D5 100%);
          border: none;
          border-radius: 14px;
          cursor: pointer;
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif;
          font-size: 16px;
          font-weight: 600;
          color: #FFF;
          letter-spacing: -0.3px;
          box-shadow: 0 4px 16px rgba(0, 122, 255, 0.35), 0 2px 6px rgba(0, 122, 255, 0.25);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          min-height: 52px;
        }
        .agd-empty-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0, 122, 255, 0.4); }
        .agd-empty-btn:active { transform: translateY(0); }
        .agd-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: flex-end;
          animation: fadeIn 0.2s ease;
        }
        @media (min-width: 768px) {
          .agd-modal-overlay { align-items: center; justify-content: center; }
        }
        .agd-modal {
          width: 100%;
          max-width: 480px;
          background: #FFF;
          border-radius: 20px 20px 0 0;
          box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.15), 0 -4px 16px rgba(0, 0, 0, 0.1);
          animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          max-height: 90vh;
          overflow-y: auto;
        }
        @media (min-width: 768px) {
          .agd-modal { border-radius: 20px; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(100%); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .agd-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 24px 16px;
          border-bottom: 0.5px solid rgba(0, 0, 0, 0.1);
        }
        .agd-modal-title {
          font-size: 22px;
          font-weight: 600;
          color: #000;
          letter-spacing: -0.5px;
          margin: 0;
        }
        .agd-modal-close {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.05);
          border: none;
          border-radius: 50%;
          cursor: pointer;
          color: #3C3C43;
          transition: all 0.2s ease;
        }
        .agd-modal-close:hover { background: rgba(0, 0, 0, 0.1); }
        .agd-modal-close:active { transform: scale(0.95); }
        .agd-modal-body {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .agd-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .agd-field-label {
          font-size: 14px;
          font-weight: 500;
          color: #1D1D1F;
          letter-spacing: -0.15px;
        }
        .agd-field-input {
          width: 100%;
          padding: 14px 16px;
          background: #F5F5F7;
          border: 1px solid transparent;
          border-radius: 12px;
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif;
          font-size: 16px;
          font-weight: 400;
          color: #000;
          transition: all 0.2s ease;
        }
        .agd-field-input:focus {
          outline: none;
          background: #FFF;
          border-color: #007AFF;
          box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.1);
        }
        .agd-field-input::placeholder { color: #8E8E93; }
        .agd-field-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .agd-time-inputs {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .agd-time-input { flex: 1; }
        .agd-time-sep {
          font-size: 14px;
          color: #8E8E93;
          font-weight: 400;
        }
        .agd-tipo-selector {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .agd-tipo-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 16px;
          background: #F5F5F7;
          border: 2px solid transparent;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif;
          font-size: 15px;
          font-weight: 500;
          color: #3C3C43;
        }
        .agd-tipo-option:hover { background: #EBEBED; }
        .agd-tipo-option:active { transform: scale(0.98); }
        .agd-tipo-option.active {
          background: rgba(0, 122, 255, 0.1);
          border-color: #007AFF;
          color: #007AFF;
        }
        .agd-tipo-option svg { flex-shrink: 0; }
        .agd-modal-footer {
          padding: 16px 24px 24px;
          display: flex;
          gap: 12px;
          border-top: 0.5px solid rgba(0, 0, 0, 0.1);
        }
        .agd-modal-btn-cancel {
          flex: 1;
          padding: 14px 20px;
          background: rgba(0, 0, 0, 0.05);
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif;
          font-size: 16px;
          font-weight: 600;
          color: #3C3C43;
          transition: all 0.2s ease;
          min-height: 52px;
        }
        .agd-modal-btn-cancel:hover { background: rgba(0, 0, 0, 0.1); }
        .agd-modal-btn-cancel:active { transform: scale(0.98); }
        .agd-modal-btn-create {
          flex: 2;
          padding: 14px 20px;
          background: linear-gradient(135deg, #007AFF 0%, #0051D5 100%);
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif;
          font-size: 16px;
          font-weight: 600;
          color: #FFF;
          box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3), 0 2px 4px rgba(0, 122, 255, 0.2);
          transition: all 0.2s ease;
          min-height: 52px;
        }
        .agd-modal-btn-create:hover { box-shadow: 0 6px 16px rgba(0, 122, 255, 0.35); }
        .agd-modal-btn-create:active { transform: scale(0.98); }
        @media (max-width: 768px) {
          .agd-nav { padding: 16px; }
          .agd-title { font-size: 30px; }
          .agd-overview { grid-template-columns: 1fr; gap: 10px; padding: 16px; }
          .agd-timeline { padding: 20px 16px 140px; gap: 28px; }
          .agd-card { padding: 16px; }
          .agd-actions { flex-direction: column; gap: 8px; }
        }
      `}</style>

      <div className="agd-container">
        <div className="agd-nav">
          <div className="agd-nav-content">
            <div className="agd-title-group">
              <h1 className="agd-title">Hoje</h1>
              <span className="agd-subtitle">
                {dataAtual.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
            </div>
            <button className="agd-btn-add" onClick={() => setMostrarModal(true)}>
              <Plus size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        <div className="agd-overview">
          <div className="agd-overview-card confirmed">
            <div className="agd-icon"><CheckCircle2 size={24} strokeWidth={2} /></div>
            <div className="agd-content">
              <span className="agd-value">{totalConfirmados}</span>
              <span className="agd-label">Confirmados</span>
            </div>
          </div>
          <div className="agd-overview-card pending">
            <div className="agd-icon"><Clock size={24} strokeWidth={2} /></div>
            <div className="agd-content">
              <span className="agd-value">{totalPendentes}</span>
              <span className="agd-label">Pendentes</span>
            </div>
          </div>
          <div className="agd-overview-card conflicts">
            <div className="agd-icon"><AlertCircle size={24} strokeWidth={2} /></div>
            <div className="agd-content">
              <span className="agd-value">{totalConflitos}</span>
              <span className="agd-label">Conflitos</span>
            </div>
          </div>
        </div>

        <div className="agd-timeline">
          {agendamentosPorPeriodo.manha.length > 0 && (
            <div className="agd-section">
              <div className="agd-section-header">
                <Sunrise size={18} strokeWidth={2} />
                <span className="agd-section-title">Manhã</span>
              </div>
              <div className="agd-list">
                {agendamentosPorPeriodo.manha.map(renderAgendamento)}
              </div>
            </div>
          )}

          {agendamentosPorPeriodo.tarde.length > 0 && (
            <div className="agd-section">
              <div className="agd-section-header">
                <Sun size={18} strokeWidth={2} />
                <span className="agd-section-title">Tarde</span>
              </div>
              <div className="agd-list">
                {agendamentosPorPeriodo.tarde.map(renderAgendamento)}
              </div>
            </div>
          )}

          {agendamentosPorPeriodo.noite.length > 0 && (
            <div className="agd-section">
              <div className="agd-section-header">
                <Moon size={18} strokeWidth={2} />
                <span className="agd-section-title">Noite</span>
              </div>
              <div className="agd-list">
                {agendamentosPorPeriodo.noite.map(renderAgendamento)}
              </div>
            </div>
          )}

          {agendamentosHoje.length === 0 && (
            <div className="agd-empty">
              <div className="agd-empty-icon"><Clock size={48} strokeWidth={1.5} /></div>
              <h3 className="agd-empty-title">Nenhum agendamento</h3>
              <p className="agd-empty-desc">Você não tem compromissos agendados para hoje</p>
              <button className="agd-empty-btn" onClick={() => setMostrarModal(true)}>
                <Plus size={18} strokeWidth={2.5} /><span>Criar Agendamento</span>
              </button>
            </div>
          )}
        </div>

        {mostrarModal && (
          <div className="agd-modal-overlay" onClick={() => setMostrarModal(false)}>
            <div className="agd-modal" onClick={(e) => e.stopPropagation()}>
              <div className="agd-modal-header">
                <h2 className="agd-modal-title">Nova Promessa</h2>
                <button className="agd-modal-close" onClick={() => setMostrarModal(false)}>
                  <X size={20} strokeWidth={2} />
                </button>
              </div>
              <div className="agd-modal-body">
                <div className="agd-field">
                  <label className="agd-field-label">Cliente</label>
                  <input type="text" className="agd-field-input" placeholder="Nome do cliente"
                    value={novoAgendamento.cliente}
                    onChange={(e) => setNovoAgendamento(prev => ({ ...prev, cliente: e.target.value }))}
                    autoFocus />
                </div>
                <div className="agd-field-row">
                  <div className="agd-field">
                    <label className="agd-field-label">Data</label>
                    <input type="date" className="agd-field-input"
                      value={novoAgendamento.data}
                      onChange={(e) => setNovoAgendamento(prev => ({ ...prev, data: e.target.value }))} />
                  </div>
                  <div className="agd-field">
                    <label className="agd-field-label">Horário</label>
                    <div className="agd-time-inputs">
                      <input type="time" className="agd-field-input agd-time-input"
                        value={novoAgendamento.horarioInicio}
                        onChange={(e) => setNovoAgendamento(prev => ({ ...prev, horarioInicio: e.target.value }))} />
                      <span className="agd-time-sep">—</span>
                      <input type="time" className="agd-field-input agd-time-input"
                        value={novoAgendamento.horarioFim}
                        onChange={(e) => setNovoAgendamento(prev => ({ ...prev, horarioFim: e.target.value }))} />
                    </div>
                  </div>
                </div>
                <div className="agd-field">
                  <label className="agd-field-label">Tipo</label>
                  <div className="agd-tipo-selector">
                    <button className={`agd-tipo-option ${novoAgendamento.tipo === 'descarga' ? 'active' : ''}`}
                      onClick={() => setNovoAgendamento(prev => ({ ...prev, tipo: 'descarga' }))}>
                      <Truck size={18} strokeWidth={2} /><span>Descarga</span>
                    </button>
                    <button className={`agd-tipo-option ${novoAgendamento.tipo === 'carga' ? 'active' : ''}`}
                      onClick={() => setNovoAgendamento(prev => ({ ...prev, tipo: 'carga' }))}>
                      <Truck size={18} strokeWidth={2} /><span>Carga</span>
                    </button>
                  </div>
                </div>
                <div className="agd-field">
                  <label className="agd-field-label">Local</label>
                  <input type="text" className="agd-field-input" placeholder="Galpão, setor, pátio..."
                    value={novoAgendamento.local}
                    onChange={(e) => setNovoAgendamento(prev => ({ ...prev, local: e.target.value }))} />
                </div>
                <div className="agd-field">
                  <label className="agd-field-label">Tonelagem Prevista</label>
                  <input type="number" inputMode="decimal" className="agd-field-input" placeholder="0.0"
                    value={novoAgendamento.tonelagem}
                    onChange={(e) => setNovoAgendamento(prev => ({ ...prev, tonelagem: e.target.value }))} />
                </div>
              </div>
              <div className="agd-modal-footer">
                <button className="agd-modal-btn-cancel" onClick={() => setMostrarModal(false)}>Cancelar</button>
                <button className="agd-modal-btn-create" onClick={criarAgendamento}>Criar Promessa</button>
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
