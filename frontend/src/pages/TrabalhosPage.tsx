import React, { useState } from 'react';
import { Plus, Package } from 'lucide-react';
import { TrabalhoList } from '../components/trabalhos/TrabalhoList';
import { Button } from '../components/ui/Button';
import { FadeInUp } from '../components/ui/Animations';
import { useToast } from '../hooks/useToast';

const TrabalhosPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const toast = useToast();

  const handleNewTrabalho = () => {
    setShowForm(true);
    toast.info('Funcionalidade em desenvolvimento');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-gray-950 dark:via-blue-950/20 dark:to-gray-900 p-6 space-y-6">
      {/* Header */}
      <FadeInUp>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 rounded-2xl shadow-lg shadow-blue-500/50 dark:shadow-blue-500/30">
              <Package className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-gray-800 dark:from-white dark:via-blue-100 dark:to-gray-200 bg-clip-text text-transparent">
                Trabalhos
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">
                Gerencie trabalhos de carga e descarga
              </p>
            </div>
          </div>
          <Button variant="primary" onClick={handleNewTrabalho}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Trabalho
          </Button>
        </div>
      </FadeInUp>

      {/* Content */}
      <FadeInUp delay={0.1}>
        <TrabalhoList />
      </FadeInUp>
    </div>
  );
};

export default TrabalhosPage;
