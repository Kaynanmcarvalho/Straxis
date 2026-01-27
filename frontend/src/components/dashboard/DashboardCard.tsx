import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'red' | 'orange';
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon,
  trend,
  color = 'blue'
}) => {
  return (
    <div className={`dashboard-card dashboard-card-${color}`}>
      <div className="dashboard-card-header">
        <h3>{title}</h3>
        {icon && <span className="dashboard-card-icon">{icon}</span>}
      </div>
      
      <div className="dashboard-card-value">
        {value}
      </div>

      {trend && (
        <div className={`dashboard-card-trend ${trend.isPositive ? 'positive' : 'negative'}`}>
          <span className="trend-arrow">{trend.isPositive ? '↑' : '↓'}</span>
          <span className="trend-value">{Math.abs(trend.value)}%</span>
        </div>
      )}
    </div>
  );
};
