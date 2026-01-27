import React, { useState, useEffect } from 'react';
import { Agendamento } from '../../types/agendamento.types';
import { agendamentoService } from '../../services/agendamento.service';

interface AgendamentoCalendarProps {
  onEdit?: (agendamentoId: string) => void;
}

export const AgendamentoCalendar: React.FC<AgendamentoCalendarProps> = ({ onEdit }) => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    loadAgendamentos();
  }, []);

  const loadAgendamentos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await agendamentoService.list();
      setAgendamentos(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar agendamentos');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    agendamentoId: string,
    newStatus: 'pendente' | 'confirmado' | 'cancelado' | 'concluido'
  ) => {
    try {
      await agendamentoService.updateStatus(agendamentoId, newStatus);
      loadAgendamentos();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao atualizar status');
    }
  };

  const handleDelete = async (agendamentoId: string) => {
    if (!confirm('Tem certeza que deseja deletar este agendamento?')) {
      return;
    }

    try {
      await agendamentoService.delete(agendamentoId);
      loadAgendamentos();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao deletar agendamento');
    }
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      pendente: '#FFA500',
      confirmado: '#4CAF50',
      cancelado: '#F44336',
      concluido: '#2196F3',
    };
    return colors[status] || '#757575';
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      pendente: 'Pendente',
      confirmado: 'Confirmado',
      cancelado: 'Cancelado',
      concluido: 'Concluído',
    };
    return labels[status] || status;
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const formatCurrency = (centavos: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(centavos / 100);
  };

  // Agrupar agendamentos por data
  const agendamentosPorData = agendamentos.reduce((acc, agendamento) => {
    const dateKey = new Date(agendamento.data).toDateString();
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(agendamento);
    return acc;
  }, {} as Record<string, Agendamento[]>);

  // Ordenar datas
  const datasOrdenadas = Object.keys(agendamentosPorData).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  if (loading) {
    return <div className="loading">Carregando agendamentos...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="agendamento-calendar">
      <div className="calendar-header">
        <h2>Agendamentos</h2>
        <span className="count">{agendamentos.length} agendamento(s)</span>
      </div>

      {agendamentos.length === 0 ? (
        <div className="empty-state">
          <p>Nenhum agendamento encontrado</p>
        </div>
      ) : (
        <div className="calendar-timeline">
          {datasOrdenadas.map((dateKey) => (
            <div key={dateKey} className="date-group">
              <h3 className="date-header">
                {new Intl.DateTimeFormat('pt-BR', {
                  weekday: 'long',
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                }).format(new Date(dateKey))}
              </h3>
              <div className="agendamentos-list">
                {agendamentosPorData[dateKey].map((agendamento) => (
                  <div key={agendamento.id} className="agendamento-card">
                    <div className="card-header">
                      <span
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(agendamento.status) }}
                      >
                        {getStatusLabel(agendamento.status)}
                      </span>
                      <span className="time">
                        {new Date(agendamento.data).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="card-body">
                      <div className="info-row">
                        <strong>Tipo:</strong> {agendamento.tipo}
                      </div>
                      <div className="info-row">
                        <strong>Tonelagem:</strong> {agendamento.tonelagem}t
                      </div>
                      <div className="info-row">
                        <strong>Valor Estimado:</strong>{' '}
                        {formatCurrency(agendamento.valorEstimadoCentavos)}
                      </div>
                      {agendamento.funcionarios && agendamento.funcionarios.length > 0 && (
                        <div className="info-row">
                          <strong>Funcionários:</strong> {agendamento.funcionarios.length}
                        </div>
                      )}
                      {agendamento.observacoes && (
                        <div className="info-row">
                          <strong>Obs:</strong> {agendamento.observacoes}
                        </div>
                      )}
                    </div>
                    <div className="card-actions">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(agendamento.id)}
                          className="btn-edit"
                          title="Editar"
                        >
                          ✏️
                        </button>
                      )}
                      <select
                        value={agendamento.status}
                        onChange={(e) =>
                          handleStatusChange(
                            agendamento.id,
                            e.target.value as any
                          )
                        }
                        className="status-select"
                      >
                        <option value="pendente">Pendente</option>
                        <option value="confirmado">Confirmado</option>
                        <option value="cancelado">Cancelado</option>
                        <option value="concluido">Concluído</option>
                      </select>
                      <button
                        onClick={() => handleDelete(agendamento.id)}
                        className="btn-delete"
                        title="Deletar"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
