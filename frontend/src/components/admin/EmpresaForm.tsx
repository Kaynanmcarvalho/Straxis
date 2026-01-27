import React, { useState } from 'react';
import { Save, X, Building2 } from 'lucide-react';
import { Company } from '../../types/empresa.types';
import { Button } from '../ui/Button';
import { CardHeader, CardTitle, CardContent } from '../ui/Card';

interface EmpresaFormProps {
  empresa?: Company;
  onSubmit: (data: Partial<Company>) => Promise<void>;
  onCancel: () => void;
}

export const EmpresaForm: React.FC<EmpresaFormProps> = ({ empresa, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: empresa?.name || '',
    planMonths: empresa?.planMonths || 12,
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
    <>
      <CardHeader className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <CardTitle>{empresa ? 'Editar Empresa' : 'Nova Empresa'}</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Nome da Empresa *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Ex: Empresa ABC Ltda"
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="planMonths" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Duração do Plano (meses) *
            </label>
            <input
              type="number"
              id="planMonths"
              name="planMonths"
              value={formData.planMonths}
              onChange={handleChange}
              min="1"
              max="120"
              required
              disabled={loading}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              O plano começará a partir da data de criação
            </p>
          </div>

          <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
            <input
              type="checkbox"
              id="active"
              name="active"
              checked={formData.active}
              onChange={handleChange}
              disabled={loading}
              className="w-5 h-5 text-indigo-600 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <label htmlFor="active" className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
              Empresa Ativa
              <span className="block text-xs text-gray-500 dark:text-gray-400 font-normal mt-0.5">
                Empresas inativas não podem acessar o sistema
              </span>
            </label>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={loading}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Empresa
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </>
  );
};
