import React, { useState, useEffect } from 'react';
import { User, Permission } from '../../types/user.types';
import { userService } from '../../services/user.service';

interface UserFormProps {
  userId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const UserForm: React.FC<UserFormProps> = ({ userId, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<Partial<User>>({
    email: '',
    name: '',
    role: 'user',
    permissions: [],
    active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      loadUser();
    }
  }, [userId]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const user = await userService.getById(userId!);
      setFormData(user);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (userId) {
        await userService.update(userId, formData);
      } else {
        await userService.create(formData);
      }
      onSuccess?.();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  if (loading && userId) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="user-form">
      <h2>{userId ? 'Editar Usuário' : 'Novo Usuário'}</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label htmlFor="name">Nome *</label>
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
        <label htmlFor="email">Email *</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="role">Tipo de Usuário *</label>
        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
          disabled={loading}
        >
          <option value="user">Usuário Comum</option>
          <option value="owner">Dono da Empresa</option>
          <option value="admin_platform">Admin da Plataforma</option>
        </select>
      </div>

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

      <div className="form-actions">
        <button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={loading}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
};
