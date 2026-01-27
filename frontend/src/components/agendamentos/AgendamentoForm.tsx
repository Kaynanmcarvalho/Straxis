import React, { useState, useEffect } from 'react';
import { Agendamento } from '../../types/agendamento.types';
import { agendamentoService } from '../../services/agendamento.service';
import { funcionarioService } from '../../services/funcionario.service';
import { Funcionario } from '../../types/funcionario.types';

interface AgendamentoFormProps {
  agendamentoId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const AgendamentoForm: React.FC<AgendamentoFormProps> = ({
  agendamentoId,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState<Partial<Agendamento>>({
    data: new Date(),
    tipo: 'carga',
    tonelagem: 0,
    valorEstimadoCentavos: 0,
    funcionarios: [],
    status: 'pendente',
    observacoes: '',
  });
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFuncionarios();
    if (agendamentoId) {
      loadAgendamento();
    }
  }, [agendamentoId]);

  const loadFuncionarios = async () => {
    try {
      const data = await funcionarioService.list();
      setFuncionarios(data);
    } catch (err: any) {
      console.error('Erro ao carregar funcionários:', err);
    }
  };

  const loadAgendamento = async () => {
    try {
      setLoading(true);
      const agendamento = await agendamentoService.getById(agendamentoId!);
      setFormData(agendamento);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar agendamento');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (agendamentoId) {
        await agendamentoService.update(agendamentoId, formData);
      } else {
        await agendamentoService.create(formData);
      }
      onSuccess?.();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar agendamento');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'number'
          ? parseFloat(value) || 0
          : type === 'datetime-local'
          ? new Date(value)
          : value,
    }));
  };

  const handleFuncionarioToggle = (funcionarioId: string) => {
    setFormData((prev) => {
      const funcionarios = prev.funcionarios || [];
      const exists = funcionarios.includes(funcionarioId);
      return {
        ...prev,
        funcionarios: exists
          ? funcionarios.filter((id) => id !== funcionarioId)
          : [...funcionarios, funcionarioId],
      };
    });
  };

  const formatDateForInput = (date: Date): string => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const centavosToReais = (centavos: number): number => {
    return centavos / 100;
  };

  const reaisToCentavos = (reais: number): number => {
    return Math.round(reais * 100);
  };

  if (loading && agendamentoId) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="agendamento-form">
      <h2>{agendamentoId ? 'Editar Agendamento' : 'Novo Agendamento'}</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label htmlFor="data">Data e Hora *</label>
        <input
          type="datetime-local"
          id="data"
          name="data"
          value={formatDateForInput(formData.data || new Date())}
          onChange={handleChange}
          required
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="tipo">Tipo *</label>
        <select
          id="tipo"
          name="tipo"
          value={formData.tipo}
          onChange={handleChange}
          required
          disabled={loading}
        >
          <option value="carga">Carga</option>
          <option value="descarga">Descarga</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="tonelagem">Tonelagem *</label>
        <input
          type="number"
          id="tonelagem"
          name="tonelagem"
          value={formData.tonelagem}
          onChange={handleChange}
          min="0"
          step="0.01"
          required
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="valorEstimadoCentavos">Valor Estimado (R$) *</label>
        <input
          type="number"
          id="valorEstimadoCentavos"
          name="valorEstimadoCentavos"
          value={centavosToReais(formData.valorEstimadoCentavos || 0)}
          onChange={(e) => {
            const reais = parseFloat(e.target.value) || 0;
            setFormData((prev) => ({
              ...prev,
              valorEstimadoCentavos: reaisToCentavos(reais),
            }));
          }}
          min="0"
          step="0.01"
          required
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="status">Status *</label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          required
          disabled={loading}
        >
          <option value="pendente">Pendente</option>
          <option value="confirmado">Confirmado</option>
          <option value="cancelado">Cancelado</option>
          <option value="concluido">Concluído</option>
        </select>
      </div>

      <div className="form-group">
        <label>Funcionários</label>
        <div className="funcionarios-list">
          {funcionarios.map((func) => (
            <label key={func.id} className="funcionario-checkbox">
              <input
                type="checkbox"
                checked={formData.funcionarios?.includes(func.id) || false}
                onChange={() => handleFuncionarioToggle(func.id)}
                disabled={loading}
              />
              {func.nome}
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="observacoes">Observações</label>
        <textarea
          id="observacoes"
          name="observacoes"
          value={formData.observacoes}
          onChange={handleChange}
          rows={4}
          disabled={loading}
        />
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
