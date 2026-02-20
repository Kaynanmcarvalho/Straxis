/**
 * Action Banner - Feedback Nativo Apple-like
 * Substitui alert/confirm genéricos
 */

import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';
import './ActionBanner.css';

interface ActionBannerProps {
  tipo: 'success' | 'error' | 'confirm';
  titulo: string;
  mensagem?: string;
  acoes?: Array<{
    label: string;
    onClick: () => void;
    primary?: boolean;
    destructive?: boolean;
  }>;
  duracao?: number;
  onDismiss: () => void;
}

export const ActionBanner: React.FC<ActionBannerProps> = ({
  tipo,
  titulo,
  mensagem,
  acoes = [],
  duracao = tipo === 'confirm' ? 0 : 4000,
  onDismiss
}) => {
  const [progresso, setProgresso] = useState(100);

  useEffect(() => {
    if (duracao === 0) return;
    
    const intervalo = 50;
    const decremento = (100 / duracao) * intervalo;
    
    const timer = setInterval(() => {
      setProgresso(prev => {
        const novo = prev - decremento;
        if (novo <= 0) {
          clearInterval(timer);
          onDismiss();
          return 0;
        }
        return novo;
      });
    }, intervalo);

    return () => clearInterval(timer);
  }, [duracao, onDismiss]);

  const getIcon = () => {
    switch (tipo) {
      case 'success':
        return <CheckCircle size={20} />;
      case 'error':
      case 'confirm':
        return <AlertCircle size={20} />;
    }
  };

  const getClassName = () => {
    return `action-banner action-banner-${tipo}`;
  };

  return (
    <div className={getClassName()}>
      <div className="action-banner-content">
        <div className="action-banner-icon">
          {getIcon()}
        </div>
        
        <div className="action-banner-text">
          <h4 className="action-banner-titulo">{titulo}</h4>
          {mensagem && <p className="action-banner-mensagem">{mensagem}</p>}
        </div>
        
        {tipo !== 'confirm' && (
          <button 
            className="action-banner-close"
            onClick={onDismiss}
            aria-label="Dispensar"
          >
            <X size={18} />
          </button>
        )}
      </div>
      
      {acoes.length > 0 && (
        <div className="action-banner-acoes">
          {acoes.map((acao, index) => (
            <button
              key={index}
              className={`action-banner-acao ${acao.primary ? 'primary' : ''} ${acao.destructive ? 'destructive' : ''}`}
              onClick={() => {
                acao.onClick();
                if (tipo !== 'confirm') onDismiss();
              }}
            >
              {acao.label}
            </button>
          ))}
        </div>
      )}
      
      {duracao > 0 && (
        <div className="action-banner-progresso">
          <div 
            className="action-banner-progresso-bar"
            style={{ width: `${progresso}%` }}
          />
        </div>
      )}
    </div>
  );
};
