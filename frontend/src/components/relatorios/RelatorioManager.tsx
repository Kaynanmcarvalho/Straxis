import React, { useState } from 'react';
import { FileText, Download, Filter, TrendingUp, DollarSign, Package, Calendar } from 'lucide-react';
import { RelatorioFilter } from './RelatorioFilter';
import { RelatorioTable } from './RelatorioTable';
import { RelatorioExport } from './RelatorioExport';
import { relatorioService, RelatorioData } from '../../services/relatorio.service';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { LoadingState } from '../ui/LoadingState';
import { ErrorState } from '../ui/ErrorState';

export const RelatorioManager: React.FC = () => {
  const [relatorio, setRelatorio] = useState<RelatorioData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(true);

  const handleFilter = async (filters: any) => {
    try {
      setLoading(true);
      setError(null);

      let data: RelatorioData;

      if (filters.periodo === 'diario') {
        data = await relatorioService.diario(filters.data);
      } else if (filters.periodo === 'semanal') {
        data = await relatorioService.semanal(filters.data);
      } else {
        data = await relatorioService.mensal(filters.mes, filters.ano);
      }

      setRelatorio(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao gerar relatório');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (centavos: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(centavos / 100);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards - Mostrar apenas se houver relatório */}
      {relatorio && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Faturamento</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(relatorio.faturamentoTotalCentavos)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-900/20 dark:to-red-900/20 border-rose-200 dark:border-rose-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-rose-500 rounded-xl">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Custos</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(relatorio.custosTotaisCentavos)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`bg-gradient-to-br ${
            relatorio.lucroTotalCentavos >= 0
              ? 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800'
              : 'from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${relatorio.lucroTotalCentavos >= 0 ? 'bg-blue-500' : 'bg-amber-500'}`}>
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Lucro</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(relatorio.lucroTotalCentavos)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-500 rounded-xl">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Trabalhos</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {relatorio.quantidadeTrabalhos}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20 border-b border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <CardTitle className="text-base">Filtros</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <RelatorioFilter onFilter={handleFilter} />
            </CardContent>
          </Card>

          {relatorio && (
            <Card className="mt-4">
              <CardHeader className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 border-b border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <CardTitle className="text-base">Exportar</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <RelatorioExport relatorio={relatorio} />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Report Content */}
        <div className="lg:col-span-3">
          {loading && <LoadingState message="Gerando relatório..." />}
          {error && <ErrorState message={error} onRetry={() => {}} />}
          {!loading && !error && <RelatorioTable relatorio={relatorio} />}
        </div>
      </div>
    </div>
  );
};
