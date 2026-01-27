import React, { useState, useEffect } from 'react';
import { logService, Log, LogFilters } from '../../services/log.service';

export const LogsViewer: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<LogFilters>({
    limit: 100,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 20;

  useEffect(() => {
    loadLogs();
  }, [filters]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await logService.list(filters);
      setLogs(data);
      setCurrentPage(1);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar logs');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value || undefined,
    }));
  };

  const handleDateChange = (name: 'startDate' | 'endDate', value: string) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value ? new Date(value) : undefined,
    }));
  };

  const clearFilters = () => {
    setFilters({ limit: 100 });
  };

  const getTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      access: 'Acesso',
      ia_usage: 'Uso de IA',
      whatsapp: 'WhatsApp',
      critical_change: 'Alteração Crítica',
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      access: '#4CAF50',
      ia_usage: '#2196F3',
      whatsapp: '#25D366',
      critical_change: '#FF9800',
    };
    return colors[type] || '#757575';
  };

  const formatTimestamp = (date: Date): string => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  // Paginação
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = logs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(logs.length / logsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (loading) {
    return <div className="loading">Carregando logs...</div>;
  }

  return (
    <div className="logs-viewer">
      <div className="viewer-header">
        <h2>Logs do Sistema</h2>
      </div>

      {/* Filtros */}
      <div className="filters-section">
        <h3>Filtros</h3>
        <div className="filters-grid">
          <div className="filter-group">
            <label htmlFor="companyId">ID da Empresa</label>
            <input
              type="text"
              id="companyId"
              name="companyId"
              value={filters.companyId || ''}
              onChange={handleFilterChange}
              placeholder="ID da empresa"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="userId">ID do Usuário</label>
            <input
              type="text"
              id="userId"
              name="userId"
              value={filters.userId || ''}
              onChange={handleFilterChange}
              placeholder="ID do usuário"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="type">Tipo</label>
            <select
              id="type"
              name="type"
              value={filters.type || ''}
              onChange={handleFilterChange}
            >
              <option value="">Todos</option>
              <option value="access">Acesso</option>
              <option value="ia_usage">Uso de IA</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="critical_change">Alteração Crítica</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="startDate">Data Inicial</label>
            <input
              type="datetime-local"
              id="startDate"
              onChange={(e) => handleDateChange('startDate', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="endDate">Data Final</label>
            <input
              type="datetime-local"
              id="endDate"
              onChange={(e) => handleDateChange('endDate', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="limit">Limite</label>
            <input
              type="number"
              id="limit"
              name="limit"
              value={filters.limit || 100}
              onChange={handleFilterChange}
              min="10"
              max="1000"
            />
          </div>
        </div>

        <div className="filter-actions">
          <button onClick={loadLogs} className="btn-primary">
            Aplicar Filtros
          </button>
          <button onClick={clearFilters} className="btn-secondary">
            Limpar Filtros
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Lista de Logs */}
      <div className="logs-list">
        <div className="list-info">
          <span>
            Exibindo {indexOfFirstLog + 1} - {Math.min(indexOfLastLog, logs.length)} de{' '}
            {logs.length} logs
          </span>
        </div>

        {currentLogs.length === 0 ? (
          <div className="empty-state">
            <p>Nenhum log encontrado</p>
          </div>
        ) : (
          <div className="logs-table">
            {currentLogs.map((log) => (
              <div key={log.id} className="log-item">
                <div className="log-header">
                  <span
                    className="log-type"
                    style={{ backgroundColor: getTypeColor(log.type) }}
                  >
                    {getTypeLabel(log.type)}
                  </span>
                  <span className="log-timestamp">{formatTimestamp(log.timestamp)}</span>
                </div>
                <div className="log-action">{log.action}</div>
                <div className="log-meta">
                  {log.companyId && <span>Empresa: {log.companyId}</span>}
                  {log.userId && <span>Usuário: {log.userId}</span>}
                </div>
                {Object.keys(log.details).length > 0 && (
                  <details className="log-details">
                    <summary>Detalhes</summary>
                    <pre>{JSON.stringify(log.details, null, 2)}</pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="btn-page"
            >
              ← Anterior
            </button>
            <span className="page-info">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="btn-page"
            >
              Próxima →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
