import React, { useState, useEffect } from 'react';
import { Funcionario, FuncionarioFormData } from '../../types/funcionario.types';

interface FuncionarioFormProps {
  funcionario?: Funcionario;
  onSubmit: (data: FuncionarioFormData) => Promise<void>;
  onCancel: () => void;
}

export const FuncionarioForm: React.FC<FuncionarioFormProps> = ({
  funcionario,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<FuncionarioFormData>({
    nome: '',
    cpf: '',
    telefone: '',
    active: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (funcionario) {
      setFormData({
        nome: funcionario.nome,
        cpf: funcionario.cpf || '',
        telefone: funcionario.telefone || '',
        active: funcionario.active
      });
    }
  }, [funcionario]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await onSubmit(formData);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar funcionário');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="funcionario-form">
      <h2>{funcionario ? 'Editar Funcionário' : 'Novo Funcionário'}</h2>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="nome">Nome *</label>
        <input
          type="text"
          id="nome"
          name="nome"
          value={formData.nome}
          onChange={handleChange}
          required
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="cpf">CPF</label>
        <input
          type="text"
          id="cpf"
          name="cpf"
          value={formData.cpf}
          onChange={handleChange}
          disabled={loading}
          placeholder="000.000.000-00"
        />
      </div>

      <div className="form-group">
        <label htmlFor="telefone">Telefone</label>
        <input
          type="tel"
          id="telefone"
          name="telefone"
          value={formData.telefone}
          onChange={handleChange}
          disabled={loading}
          placeholder="(00) 00000-0000"
        />
      </div>

      {funcionario && (
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              name="active"
              checked={formData.active}
              onChange={handleChange}
              disabled={loading}
            />
            Ativo
          </label>
        </div>
      )}

      <div className="form-actions">
        <button type="button" onClick={onCancel} disabled={loading}>
          Cancelar
        </button>
        <button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  );
};
