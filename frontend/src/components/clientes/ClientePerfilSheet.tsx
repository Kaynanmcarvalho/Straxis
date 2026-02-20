import React from 'react';
import { 
  X,
  MessageSquare,
  Mail,
  MapPin,
  Calendar,
  Package,
  Edit,
  Trash2
} from 'lucide-react';
import { Cliente } from '../../types/cliente.types';
import './ClientePerfilSheet.css';

interface ClientePerfilSheetProps {
  cliente: Cliente;
  onClose: () => void;
  onUpdate?: () => void;
}

export const ClientePerfilSheet: React.FC<ClientePerfilSheetProps> = ({
  cliente,
  onClose
}) => {
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

  const abrirWhatsApp = () => {
    const numeros = cliente.telefone.replace(/\D/g, '');
    window.open(`https://wa.me/55${numeros}`, '_blank');
  };

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet-content perfil-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Handle */}
        <div className="sheet-handle" />
        
        {/* Header */}
        <div className="sheet-header">
          <button className="sheet-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Avatar & Nome */}
        <div className="perfil-header-section">
          <div className="perfil-avatar-large">
            {getInitials(cliente.nome)}
          </div>
          <h2 className="perfil-nome">{cliente.nome}</h2>
          <span className="perfil-status">{cliente.status}</span>
        </div>

        {/* Resumo Financeiro */}
        <div className="perfil-section">
          <h3 className="section-title">Resumo Financeiro</h3>
          <div className="resumo-grid">
            <div className="resumo-item">
              <span className="resumo-label">Receita mês</span>
              <span className="resumo-value">{formatCurrency(cliente.receitaMes)}</span>
            </div>
            <div className="resumo-item">
              <span className="resumo-label">Receita total</span>
              <span className="resumo-value">{formatCurrency(cliente.receitaTotal)}</span>
            </div>
            <div className="resumo-item">
              <span className="resumo-label">Ticket médio</span>
              <span className="resumo-value">
                {formatCurrency(cliente.ticketMedio)}
              </span>
            </div>
            <div className="resumo-item">
              <span className="resumo-label">Crescimento</span>
              <span className={`resumo-value ${cliente.crescimentoMes >= 0 ? 'positivo' : 'negativo'}`}>
                {cliente.crescimentoMes >= 0 ? '+' : ''}{cliente.crescimentoMes.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        {/* Operações */}
        <div className="perfil-section">
          <h3 className="section-title">Operações</h3>
          <div className="operacoes-lista">
            <div className="operacao-item">
              <Package size={20} />
              <span>{cliente.totalOperacoes} operações realizadas</span>
            </div>
          </div>
        </div>

        {/* Comunicação */}
        <div className="perfil-section">
          <h3 className="section-title">Comunicação</h3>
          <div className="comunicacao-lista">
            <button className="comunicacao-item" onClick={abrirWhatsApp}>
              <MessageSquare size={20} />
              <div className="comunicacao-info">
                <span className="comunicacao-label">WhatsApp</span>
                <span className="comunicacao-value">{cliente.telefone}</span>
              </div>
            </button>
            
            {cliente.email && (
              <a href={`mailto:${cliente.email}`} className="comunicacao-item">
                <Mail size={20} />
                <div className="comunicacao-info">
                  <span className="comunicacao-label">Email</span>
                  <span className="comunicacao-value">{cliente.email}</span>
                </div>
              </a>
            )}
            
            {cliente.endereco && (
              <div className="comunicacao-item">
                <MapPin size={20} />
                <div className="comunicacao-info">
                  <span className="comunicacao-label">Endereço</span>
                  <span className="comunicacao-value">{cliente.endereco}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Ações */}
        <div className="perfil-acoes">
          <button className="btn-acao-sheet primary">
            <Calendar size={20} />
            <span>Nova operação</span>
          </button>
          <button className="btn-acao-sheet secondary">
            <Edit size={20} />
            <span>Editar</span>
          </button>
          <button className="btn-acao-sheet danger">
            <Trash2 size={20} />
            <span>Arquivar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
