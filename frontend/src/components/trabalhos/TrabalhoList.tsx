import React, { useState, useEffect } from 'react';
import { Package, Edit2, Trash2, Eye } from 'lucide-react';
import { Trabalho } from '../../types/trabalho.types';
import { trabalhoService } from '../../services/trabalho.service';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { LoadingState } from '../ui/LoadingState';
import { EmptyState } from '../ui/EmptyState';
import { ErrorState } from '../ui/ErrorState';

interface TrabalhoListProps {
  onEdit?: (trabalhoId: string) => void;
  onView?: (trabalhoId: string) => void;
}

export const TrabalhoList: React.FC<TrabalhoListProps> = ({ onEdit, onView }) => {
  const [trabalhos, setTrabalhos] = useState<Trabalho[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTrabalhos();
  }, []);

  const loadTrabalhos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await trabalhoService.list();
      setTrabalhos(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar trabalhos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (trabalhoId: string) => {
    if (!confirm('Tem certeza que deseja deletar este trabalho?')) {
      return;
    }

    try {
      await trabalhoService.delete(trabalhoId);
      loadTrabalhos();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao deletar trabalho');
    }
  };

  const formatCurrency = (centavos: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(centavos / 100);
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(date));
  };

  if (loading) {
    return <LoadingState message="Carregando trabalhos..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadTrabalhos} />;
  }

  if (trabalhos.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="Nenhum trabalho encontrado"
        description="Comece registrando seus trabalhos de carga e descarga"
      />
    );
  }

  return (
    <Card hover>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Trabalhos</CardTitle>
          <Badge variant="info">{trabalhos.length} trabalhos</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Data</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Tipo</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Tonelagem</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Valor Recebido</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Total Pago</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Lucro</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Funcionários</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Ações</th>
              </tr>
            </thead>
            <tbody>
              {trabalhos.map((trabalho) => (
                <tr key={trabalho.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="py-4 px-4 text-gray-700 dark:text-gray-300">{formatDate(trabalho.data)}</td>
                  <td className="py-4 px-4">
                    <Badge variant="primary">{trabalho.tipo}</Badge>
                  </td>
                  <td className="py-4 px-4 text-gray-700 dark:text-gray-300">{trabalho.tonelagem}t</td>
                  <td className="py-4 px-4 text-gray-900 dark:text-white font-medium">{formatCurrency(trabalho.valorRecebidoCentavos)}</td>
                  <td className="py-4 px-4 text-gray-700 dark:text-gray-300">{formatCurrency(trabalho.totalPagoCentavos)}</td>
                  <td className="py-4 px-4">
                    <span className={`font-semibold ${trabalho.lucroCentavos >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatCurrency(trabalho.lucroCentavos)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant="info">{trabalho.funcionarios?.length || 0}</Badge>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      {onView && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onView(trabalho.id)}
                          title="Ver Detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(trabalho.id)}
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(trabalho.id)}
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
