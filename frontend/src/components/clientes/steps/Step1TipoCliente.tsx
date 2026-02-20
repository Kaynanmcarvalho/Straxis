import React from 'react';
import { User, Building2 } from 'lucide-react';
import './Steps.css';

interface Step1Props {
  dados: any;
  onUpdate: (dados: any) => void;
  onNext: () => void;
}

export const Step1TipoCliente: React.FC<Step1Props> = ({ dados, onUpdate, onNext }) => {
  const selecionarTipo = (tipo: 'PF' | 'PJ') => {
    onUpdate({ tipo });
    // Avançar automaticamente após 300ms (tempo para animação)
    setTimeout(() => {
      onNext();
    }, 300);
  };

  return (
    <div className="step-container">
      <div className="step-header">
        <h3 className="step-title">Tipo de Cliente</h3>
        <p className="step-subtitle">Selecione o tipo de cadastro</p>
      </div>

      <div className="tipo-options">
        <button
          className={`tipo-card ${dados.tipo === 'PF' ? 'selected' : ''}`}
          onClick={() => selecionarTipo('PF')}
        >
          <div className="tipo-icon">
            <User size={32} />
          </div>
          <div className="tipo-content">
            <h4 className="tipo-title">Pessoa Física</h4>
            <p className="tipo-description">Cliente individual</p>
          </div>
          {dados.tipo === 'PF' && (
            <div className="tipo-check">
              <div className="check-circle" />
            </div>
          )}
        </button>

        <button
          className={`tipo-card ${dados.tipo === 'PJ' ? 'selected' : ''}`}
          onClick={() => selecionarTipo('PJ')}
        >
          <div className="tipo-icon">
            <Building2 size={32} />
          </div>
          <div className="tipo-content">
            <h4 className="tipo-title">Pessoa Jurídica</h4>
            <p className="tipo-description">Empresa ou organização</p>
          </div>
          {dados.tipo === 'PJ' && (
            <div className="tipo-check">
              <div className="check-circle" />
            </div>
          )}
        </button>
      </div>
    </div>
  );
};
