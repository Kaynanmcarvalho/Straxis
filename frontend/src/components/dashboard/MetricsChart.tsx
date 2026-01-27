import React from 'react';

interface MetricsChartProps {
  data: Array<{
    month: string;
    revenueCentavos: number;
  }>;
}

export const MetricsChart: React.FC<MetricsChartProps> = ({ data }) => {
  const formatCurrency = (centavos: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(centavos / 100);
  };

  const maxValue = Math.max(...data.map(d => d.revenueCentavos));

  return (
    <div className="metrics-chart">
      <h3>Faturamento Mensal</h3>
      
      <div className="chart-container">
        <div className="chart-bars">
          {data.map((item, index) => {
            const heightPercent = maxValue > 0 ? (item.revenueCentavos / maxValue) * 100 : 0;
            
            return (
              <div key={index} className="chart-bar-wrapper">
                <div className="chart-bar-container">
                  <div 
                    className="chart-bar"
                    style={{ height: `${heightPercent}%` }}
                    title={formatCurrency(item.revenueCentavos)}
                  >
                    <span className="chart-bar-value">
                      {formatCurrency(item.revenueCentavos)}
                    </span>
                  </div>
                </div>
                <div className="chart-bar-label">{item.month}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
