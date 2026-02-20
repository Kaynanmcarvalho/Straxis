import React from 'react';
import { Edit, Check, Loader } from 'lucide-react';
import './Steps.css';

interface Step4Props {
  dados: any;
  onEdit: (step: number) => void;
  onSave: () => void;
  loading: boolean;
}

export const Step4Revisao: React.FC<Step4Props> = ({ dados, onEdit, onSave, loading }) => {
  return (
    <div className="step-container">
      <div className="step-header">
        <h3 className="step-title">Revisar Informações</h3>
        <p className="step-subtitle">Confirme os dados antes de salvar</p>
      </div>

      <div className="revisao-content">
        {/* Tipo */}
        <div className="revisao-section">
          <div className="revisao-header">
            <h4 className="revisao-section-title">Tipo de Cliente</h4>
            <button className="btn-edit" onClick={() => onEdit(1)}>
              <Edit size={16} />
            </button>
          </div>
          <div className="revisao-item">
            <span className="revisao-label">Tipo</span>
            <span className="revisao-value">
              {dados.tipo === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}
            </span>
          </div>
        </div>

        {/* Identificação */}
        <div className="revisao-section">
          <div className="revisao-header">
            <h4 className="revisao-section-title">Identificação</h4>
            <button className="btn-edit" onClick={() => onEdit(2)}>
              <Edit size={16} />
            </button>
          </div>
          
          {dados.tipo === 'PF' ? (
            <>
              <div className="revisao-item">
                <span className="revisao-label">Nome</span>
                <span className="revisao-value">{dados.nome}</span>
              </div>
              <div className="revisao-item">
                <span className="revisao-label">CPF</span>
                <span className="revisao-value">{dados.cpf}</span>
              </div>
              {dados.dataNascimento && (
                <div className="revisao-item">
                  <span className="revisao-label">Data de Nascimento</span>
                  <span className="revisao-value">
                    {new Date(dados.dataNascimento).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="revisao-item">
                <span className="revisao-label">CNPJ</span>
                <span className="revisao-value">{dados.cnpj}</span>
              </div>
              <div className="revisao-item">
                <span className="revisao-label">Razão Social</span>
                <span className="revisao-value">{dados.razaoSocial}</span>
              </div>
              {dados.nomeFantasia && (
                <div className="revisao-item">
                  <span className="revisao-label">Nome Fantasia</span>
                  <span className="revisao-value">{dados.nomeFantasia}</span>
                </div>
              )}
              {dados.situacaoCadastral && (
                <div className="revisao-item">
                  <span className="revisao-label">Situação</span>
                  <span className="revisao-value">{dados.situacaoCadastral}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Contato */}
        <div className="revisao-section">
          <div className="revisao-header">
            <h4 className="revisao-section-title">Contato</h4>
            <button className="btn-edit" onClick={() => onEdit(3)}>
              <Edit size={16} />
            </button>
          </div>
          
          <div className="revisao-item">
            <span className="revisao-label">Telefone</span>
            <span className="revisao-value">{dados.telefone}</span>
          </div>
          
          {dados.email && (
            <div className="revisao-item">
              <span className="revisao-label">Email</span>
              <span className="revisao-value">{dados.email}</span>
            </div>
          )}
          
          {dados.endereco && (
            <>
              <div className="revisao-item">
                <span className="revisao-label">Endereço</span>
                <span className="revisao-value">{dados.endereco}</span>
              </div>
              {dados.cidade && dados.estado && (
                <div className="revisao-item">
                  <span className="revisao-label">Cidade/Estado</span>
                  <span className="revisao-value">{dados.cidade} - {dados.estado}</span>
                </div>
              )}
              {dados.cep && (
                <div className="revisao-item">
                  <span className="revisao-label">CEP</span>
                  <span className="revisao-value">{dados.cep}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="step-footer">
        <button
          className="btn-save"
          onClick={onSave}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader size={20} className="spinner" />
              <span>Salvando...</span>
            </>
          ) : (
            <>
              <Check size={20} />
              <span>Salvar Cliente</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
