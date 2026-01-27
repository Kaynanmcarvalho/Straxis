import React from 'react';
import { FileText } from 'lucide-react';
import { RelatorioManager } from '../components/relatorios/RelatorioManager';
import { FadeInUp } from '../components/ui/Animations';

const RelatoriosPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-slate-100 dark:from-gray-950 dark:via-amber-950/20 dark:to-gray-900 p-6 space-y-6">
      {/* Header */}
      <FadeInUp>
        <div className="flex items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-amber-500 to-amber-600 dark:from-amber-400 dark:to-amber-500 rounded-2xl shadow-lg shadow-amber-500/50 dark:shadow-amber-500/30">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-amber-900 to-gray-800 dark:from-white dark:via-amber-100 dark:to-gray-200 bg-clip-text text-transparent">
              Relatórios
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">
              Análise financeira e operacional
            </p>
          </div>
        </div>
      </FadeInUp>

      {/* Content */}
      <FadeInUp delay={0.1}>
        <RelatorioManager />
      </FadeInUp>
    </div>
  );
};

export default RelatoriosPage;
