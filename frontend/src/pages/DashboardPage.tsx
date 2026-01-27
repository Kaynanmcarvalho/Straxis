import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  Brain,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { LineChart } from '../components/ui/Charts';
import { FadeInUp, StaggerList, StaggerItem } from '../components/ui/Animations';
import { SkeletonDashboard } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';

interface DashboardMetrics {
  faturamento: number;
  custos: number;
  lucro: number;
  trabalhos: number;
  funcionarios: number;
  iaUsage: number;
}

interface ChartData {
  month: string;
  faturamento: number;
  custos: number;
  lucro: number;
}

const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    // Simular carregamento de dados
    setTimeout(() => {
      setMetrics({
        faturamento: 125450,
        custos: 85300,
        lucro: 40150,
        trabalhos: 45,
        funcionarios: 12,
        iaUsage: 350,
      });

      setChartData([
        { month: 'Jan', faturamento: 95000, custos: 65000, lucro: 30000 },
        { month: 'Fev', faturamento: 105000, custos: 70000, lucro: 35000 },
        { month: 'Mar', faturamento: 115000, custos: 75000, lucro: 40000 },
        { month: 'Abr', faturamento: 110000, custos: 72000, lucro: 38000 },
        { month: 'Mai', faturamento: 120000, custos: 80000, lucro: 40000 },
        { month: 'Jun', faturamento: 125450, custos: 85300, lucro: 40150 },
      ]);

      setLoading(false);
    }, 1500);
  }, []);

  const formatCurrency = (centavos: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(centavos / 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-gray-950 dark:via-blue-950/20 dark:to-gray-900 p-6">
        <SkeletonDashboard />
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-gray-950 dark:via-blue-950/20 dark:to-gray-900 p-6">
        <EmptyState
          icon={Package}
          title="Nenhum dado disponível"
          description="Não há dados para exibir no dashboard"
        />
      </div>
    );
  }

  const metricCards = [
    {
      title: 'Faturamento',
      value: formatCurrency(metrics.faturamento),
      icon: TrendingUp,
      color: 'success',
      trend: '+12.5%',
      trendUp: true,
    },
    {
      title: 'Custos',
      value: formatCurrency(metrics.custos),
      icon: TrendingDown,
      color: 'error',
      trend: '+8.3%',
      trendUp: true,
    },
    {
      title: 'Lucro',
      value: formatCurrency(metrics.lucro),
      icon: DollarSign,
      color: 'primary',
      trend: '+15.2%',
      trendUp: true,
    },
    {
      title: 'Trabalhos',
      value: metrics.trabalhos.toString(),
      icon: Package,
      color: 'warning',
      trend: '+5',
      trendUp: true,
    },
    {
      title: 'Funcionários',
      value: metrics.funcionarios.toString(),
      icon: Users,
      color: 'info',
      trend: '+2',
      trendUp: true,
    },
    {
      title: 'Uso de IA',
      value: metrics.iaUsage.toString(),
      icon: Brain,
      color: 'purple',
      trend: '-15',
      trendUp: false,
    },
  ];

  const colorClasses = {
    success: 'bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-400 dark:to-emerald-500 text-white shadow-emerald-500/50',
    error: 'bg-gradient-to-br from-rose-500 to-rose-600 dark:from-rose-400 dark:to-rose-500 text-white shadow-rose-500/50',
    primary: 'bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 text-white shadow-blue-500/50',
    warning: 'bg-gradient-to-br from-amber-500 to-amber-600 dark:from-amber-400 dark:to-amber-500 text-white shadow-amber-500/50',
    info: 'bg-gradient-to-br from-cyan-500 to-cyan-600 dark:from-cyan-400 dark:to-cyan-500 text-white shadow-cyan-500/50',
    purple: 'bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-400 dark:to-purple-500 text-white shadow-purple-500/50',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-gray-950 dark:via-blue-950/20 dark:to-gray-900 p-6 space-y-6">
      {/* Header */}
      <FadeInUp>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-gray-800 dark:from-white dark:via-blue-100 dark:to-gray-200 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">
              Visão geral do mês atual
            </p>
          </div>
        </div>
      </FadeInUp>

      {/* Metrics Cards - 2 Column Layout */}
      <StaggerList className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {metricCards.map((metric, index) => (
          <StaggerItem key={index}>
            <Card className="group relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/20 transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  {/* Left side - Icon and Title */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-4 rounded-xl shadow-lg ${colorClasses[metric.color as keyof typeof colorClasses]} group-hover:scale-110 transition-transform duration-300`}>
                      <metric.icon className="w-7 h-7" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                        {metric.title}
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                        {metric.value}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full ${
                          metric.trendUp 
                            ? 'bg-emerald-100 dark:bg-emerald-900/30' 
                            : 'bg-rose-100 dark:bg-rose-900/30'
                        }`}>
                          {metric.trendUp ? (
                            <ArrowUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <ArrowDown className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                          )}
                          <span className={`text-sm font-bold ${
                            metric.trendUp 
                              ? 'text-emerald-700 dark:text-emerald-400' 
                              : 'text-rose-700 dark:text-rose-400'
                          }`}>
                            {metric.trend}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                          vs mês anterior
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Decorative gradient overlay */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-transparent via-transparent to-gray-100/50 dark:to-gray-700/30 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </CardContent>
            </Card>
          </StaggerItem>
        ))}
      </StaggerList>

      {/* Chart */}
      <FadeInUp delay={0.3}>
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/20 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Faturamento Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart
              data={chartData}
              lines={[
                { dataKey: 'faturamento', name: 'Faturamento', color: '#10b981' },
                { dataKey: 'custos', name: 'Custos', color: '#f43f5e' },
                { dataKey: 'lucro', name: 'Lucro', color: '#3b82f6' },
              ]}
              xAxisKey="month"
              height={350}
              formatter={formatCurrency}
            />
          </CardContent>
        </Card>
      </FadeInUp>
    </div>
  );
};

export default DashboardPage;
