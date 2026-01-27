import React from 'react';
import { Users } from 'lucide-react';
import { FuncionarioManager } from '../components/funcionarios/FuncionarioManager';
import { FadeInUp } from '../components/ui/Animations';

const FuncionariosPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-100 dark:from-gray-950 dark:via-emerald-950/20 dark:to-gray-900 p-6 space-y-6">
      {/* Header */}
      <FadeInUp>
        <div className="flex items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-400 dark:to-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/50 dark:shadow-emerald-500/30">
            <Users className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-emerald-900 to-gray-800 dark:from-white dark:via-emerald-100 dark:to-gray-200 bg-clip-text text-transparent">
              Funcionários
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">
              Gerencie sua equipe operacional
            </p>
          </div>
        </div>
      </FadeInUp>

      {/* Content */}
      <FadeInUp delay={0.1}>
        <FuncionarioManager />
      </FadeInUp>
    </div>
  );
};

export default FuncionariosPage;
