import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      <div className="mb-4 p-4 bg-neutral-100 dark:bg-neutral-800 rounded-full">
        <Icon className="w-12 h-12 text-neutral-400 dark:text-neutral-500" />
      </div>
      
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
        {title}
      </h3>
      
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6 max-w-md">
        {description}
      </p>
      
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

// Preset empty states
export const EmptyTrabalhos: React.FC<{ onAdd?: () => void }> = ({ onAdd }) => {
  const { Package } = require('lucide-react');
  return (
    <EmptyState
      icon={Package}
      title="Nenhum trabalho encontrado"
      description="Comece criando seu primeiro trabalho de carga ou descarga"
      actionLabel="Novo Trabalho"
      onAction={onAdd}
    />
  );
};

export const EmptyAgendamentos: React.FC<{ onAdd?: () => void }> = ({ onAdd }) => {
  const { Calendar } = require('lucide-react');
  return (
    <EmptyState
      icon={Calendar}
      title="Nenhum agendamento encontrado"
      description="Agende trabalhos futuros para melhor planejamento"
      actionLabel="Novo Agendamento"
      onAction={onAdd}
    />
  );
};

export const EmptyFuncionarios: React.FC<{ onAdd?: () => void }> = ({ onAdd }) => {
  const { Users } = require('lucide-react');
  return (
    <EmptyState
      icon={Users}
      title="Nenhum funcionário cadastrado"
      description="Cadastre funcionários para registrar trabalhos"
      actionLabel="Novo Funcionário"
      onAction={onAdd}
    />
  );
};

export const EmptyRelatorios: React.FC = () => {
  const { FileText } = require('lucide-react');
  return (
    <EmptyState
      icon={FileText}
      title="Nenhum dado disponível"
      description="Não há trabalhos registrados no período selecionado"
    />
  );
};

export const EmptyLogs: React.FC = () => {
  const { ScrollText } = require('lucide-react');
  return (
    <EmptyState
      icon={ScrollText}
      title="Nenhum log encontrado"
      description="Não há logs registrados para os filtros selecionados"
    />
  );
};

export const EmptySearch: React.FC = () => {
  const { Search } = require('lucide-react');
  return (
    <EmptyState
      icon={Search}
      title="Nenhum resultado encontrado"
      description="Tente ajustar os filtros ou termos de busca"
    />
  );
};
