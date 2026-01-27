import React, { useState } from 'react';
import { Plus, Calendar } from 'lucide-react';
import { AgendamentoCalendar } from '../components/agendamentos/AgendamentoCalendar';
import { Button } from '../components/ui/Button';
import { FadeInUp } from '../components/ui/Animations';
import { useToast } from '../hooks/useToast';

const AgendamentosPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const toast = useToast();

  const handleNewAgendamento = () => {
    setShowForm(true);
    toast.info('Funcionalidade em desenvolvimento');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-slate-100 dark:from-gray-950 dark:via-cyan-950/20 dark:to-gray-900 p-6 space-y-6">
      {/* Header */}
      <FadeInUp>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-cyan-500 to-cyan-600 dark:from-cyan-400 dark:to-cyan-500 rounded-2xl shadow-lg shadow-cyan-500/50 dark:shadow-cyan-500/30">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-cyan-900 to-gray-800 dark:from-white dark:via-cyan-100 dark:to-gray-200 bg-clip-text text-transparent">
                Agendamentos
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">
                Planeje trabalhos futuros
              </p>
            </div>
          </div>
          <Button variant="primary" onClick={handleNewAgendamento}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Agendamento
          </Button>
        </div>
      </FadeInUp>

      {/* Content */}
      <FadeInUp delay={0.1}>
        <AgendamentoCalendar />
      </FadeInUp>
    </div>
  );
};

export default AgendamentosPage;
