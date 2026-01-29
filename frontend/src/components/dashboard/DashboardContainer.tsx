import React from 'react';
import { useDashboard } from '../../hooks/useDashboard';
import '../../styles/dashboard-forced.css';

interface DashboardContainerProps {
  children: React.ReactNode;
  className?: string;
  resetStyles?: boolean;
}

/**
 * Container principal do Dashboard
 * Gerencia background, classes e estilos base
 * Facilita redesigns futuros
 */
export const DashboardContainer: React.FC<DashboardContainerProps> = ({ 
  children, 
  className = '',
  resetStyles = false 
}) => {
  useDashboard();

  return (
    <div 
      className={`radar ${resetStyles ? 'dashboard-reset' : ''} ${className}`}
      style={{
        background: 'linear-gradient(180deg, #E8E8ED 0%, #F2F2F7 100%)',
        minHeight: '100vh',
        position: 'relative',
        zIndex: 1
      }}
    >
      {children}
    </div>
  );
};