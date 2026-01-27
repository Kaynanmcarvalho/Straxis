import React from 'react';
import { UserCog } from 'lucide-react';
import { UserManager } from '../components/users/UserManager';
import { FadeInUp } from '../components/ui/Animations';

const UsuariosPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-slate-100 dark:from-gray-950 dark:via-violet-950/20 dark:to-gray-900 p-6 space-y-6">
      {/* Header */}
      <FadeInUp>
        <div className="flex items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-violet-500 to-violet-600 dark:from-violet-400 dark:to-violet-500 rounded-2xl shadow-lg shadow-violet-500/50 dark:shadow-violet-500/30">
            <UserCog className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-violet-900 to-gray-800 dark:from-white dark:via-violet-100 dark:to-gray-200 bg-clip-text text-transparent">
              Usuários
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">
              Gerencie usuários e permissões
            </p>
          </div>
        </div>
      </FadeInUp>

      {/* Content */}
      <FadeInUp delay={0.1}>
        <UserManager />
      </FadeInUp>
    </div>
  );
};

export default UsuariosPage;
