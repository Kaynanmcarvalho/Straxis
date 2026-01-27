import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Zap, DollarSign, Calendar, Filter } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { LoadingState } from '../ui/LoadingState';
import { apiService } from '../../services/api.service';

interface UsageStatsProps {
  companyId?: string;
  userId?: string;
}

interface UsageRecord {
  id: string;
  provider: string;
  model: string;
  modelCategory: string;
  tokensUsed: number;
  estimatedCostCentavos: number;
  timestamp: any;
}

export const UsageStats: React.FC<UsageStatsProps> = ({ companyId = 'default', userId }) => {
  const [usage, setUsage] = useState<UsageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCostCentavos, setTotalCostCentavos] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadUsage();
  }, [companyId, userId, startDate, endDate]);

  const loadUsage = async () => {
    setLoading(true);
    try {
      let url = userId 
        ? `/ia/usage/user/${userId}`
        : '/ia/usage';

      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await apiService.get(url, { params });
      const data = response as any;
      
      setUsage(data.usage || []);
      
      const total = (data.usage || []).reduce(
        (sum: number, record: UsageRecord) => sum + record.estimatedCostCentavos,
        0
      );
      setTotalCostCentavos(total);
    } catch (error) {
      console.error('Error loading usage stats:', error);
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

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('pt-BR');
  };

  const getCategoryBadge = (category: string) => {
    const variants: Record<string, any> = {
      cheap: 'success',
      medium: 'warning',
      expensive: 'error'
    };
    const labels: Record<string, string> = {
      cheap: 'Econômico',
      medium: 'Moderado',
      expensive: 'Premium'
    };
    return <Badge variant={variants[category]}>{labels[category]}</Badge>;
  };

  const totalTokens = usage.reduce((sum, r) => sum + r.tokensUsed, 0);
  const avgCostPerRequest = usage.length > 0 ? totalCostCentavos / usage.length : 0;

  if (loading) {
    return <LoadingState message="Carregando estatísticas..." />;
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle>Estatísticas de Uso</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Acompanhe o consumo e custos da IA
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Filters */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Filtros</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data Início
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data Fim
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              <Button variant="primary" onClick={loadUsage} className="w-full">
                <Filter className="w-4 h-4 mr-2" />
                Filtrar
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Requisições</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{usage.length}</p>
          </div>

          <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Custo Total</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalCostCentavos)}</p>
          </div>

          <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200/50 dark:border-purple-800/50">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Tokens</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalTokens.toLocaleString()}</p>
          </div>

          <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200/50 dark:border-amber-800/50">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Média/Req</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(avgCostPerRequest)}</p>
          </div>
        </div>

        {/* Usage Table */}
        {usage.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">Nenhum uso de IA registrado no período selecionado</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300">Data/Hora</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300">Provider</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300">Modelo</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300">Categoria</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300">Tokens</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300">Custo</th>
                </tr>
              </thead>
              <tbody>
                {usage.map((record) => (
                  <tr key={record.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{formatDate(record.timestamp)}</td>
                    <td className="py-3 px-4">
                      <Badge variant="info">{record.provider}</Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300 font-mono">{record.model}</td>
                    <td className="py-3 px-4">{getCategoryBadge(record.modelCategory)}</td>
                    <td className="py-3 px-4 text-right text-sm font-medium text-gray-900 dark:text-white">{record.tokensUsed.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(record.estimatedCostCentavos)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
