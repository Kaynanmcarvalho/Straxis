import React from 'react';
import { CheckCircle } from 'lucide-react';
import './Steps.css';

interface Step3Props {
  dados: any;
  onUpdate: (dados: any) => void;
  onNext: () => void;
}

export const Step3Contato: React.FC<Step3Props> = ({ dados, onUpdate, onNext }) => {
  const formatarTelefone = (value: string) => {
    const numeros = value.replace(/\D/g, '');
    if (numeros.length <= 11) {
      if (numeros.length === 11) {
        return numeros.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      } else if (numeros.length === 10) {
        return numeros.replace(/^(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
      }
    }
    return value;
  };

  const formatarCEP = (value: string) => {
    const numeros = value.replace(/\D/g, '');
    if (numeros.length <= 8) {
      return numeros.replace(/^(\d{5})(\d)/, '$1-$2');
    }
    return value;
  };

  const validarEmail = (email: string): boolean => {
    if (!email) return true;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const podeAvancar = () => {
    return dados.telefone && dados.telefone.length >= 14;
  };

  return (
    <div className="step-container">
      <div className="step-header">
        <h3 className="step-title">Contato</h3>
        <p className="step-subtitle">Informações de comunicação</p>
      </div>

      <div className="form-fields">
        <div className="form-group">
          <label className="form-label">Telefone</label>
          <input
            type="tel"
            className="form-input"
            placeholder="(62) 99999-9999"
            value={dados.telefone || ''}
            onChange={(e) => onUpdate({ telefone: formatarTelefone(e.target.value) })}
            maxLength={15}
            autoFocus
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email (opcional)</label>
          <input
            type="email"
            className="form-input"
            placeholder="cliente@email.com"
            value={dados.email || ''}
            onChange={(e) => onUpdate({ email: e.target.value })}
          />
          {dados.email && validarEmail(dados.email) && (
            <div className="input-feedback success">
              <CheckCircle size={14} />
              <span>Email válido</span>
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">WhatsApp (opcional)</label>
          <input
            type="tel"
            className="form-input"
            placeholder="(62) 99999-9999"
            value={dados.whatsapp || dados.telefone || ''}
            onChange={(e) => onUpdate({ whatsapp: formatarTelefone(e.target.value) })}
            maxLength={15}
          />
          <p className="form-hint">Deixe em branco para usar o telefone principal</p>
        </div>

        <div className="form-divider" />

        <div className="form-group">
          <label className="form-label">CEP (opcional)</label>
          <input
            type="text"
            className="form-input"
            placeholder="00000-000"
            value={dados.cep || ''}
            onChange={(e) => onUpdate({ cep: formatarCEP(e.target.value) })}
            maxLength={9}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Endereço (opcional)</label>
          <input
            type="text"
            className="form-input"
            placeholder="Rua, número, complemento"
            value={dados.endereco || ''}
            onChange={(e) => onUpdate({ endereco: e.target.value })}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Cidade</label>
            <input
              type="text"
              className="form-input"
              placeholder="Goiânia"
              value={dados.cidade || ''}
              onChange={(e) => onUpdate({ cidade: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Estado</label>
            <input
              type="text"
              className="form-input"
              placeholder="GO"
              value={dados.estado || ''}
              onChange={(e) => onUpdate({ estado: e.target.value.toUpperCase() })}
              maxLength={2}
            />
          </div>
        </div>
      </div>

      <div className="step-footer">
        <button
          className="btn-next"
          onClick={onNext}
          disabled={!podeAvancar()}
        >
          Continuar
        </button>
      </div>
    </div>
  );
};
