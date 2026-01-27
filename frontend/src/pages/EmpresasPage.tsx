import React from 'react';
import { Building2 } from 'lucide-react';
import { EmpresaManager } from '../components/admin/EmpresaManager';
import { FadeInUp } from '../components/ui/Animations';
import { Badge } from '../components/ui/Badge';

const EmpresasPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100 dark:from-gray-950 dark:via-indigo-950/20 dark:to-gray-900 p-6 space-y-6">
      {/* Header */}
      <FadeInUp>
        <div className="flex items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-400 dark:to-indigo-500 rounded-2xl shadow-lg shadow-indigo-500/50 dark:shadow-indigo-500/30">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-gray-800 dark:from-white dark:via-indigo-100 dark:to-gray-200 bg-clip-text text-transparent">
                Gestão de Empresas
              </h1>
              <Badge variant="info">Admin</Badge>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">
              Painel administrativo - Apenas Admin da Plataforma
            </p>
          </div>
        </div>
      </FadeInUp>

      {/* Content */}
      <FadeInUp delay={0.1}>
        <EmpresaManager />
      </FadeInUp>
    </div>
  );
};

export default EmpresasPage;
