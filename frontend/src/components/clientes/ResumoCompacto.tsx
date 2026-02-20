/**
 * Resumo Compacto - Apple Health/Wallet Style
 * Faixa com valores-chave, divisores sutis, zero caixas quadradas
 */

import React from 'react';
import { ClienteMetricas } from '../../types/cliente.types';
import './ResumoCompacto.css';

interface ResumoCompactoProps {
  metricas: ClienteMetricas;
}

export const ResumoCompacto: React.FC<ResumoCompactoProps> = ({ metricas }) => {
  const formatCurrency = (centavos: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(centavos / 100);
  };

  const metricasExibir = [
    {
      label: 'Ativos',
      valor: metricas.ativos.toString(),
      destaque: metricas.ativos > 0
    },
    {
      label: 'Em serviço',
      valor: metricas.emServico.toString(),
      destaque: metricas.emServico > 0
    },
    {
      label: 'Inativos',
      valor: metricas.inativos.toString(),
      destaque: false
    },
    {
      label: 'Receita mês',
      valor: formatCurrency(metricas.receitaMes),
      destaque: metricas.receitaMes > 0
    },
    {
      label: 'Ticket médio',
      valor: formatCurrency(metricas.ticketMedio),
      destaque: false
    }
  ];

  return (
    <div className="resumo-compacto-apple">
      {metricasExibir.map((metrica, index) => (
        <React.Fragment key={index}>
          <div className="resumo-item-compacto">
            <span className="resumo-label-compacto">{metrica.label}</span>
            <span className={`resumo-valor-compacto ${metrica.destaque ? 'destaque' : ''}`}>
              {metrica.valor}
            </span>
          </div>
          
          {index < metricasExibir.length - 1 && (
            <div className="resumo-divisor" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
