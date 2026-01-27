import React from 'react';
import { ScrollText } from 'lucide-react';
import { LogsViewer } from '../components/admin/LogsViewer';
import { FadeInUp } from '../components/ui/Animations';

const LogsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/50 to-slate-100 dark:from-gray-950 dark:via-gray-900/50 dark:to-gray-900 p-6 space-y-6">
      {/* Header */}
      <FadeInUp>
        <div className="flex items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-slate-500 to-slate-600 dark:from-slate-400 dark:to-slate-500 rounded-2xl shadow-lg shadow-slate-500/50 dark:shadow-slate-500/30">
            <ScrollText className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-slate-800 to-gray-800 dark:from-white dark:via-slate-200 dark:to-gray-200 bg-clip-text text-transparent">
              Logs do Sistema
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">
              Visualização de logs e auditoria
            </p>
          </div>
        </div>
      </FadeInUp>

      {/* Content */}
      <FadeInUp delay={0.1}>
        <LogsViewer />
      </FadeInUp>
    </div>
  );
};

export default LogsPage;
