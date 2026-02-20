/**
 * Success Banner - Apple Native Style
 * Banner compacto top com ações inline
 */

import React, { useEffect, useState } from 'react';
import { CheckCircle, X } from 'lucide-react';
import './SuccessBanner.css';

interface SuccessBannerProps {
  titulo: string;
  subtexto?: string;
  acoes?: Array<{
    label: string;
    onClick: () => void;
    primary?: boolean;
  }>;
  duracao?: number;
  onDismiss: () => void;
}

export const SuccessBanner: React.FC<SuccessBannerProps> = ({
  titulo,
  subtexto,
  acoes = [],
  duracao = 5000,
  onDismiss
}) => {
  const [progresso, setProgresso] = useState(100);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [translateY, setTranslateY] = useState(0);

  useEffect(() => {
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

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const currentY = e.touches[0].clientY;
    const diff = startY - currentY;
    
    if (diff > 0) {
      setTranslateY(-diff);
    }
  };

  const handleTouchEnd = () => {
    if (translateY < -50) {
      onDismiss();
    } else {
      setTranslateY(0);
    }
    setIsDragging(false);
  };

  return (
    <div 
      className="success-banner-native"
      style={{ transform: `translateY(${translateY}px)` }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="banner-content">
        <div className="banner-icon">
          <CheckCircle size={20} />
        </div>
        
        <div className="banner-text">
          <h4 className="banner-titulo">{titulo}</h4>
          {subtexto && <p className="banner-subtexto">{subtexto}</p>}
        </div>
        
        <button 
          className="banner-close"
          onClick={onDismiss}
          aria-label="Dispensar"
        >
          <X size={18} />
        </button>
      </div>
      
      {acoes.length > 0 && (
        <div className="banner-acoes">
          {acoes.map((acao, index) => (
            <button
              key={index}
              className={`banner-acao ${acao.primary ? 'primary' : 'secondary'}`}
              onClick={() => {
                acao.onClick();
                onDismiss();
              }}
            >
              {acao.label}
            </button>
          ))}
        </div>
      )}
      
      <div className="banner-progresso">
        <div 
          className="banner-progresso-bar"
          style={{ width: `${progresso}%` }}
        />
      </div>
    </div>
  );
};
