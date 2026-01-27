import React, { useState, useEffect } from 'react';
import { Users, Edit2, Trash2, BarChart3 } from 'lucide-react';
import { Funcionario } from '../../types/funcionario.types';
import { funcionarioService } from '../../services/funcionario.service';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { LoadingState } from '../ui/LoadingState';
import { EmptyState } from '../ui/EmptyState';
import { ErrorState } from '../ui/ErrorState';

interface FuncionarioListProps {
  onEdit: (funcionario: Funcionario) => void;
  onViewStats: (funcionario: Funcionario) => void;
  refreshTrigger?: number;
}

export const FuncionarioList: React.FC<FuncionarioListProps> = ({
  onEdit,
  onViewStats,
  refreshTrigger
}) => {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFuncionarios();
  }, [refreshTrigger]);

  const loadFuncionarios = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await funcionarioService.list();
      setFuncionarios(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar funcionários');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este funcionário?')) {
      return;
    }

    try {
      await funcionarioService.delete(id);
      await loadFuncionarios();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir funcionário');
    }
  };

  if (loading) {
    return <LoadingState message="Carregando funcionários..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadFuncionarios} />;
  }

  if (funcionarios.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Nenhum funcionário cadastrado"
        description="Comece adicionando funcionários à sua equipe"
      />
    );
  }

  return (
    <Card hover>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Equipe</CardTitle>
          <Badge variant="info">{funcionarios.length} funcionários</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Nome</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">CPF</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Telefone</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Ações</th>
              </tr>
            </thead>
            <tbody>
              {funcionarios.map(funcionario => (
                <tr key={funcionario.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                        <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">{funcionario.nome}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-700 dark:text-gray-300">{funcionario.cpf || '-'}</td>
                  <td className="py-4 px-4 text-gray-700 dark:text-gray-300">{funcionario.telefone || '-'}</td>
                  <td className="py-4 px-4">
                    <Badge variant={funcionario.active ? 'success' : 'error'}>
                      {funcionario.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewStats(funcionario)}
                        title="Ver estatísticas"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(funcionario)}
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(funcionario.id)}
                        title="Excluir"
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
