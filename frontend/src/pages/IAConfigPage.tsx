import React from 'react';
import { Brain } from 'lucide-react';
import { IAConfig } from '../components/ia/IAConfig';
import { PromptEditor } from '../components/ia/PromptEditor';
import { IAFilters } from '../components/ia/IAFilters';
import { FadeInUp, StaggerList, StaggerItem } from '../components/ui/Animations';

const IAConfigPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-100 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-6 space-y-6">
      {/* Header */}
      <FadeInUp>
        <div className="flex items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-400 dark:to-purple-500 rounded-2xl shadow-lg shadow-purple-500/50 dark:shadow-purple-500/30">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-gray-800 dark:from-white dark:via-purple-100 dark:to-gray-200 bg-clip-text text-transparent">
              Configuração de IA
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">
              Configure assistente de inteligência artificial
            </p>
          </div>
        </div>
      </FadeInUp>

      {/* Content */}
      <StaggerList className="space-y-6">
        <StaggerItem>
          <IAConfig />
        </StaggerItem>

        <StaggerItem>
          <PromptEditor />
        </StaggerItem>

        <StaggerItem>
          <IAFilters />
        </StaggerItem>
      </StaggerList>
    </div>
  );
};

export default IAConfigPage;
