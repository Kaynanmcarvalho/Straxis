import React, { useState } from 'react';
import { Company } from '../../types/empresa.types';

interface EmpresaFormProps {
  empresa?: Company;
  onSubmit: (data: Partial<Company>) => Promise<void>;
  onCancel: () => void;
}

export const EmpresaForm: React.FC<EmpresaFormProps> = ({ empresa, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: empresa?.name || '',
    planMonths: empresa?.planMonths || 1,
    active: empresa?.active !== undefined ? empresa.active : true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSubmit(formData);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar empresa');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="empresa-form">
      <h2>{empresa ? 'Editar Empresa' : 'Nova Empresa'}</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label htmlFor="name">Nome da Empresa *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="planMonths">Plano (meses) *</label>
        <input
          type="number"
          id="planMonths"
          name="planMonths"
          value={formData.planMonths}
          onChange={handleChange}
          min="1"
          required
          disabled={loading}
        />
      </div>

      <div className="form-group checkbox">
        <label>
          <input
            type="checkbox"
            name="active"
            checked={formData.active}
            onChange={handleChange}
            disabled={loading}
          />
          Empresa Ativa
        </label>
      </div>

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
