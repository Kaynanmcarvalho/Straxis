import React, { useState, useEffect } from 'react';
import { Trabalho } from '../../types/trabalho.types';
import { trabalhoService } from '../../services/trabalho.service';

interface TrabalhoDetailProps {
  trabalhoId: string;
  onClose?: () => void;
}

export const TrabalhoDetail: React.FC<TrabalhoDetailProps> = ({ trabalhoId, onClose }) => {
  const [trabalho, setTrabalho] = useState<Trabalho | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTrabalho();
  }, [trabalhoId]);

  const loadTrabalho = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await trabalhoService.getById(trabalhoId);
      setTrabalho(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar trabalho');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (centavos: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(centavos / 100);
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

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!trabalho) {
    return <div className="error-message">Trabalho não encontrado</div>;
  }

  return (
    <div className="trabalho-detail">
      <div className="detail-header">
        <h2>Detalhes do Trabalho</h2>
        {onClose && (
          <button onClick={onClose} className="btn-close">
            ✕
          </button>
        )}
      </div>

      <div className="detail-content">
        <div className="info-section">
          <h3>Informações Gerais</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Data:</label>
              <span>{formatDate(trabalho.data)}</span>
            </div>
            <div className="info-item">
              <label>Tipo:</label>
              <span>{trabalho.tipo}</span>
            </div>
            <div className="info-item">
              <label>Tonelagem:</label>
              <span>{trabalho.tonelagem}t</span>
            </div>
          </div>
        </div>

        <div className="info-section">
          <h3>Valores</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Valor Recebido:</label>
              <span className="value-positive">
                {formatCurrency(trabalho.valorRecebidoCentavos)}
              </span>
            </div>
            <div className="info-item">
              <label>Total Pago:</label>
              <span className="value-negative">
                {formatCurrency(trabalho.totalPagoCentavos)}
              </span>
            </div>
            <div className="info-item">
              <label>Lucro:</label>
              <span className={trabalho.lucroCentavos >= 0 ? 'value-positive' : 'value-negative'}>
                {formatCurrency(trabalho.lucroCentavos)}
              </span>
            </div>
          </div>
        </div>

        <div className="info-section">
          <h3>Funcionários</h3>
          <div className="funcionarios-table">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Valor Pago</th>
                </tr>
              </thead>
              <tbody>
                {trabalho.funcionarios?.map((func, index) => (
                  <tr key={index}>
                    <td>{func.funcionarioNome}</td>
                    <td>{formatCurrency(func.valorPagoCentavos)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {trabalho.observacoes && (
          <div className="info-section">
            <h3>Observações</h3>
            <p>{trabalho.observacoes}</p>
          </div>
        )}
      </div>
    </div>
  );
};
