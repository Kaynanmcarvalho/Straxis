import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Funcionario, FuncionarioFormData } from '../../types/funcionario.types';
import { funcionarioService } from '../../services/funcionario.service';
import { FuncionarioForm } from './FuncionarioForm';
import { FuncionarioList } from './FuncionarioList';
import { FuncionarioStats } from './FuncionarioStats';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

export const FuncionarioManager: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedFuncionario, setSelectedFuncionario] = useState<Funcionario | undefined>();
  const [showStats, setShowStats] = useState(false);
  const [statsFuncionarioId, setStatsFuncionarioId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreate = () => {
    setSelectedFuncionario(undefined);
    setShowForm(true);
  };

  const handleEdit = (funcionario: Funcionario) => {
    setSelectedFuncionario(funcionario);
    setShowForm(true);
  };

  const handleViewStats = (funcionario: Funcionario) => {
    setStatsFuncionarioId(funcionario.id);
    setShowStats(true);
  };

  const handleSubmit = async (data: FuncionarioFormData) => {
    if (selectedFuncionario) {
      await funcionarioService.update(selectedFuncionario.id, data);
    } else {
      await funcionarioService.create(data);
    }
    setShowForm(false);
    setSelectedFuncionario(undefined);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedFuncionario(undefined);
  };

  const handleCloseStats = () => {
    setShowStats(false);
    setStatsFuncionarioId(null);
  };

  return (
    <div className="space-y-6">
      {!showForm && (
        <div className="flex justify-end">
          <Button variant="primary" onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Funcionário
          </Button>
        </div>
      )}

      {showForm ? (
        <Card className="overflow-hidden">
          <FuncionarioForm
            funcionario={selectedFuncionario}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </Card>
      ) : (
        <FuncionarioList
          onEdit={handleEdit}
          onViewStats={handleViewStats}
          refreshTrigger={refreshTrigger}
        />
      )}

      {showStats && statsFuncionarioId && (
        <Modal isOpen={showStats} onClose={handleCloseStats} title="Estatísticas do Funcionário">
          <FuncionarioStats
            funcionarioId={statsFuncionarioId}
            onClose={handleCloseStats}
          />
        </Modal>
      )}
    </div>
  );
};
