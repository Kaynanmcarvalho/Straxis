import React, { useState, useEffect } from 'react';
import { Building2, Edit2, Trash2, Lock, Unlock } from 'lucide-react';
import { Company } from '../../types/empresa.types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { LoadingState } from '../ui/LoadingState';
import { EmptyState } from '../ui/EmptyState';
import { ErrorState } from '../ui/ErrorState';

interface EmpresaListProps {
  onEdit: (empresa: Company) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, active: boolean) => void;
}

export const EmpresaList: React.FC<EmpresaListProps> = ({ onEdit, onDelete, onToggleActive }) => {
  const [empresas, setEmpresas] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEmpresas();
  }, []);

  const loadEmpresas = async () => {
    try {
      setLoading(true);
      setError(null);
      const { EmpresaService } = await import('../../services/empresa.service');
      const data = await EmpresaService.list();
      setEmpresas(data);
    } catch (err: any) {
      console.error('Error loading empresas:', err);
      setError(err.message || 'Erro ao carregar empresas');
      setEmpresas([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const isPlanActive = (empresa: Company) => {
    return empresa.active && new Date(empresa.planEndDate) > new Date();
  };

  if (loading) {
    return <LoadingState message="Carregando empresas..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadEmpresas} />;
  }

  if (empresas.length === 0) {
    return (
      <EmptyState
        icon={Building2}
        title="Nenhuma empresa cadastrada"
        description="Comece criando sua primeira empresa"
      />
    );
  }

  return (
    <Card hover>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Empresas Cadastradas</CardTitle>
          <Badge variant="info">{empresas.length} empresas</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Nome</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Plano</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Início</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Término</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Ações</th>
              </tr>
            </thead>
            <tbody>
              {empresas.map((empresa) => (
                <tr key={empresa.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                        <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">{empresa.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-700 dark:text-gray-300">{empresa.planMonths} meses</td>
                  <td className="py-4 px-4 text-gray-700 dark:text-gray-300">{formatDate(empresa.planStartDate)}</td>
                  <td className="py-4 px-4 text-gray-700 dark:text-gray-300">{formatDate(empresa.planEndDate)}</td>
                  <td className="py-4 px-4">
                    <Badge variant={isPlanActive(empresa) ? 'success' : 'error'}>
                      {isPlanActive(empresa) ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(empresa)}
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onToggleActive(empresa.id, !empresa.active)}
                        title={empresa.active ? 'Desativar' : 'Ativar'}
                      >
                        {empresa.active ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(empresa.id)}
                        title="Deletar"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
