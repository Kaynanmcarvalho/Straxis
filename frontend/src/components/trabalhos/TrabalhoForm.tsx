import React, { useState, useEffect } from 'react';
import { Trabalho, TrabalhoFuncionario } from '../../types/trabalho.types';
import { trabalhoService } from '../../services/trabalho.service';
import { funcionarioService } from '../../services/funcionario.service';
import { Funcionario } from '../../types/funcionario.types';

interface TrabalhoFormProps {
  trabalhoId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const TrabalhoForm: React.FC<TrabalhoFormProps> = ({
  trabalhoId,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState<Partial<Trabalho>>({
    data: new Date(),
    tipo: 'carga',
    tonelagem: 0,
    valorRecebidoCentavos: 0,
    funcionarios: [],
    observacoes: '',
  });
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [funcionariosSelecionados, setFuncionariosSelecionados] = useState<
    Map<string, number>
  >(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFuncionarios();
    if (trabalhoId) {
      loadTrabalho();
    }
  }, [trabalhoId]);

  const loadFuncionarios = async () => {
    try {
      const data = await funcionarioService.list();
      setFuncionarios(data);
    } catch (err: any) {
      console.error('Erro ao carregar funcionários:', err);
    }
  };

  const loadTrabalho = async () => {
    try {
      setLoading(true);
      const trabalho = await trabalhoService.getById(trabalhoId!);
      setFormData(trabalho);
      
      // Carregar funcionários selecionados
      const map = new Map<string, number>();
      trabalho.funcionarios?.forEach((tf) => {
        map.set(tf.funcionarioId, tf.valorPagoCentavos);
      });
      setFuncionariosSelecionados(map);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar trabalho');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Montar array de funcionários
      const funcionariosArray: TrabalhoFuncionario[] = [];
      funcionariosSelecionados.forEach((valorPagoCentavos, funcionarioId) => {
        const func = funcionarios.find((f) => f.id === funcionarioId);
        if (func) {
          funcionariosArray.push({
            funcionarioId,
            funcionarioNome: func.nome,
            valorPagoCentavos,
          });
        }
      });

      const trabalhoData = {
        ...formData,
        funcionarios: funcionariosArray,
      };

      if (trabalhoId) {
        await trabalhoService.update(trabalhoId, trabalhoData);
      } else {
        await trabalhoService.create(trabalhoData);
      }
      onSuccess?.();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar trabalho');
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

  const handleFuncionarioValorChange = (funcionarioId: string, valorReais: number) => {
    const valorCentavos = Math.round(valorReais * 100);
    setFuncionariosSelecionados((prev) => {
      const newMap = new Map(prev);
      if (valorCentavos > 0) {
        newMap.set(funcionarioId, valorCentavos);
      } else {
        newMap.delete(funcionarioId);
      }
      return newMap;
    });
  };

  const centavosToReais = (centavos: number): number => centavos / 100;
  const reaisToCentavos = (reais: number): number => Math.round(reais * 100);

  const formatDateForInput = (date: Date): string => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}:${String(
      d.getMinutes()
    ).padStart(2, '0')}`;
  };

  if (loading && trabalhoId) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="trabalho-form">
      <h2>{trabalhoId ? 'Editar Trabalho' : 'Novo Trabalho'}</h2>

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
        <label htmlFor="valorRecebidoCentavos">Valor Recebido (R$) *</label>
        <input
          type="number"
          id="valorRecebidoCentavos"
          name="valorRecebidoCentavos"
          value={centavosToReais(formData.valorRecebidoCentavos || 0)}
          onChange={(e) => {
            const reais = parseFloat(e.target.value) || 0;
            setFormData((prev) => ({
              ...prev,
              valorRecebidoCentavos: reaisToCentavos(reais),
            }));
          }}
          min="0"
          step="0.01"
          required
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label>Funcionários e Valores Pagos *</label>
        <div className="funcionarios-valores">
          {funcionarios.map((func) => (
            <div key={func.id} className="funcionario-row">
              <span>{func.nome}</span>
              <input
                type="number"
                placeholder="Valor pago (R$)"
                value={centavosToReais(funcionariosSelecionados.get(func.id) || 0)}
                onChange={(e) =>
                  handleFuncionarioValorChange(func.id, parseFloat(e.target.value) || 0)
                }
                min="0"
                step="0.01"
                disabled={loading}
              />
            </div>
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
