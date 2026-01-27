import React, { useState } from 'react';
import { Calendar, Filter as FilterIcon } from 'lucide-react';
import { Button } from '../ui/Button';

interface RelatorioFilterProps {
  onFilter: (filters: {
    periodo: 'diario' | 'semanal' | 'mensal';
    data?: Date;
    mes?: number;
    ano?: number;
    funcionarioId?: string;
  }) => void;
}

export const RelatorioFilter: React.FC<RelatorioFilterProps> = ({ onFilter }) => {
  const [periodo, setPeriodo] = useState<'diario' | 'semanal' | 'mensal'>('mensal');
  const [data, setData] = useState<string>('');
  const [mes, setMes] = useState<number>(new Date().getMonth() + 1);
  const [ano, setAno] = useState<number>(new Date().getFullYear());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const filters: any = { periodo };
    
    if (periodo === 'diario' || periodo === 'semanal') {
      if (data) {
        filters.data = new Date(data);
      }
    } else if (periodo === 'mensal') {
      filters.mes = mes;
      filters.ano = ano;
    }
    
    onFilter(filters);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Período
        </label>
        <select
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value as any)}
          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 dark:text-white"
        >
          <option value="diario">Diário</option>
          <option value="semanal">Semanal</option>
          <option value="mensal">Mensal</option>
        </select>
      </div>

      {(periodo === 'diario' || periodo === 'semanal') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Data
          </label>
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 dark:text-white"
          />
        </div>
      )}

      {periodo === 'mensal' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mês
            </label>
            <select
              value={mes}
              onChange={(e) => setMes(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 dark:text-white"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2000, i, 1).toLocaleDateString('pt-BR', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ano
            </label>
            <input
              type="number"
              value={ano}
              onChange={(e) => setAno(parseInt(e.target.value))}
              min="2020"
              max="2100"
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900 dark:text-white"
            />
          </div>
        </>
      )}

      <Button type="submit" variant="primary" className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700">
        <FilterIcon className="w-4 h-4 mr-2" />
        Gerar Relatório
      </Button>
    </form>
  );
};
