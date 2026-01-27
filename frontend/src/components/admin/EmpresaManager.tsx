import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { EmpresaList } from './EmpresaList';
import { EmpresaForm } from './EmpresaForm';
import { EmpresaService } from '../../services/empresa.service';
import { Company } from '../../types/empresa.types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export const EmpresaManager: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<Company | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreate = () => {
    setEditingEmpresa(undefined);
    setShowForm(true);
  };

  const handleEdit = (empresa: Company) => {
    setEditingEmpresa(empresa);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingEmpresa(undefined);
  };

  const handleSubmit = async (data: Partial<Company>) => {
    try {
      if (editingEmpresa) {
        await EmpresaService.update(editingEmpresa.id, data);
        alert('Empresa atualizada com sucesso!');
      } else {
        await EmpresaService.create(data);
        alert('Empresa criada com sucesso!');
      }
      setShowForm(false);
      setEditingEmpresa(undefined);
      setRefreshKey((prev) => prev + 1); // Força reload da lista
    } catch (error: any) {
      throw error; // Deixa o form tratar o erro
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta empresa?')) {
      return;
    }

    try {
      await EmpresaService.delete(id);
      alert('Empresa deletada com sucesso!');
      setRefreshKey((prev) => prev + 1);
    } catch (error: any) {
      alert(`Erro ao deletar empresa: ${error.message}`);
    }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      if (active) {
        await EmpresaService.activate(id);
        alert('Empresa ativada com sucesso!');
      } else {
        await EmpresaService.deactivate(id);
        alert('Empresa desativada com sucesso!');
      }
      setRefreshKey((prev) => prev + 1);
    } catch (error: any) {
      alert(`Erro ao alterar status: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {!showForm && (
        <div className="flex justify-end">
          <Button variant="primary" onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Empresa
          </Button>
        </div>
      )}

      {showForm ? (
        <Card className="overflow-hidden">
          <EmpresaForm empresa={editingEmpresa} onSubmit={handleSubmit} onCancel={handleCancel} />
        </Card>
      ) : (
        <EmpresaList
          key={refreshKey}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
        />
      )}
    </div>
  );
};
