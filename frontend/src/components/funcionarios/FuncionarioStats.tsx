import React, { useState, useEffect } from 'react';
import { FuncionarioStats as FuncionarioStatsType } from '../../types/funcionario.types';
import { funcionarioService } from '../../services/funcionario.service';

interface FuncionarioStatsProps {
  funcionarioId: string;
  onClose: () => void;
}

export const FuncionarioStats: React.FC<FuncionarioStatsProps> = ({
  funcionarioId,
  onClose
}) => {
  const [stats, setStats] = useState<FuncionarioStatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadStats();
  }, [funcionarioId, startDate, endDate]);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await funcionarioService.getStats(
        funcionarioId,
        startDate || undefined,
        endDate || undefined
      );
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (centavos: number): string => {
    const reais = centavos / 100;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(reais);
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="funcionario-stats-modal">
        <div className="modal-content">
          <div className="loading">Carregando estatísticas...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="funcionario-stats-modal">
        <div className="modal-content">
          <div className="error-message">{error}</div>
          <button onClick={onClose}>Fechar</button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="funcionario-stats-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Estatísticas - {stats.funcionarioNome}</h2>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>

        <div className="filters">
          <div className="form-group">
            <label htmlFor="startDate">Data Inicial</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="endDate">Data Final</label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="stats-summary">
          <div className="stat-card">
            <h3>Total Recebido</h3>
            <p className="stat-value">{formatCurrency(stats.totalRecebidoCentavos)}</p>
          </div>
          <div className="stat-card">
            <h3>Total de Trabalhos</h3>
            <p className="stat-value">{stats.totalTrabalhos}</p>
          </div>
        </div>

        <div className="historico">
          <h3>Histórico de Trabalhos</h3>
          {stats.historicoTrabalhos.length === 0 ? (
            <p className="empty-state">Nenhum trabalho encontrado no período</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Tipo</th>
                  <th>Valor Recebido</th>
                </tr>
              </thead>
              <tbody>
                {stats.historicoTrabalhos.map((trabalho, index) => (
                  <tr key={`${trabalho.trabalhoId}-${index}`}>
                    <td>{formatDate(trabalho.data)}</td>
                    <td>
                      <span className={`tipo ${trabalho.tipo}`}>
                        {trabalho.tipo === 'carga' ? '📦 Carga' : '📤 Descarga'}
                      </span>
                    </td>
                    <td>{formatCurrency(trabalho.valorPagoCentavos)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  );
};
