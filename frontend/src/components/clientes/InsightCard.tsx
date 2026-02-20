/**
 * Insight Card - Alerta Editorial Luxuoso
 * Superfície sutil, ícone discreto, CTA elegante
 */

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import './InsightCard.css';

interface InsightCardProps {
  texto: string;
  ctaLabel: string;
  onCTA: () => void;
  onDismiss?: () => void;
}

export const InsightCard: React.FC<InsightCardProps> = ({
  texto,
  ctaLabel,
  onCTA,
  onDismiss
}) => {
  return (
    <div className="insight-card-editorial">
      <div className="insight-content">
        <div className="insight-icon">
          <AlertTriangle size={18} />
        </div>
        
        <p className="insight-texto">{texto}</p>
        
        {onDismiss && (
          <button 
            className="insight-dismiss"
            onClick={onDismiss}
            aria-label="Dispensar"
          >
            <X size={16} />
          </button>
        )}
      </div>
      
      <button 
        className="insight-cta"
        onClick={onCTA}
      >
        {ctaLabel}
      </button>
    </div>
  );
};
