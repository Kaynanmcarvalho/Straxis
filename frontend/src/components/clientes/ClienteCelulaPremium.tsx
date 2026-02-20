/**
 * Célula de Cliente - Apple Native Premium
 * Hierarquia impecável, swipe actions, estados visuais
 */

import React, { useState, useRef } from 'react';
import { ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { Cliente } from '../../types/cliente.types';
import { gerarTextoContextoCliente } from '../../utils/cliente.logic';
import './ClienteCelulaPremium.css';

interface ClienteCelulaPremiumProps {
  cliente: Cliente;
  onClick: () => void;
  onNovaOperacao?: () => void;
  onCobrar?: () => void;
}

export const ClienteCelulaPremium: React.FC<ClienteCelulaPremiumProps> = ({
  cliente,
  onClick,
  onNovaOperacao,
  onCobrar
}) => {
  const [swipeX, setSwipeX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);

  const formatCurrency = (centavos: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(centavos / 100);
  };

  const getInitials = (nome: string) => {
    const words = nome.split(' ');
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return nome.substring(0, 2).toUpperCase();
  };

  const getStatusPill = () => {
    const statusMap = {
      novo: { label: 'Novo', className: 'status-novo' },
      ativo: { label: 'Ativo', className: 'status-ativo' },
      em_servico: { label: 'Em serviço', className: 'status-em-servico' },
      inativo: { label: 'Inativo', className: 'status-inativo' },
      arquivado: { label: 'Arquivado', className: 'status-arquivado' }
    };
    
    return statusMap[cliente.status] || statusMap.novo;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    currentX.current = e.touches[0].clientX;
    const diff = currentX.current - startX.current;
    
    // Limitar swipe entre -160 e 160
    const limitedDiff = Math.max(-160, Math.min(160, diff));
    setSwipeX(limitedDiff);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    
    // Se swipe > 80px, executar ação
    if (swipeX > 80 && onNovaOperacao) {
      onNovaOperacao();
    } else if (swipeX < -80 && onCobrar) {
      onCobrar();
    }
    
    // Reset
    setSwipeX(0);
  };

  const statusPill = getStatusPill();
  const contexto = gerarTextoContextoCliente(cliente);

  return (
    <div className="cliente-celula-container">
      {/* Ações de Swipe (background) */}
      <div className="swipe-actions">
        <div className="swipe-action-left">
          <span>Nova operação</span>
        </div>
        <div className="swipe-action-right">
          <span>Cobrar</span>
        </div>
      </div>

      {/* Célula Principal */}
      <div
        className="cliente-celula-premium"
        style={{ transform: `translateX(${swipeX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => !isDragging && onClick()}
      >
        <div className="celula-content">
          {/* Avatar */}
          <div className={`celula-avatar ${cliente.status === 'em_servico' ? 'pulsante' : ''}`}>
            {getInitials(cliente.nome)}
            {cliente.status === 'em_servico' && (
              <div className="avatar-pulse" />
            )}
          </div>

          {/* Info */}
          <div className="celula-info">
            <div className="celula-header">
              <h3 className="celula-nome">{cliente.nome}</h3>
              {cliente.isVIP && (
                <span className="celula-vip">VIP</span>
              )}
            </div>
            
            <div className="celula-meta-row">
              <p className="celula-contexto">{contexto}</p>
              <span className={`celula-status-pill ${statusPill.className}`}>
                {statusPill.label}
              </span>
            </div>
          </div>

          {/* Valores */}
          <div className="celula-valores">
            <span className="celula-receita">
              {formatCurrency(cliente.receitaTotal)}
            </span>
            
            {cliente.crescimentoMes !== 0 && (
              <div className={`celula-tendencia ${cliente.crescimentoMes > 0 ? 'positiva' : 'negativa'}`}>
                {cliente.crescimentoMes > 0 ? (
                  <TrendingUp size={11} />
                ) : (
                  <TrendingDown size={11} />
                )}
                <span>{Math.abs(cliente.crescimentoMes).toFixed(0)}%</span>
              </div>
            )}
          </div>

          {/* Chevron */}
          <ChevronRight size={18} className="celula-chevron" />
        </div>
      </div>
    </div>
  );
};
