import React, { useState, useEffect } from 'react';
import { Loader, CheckCircle, AlertCircle } from 'lucide-react';
import './Steps.css';

interface Step2Props {
  dados: any;
  onUpdate: (dados: any) => void;
  onNext: () => void;
}

export const Step2Identificacao: React.FC<Step2Props> = ({ dados, onUpdate, onNext }) => {
  const [loadingCNPJ, setLoadingCNPJ] = useState(false);
  const [cnpjValido, setCnpjValido] = useState(false);
  const [showAutoFill, setShowAutoFill] = useState(false);

  const validarCNPJ = (cnpj: string): boolean => {
    cnpj = cnpj.replace(/[^\d]/g, '');
    if (cnpj.length !== 14) return false;
    
    // Validação básica de CNPJ
    if (/^(\d)\1+$/.test(cnpj)) return false;
    
    return true;
  };

  const validarCPF = (cpf: string): boolean => {
    cpf = cpf.replace(/[^\d]/g, '');
    if (cpf.length !== 11) return false;
    if (/^(\d)\1+$/.test(cpf)) return false;
    return true;
  };

  const formatarCNPJ = (value: string) => {
    const numeros = value.replace(/\D/g, '');
    if (numeros.length <= 14) {
      return numeros
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }
    return value;
  };

  const formatarCPF = (value: string) => {
    const numeros = value.replace(/\D/g, '');
    if (numeros.length <= 11) {
      return numeros
        .replace(/^(\d{3})(\d)/, '$1.$2')
        .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1-$2');
    }
    return value;
  };

  const handleCNPJChange = (value: string) => {
    const formatted = formatarCNPJ(value);
    onUpdate({ cnpj: formatted });
    
    const numeros = value.replace(/\D/g, '');
    if (numeros.length === 14) {
      const valido = validarCNPJ(numeros);
      setCnpjValido(valido);
      if (valido) {
        setShowAutoFill(true);
      }
    } else {
      setCnpjValido(false);
      setShowAutoFill(false);
    }
  };

  const buscarDadosCNPJ = async () => {
    setLoadingCNPJ(true);
    setShowAutoFill(false);
    
    try {
      const cnpjLimpo = dados.cnpj.replace(/\D/g, '');
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`);
      
      if (response.ok) {
        const data = await response.json();
        
        // Animação de preenchimento
        setTimeout(() => {
          onUpdate({
            razaoSocial: data.razao_social || data.nome_fantasia,
            nomeFantasia: data.nome_fantasia || data.razao_social,
            situacaoCadastral: data.descricao_situacao_cadastral,
            endereco: `${data.logradouro}, ${data.numero}${data.complemento ? ' - ' + data.complemento : ''}`,
            cidade: data.municipio,
            estado: data.uf,
            cep: data.cep,
            email: data.email || dados.email
          });
        }, 300);
      }
    } catch (error) {
      console.error('Erro ao buscar CNPJ:', error);
    } finally {
      setLoadingCNPJ(false);
    }
  };

  const podeAvancar = () => {
    if (dados.tipo === 'PF') {
      return dados.nome && dados.cpf && validarCPF(dados.cpf);
    } else {
      return dados.cnpj && validarCNPJ(dados.cnpj) && dados.razaoSocial;
    }
  };

  return (
    <div className="step-container">
      <div className="step-header">
        <h3 className="step-title">Identificação</h3>
        <p className="step-subtitle">
          {dados.tipo === 'PF' ? 'Dados pessoais' : 'Dados da empresa'}
        </p>
      </div>

      <div className="form-fields">
        {dados.tipo === 'PF' ? (
          <>
            <div className="form-group">
              <label className="form-label">Nome Completo</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: João Silva"
                value={dados.nome || ''}
                onChange={(e) => onUpdate({ nome: e.target.value })}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">CPF</label>
              <input
                type="text"
                className="form-input"
                placeholder="000.000.000-00"
                value={dados.cpf || ''}
                onChange={(e) => onUpdate({ cpf: formatarCPF(e.target.value) })}
                maxLength={14}
              />
              {dados.cpf && validarCPF(dados.cpf) && (
                <div className="input-feedback success">
                  <CheckCircle size={14} />
                  <span>CPF válido</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Data de Nascimento (opcional)</label>
              <input
                type="date"
                className="form-input"
                value={dados.dataNascimento || ''}
                onChange={(e) => onUpdate({ dataNascimento: e.target.value })}
              />
            </div>
          </>
        ) : (
          <>
            <div className="form-group">
              <label className="form-label">CNPJ</label>
              <input
                type="text"
                className="form-input"
                placeholder="00.000.000/0001-00"
                value={dados.cnpj || ''}
                onChange={(e) => handleCNPJChange(e.target.value)}
                maxLength={18}
                autoFocus
              />
              {dados.cnpj && cnpjValido && (
                <div className="input-feedback success">
                  <CheckCircle size={14} />
                  <span>CNPJ válido</span>
                </div>
              )}
            </div>

            {showAutoFill && !loadingCNPJ && (
              <button className="btn-autofill" onClick={buscarDadosCNPJ}>
                <span>Preencher automaticamente</span>
              </button>
            )}

            {loadingCNPJ && (
              <div className="loading-autofill">
                <Loader size={16} className="spinner" />
                <span>Buscando dados...</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Razão Social</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Empresa LTDA"
                value={dados.razaoSocial || ''}
                onChange={(e) => onUpdate({ razaoSocial: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nome Fantasia</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Minha Empresa"
                value={dados.nomeFantasia || ''}
                onChange={(e) => onUpdate({ nomeFantasia: e.target.value })}
              />
            </div>

            {dados.situacaoCadastral && (
              <div className="info-badge">
                <span>Situação: {dados.situacaoCadastral}</span>
              </div>
            )}
          </>
        )}
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
