import React, { useState, useEffect } from 'react';
import { UserX, UserPlus, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { LoadingState } from '../ui/LoadingState';
import { EmptyState } from '../ui/EmptyState';
import { apiService } from '../../services/api.service';
import { User } from '../../types/user.types';
import { Company } from '../../types/empresa.types';

interface UnassignedUsersProps {
  onRefresh?: () => void;
}

export const UnassignedUsers: React.FC<UnassignedUsersProps> = ({ onRefresh }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigningUserId, setAssigningUserId] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<{ [userId: string]: string }>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar todos os usuários
      const usersResponse = await apiService.get('/usuarios');
      const allUsers = usersResponse?.data?.data || usersResponse?.data || [];
      
      // Filtrar usuários sem empresa ou com companyId inválido
      const unassigned = allUsers.filter((user: User) => 
        !user.companyId || 
        user.companyId === 'platform' || 
        user.companyId === 'dev-company' ||
        user.companyId === 'default'
      );
      
      setUsers(unassigned);

      // Carregar empresas disponíveis
      const { EmpresaService } = await import('../../services/empresa.service');
      const companiesData = await EmpresaService.list();
      setCompanies(companiesData);
    } catch (error) {
      console.error('Error loading unassigned users:', error);
      setUsers([]);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignCompany = async (userId: string) => {
    const companyId = selectedCompany[userId];
    if (!companyId) {
      alert('Selecione uma empresa');
      return;
    }

    try {
      setAssigningUserId(userId);
      await apiService.put(`/usuarios/${userId}`, { companyId });
      alert('Empresa atribuída com sucesso!');
      await loadData();
      if (onRefresh) onRefresh();
    } catch (error: any) {
      console.error('Error assigning company:', error);
      alert(error.response?.data?.error || 'Erro ao atribuir empresa');
    } finally {
      setAssigningUserId(null);
    }
  };

  const handleCompanySelect = (userId: string, companyId: string) => {
    setSelectedCompany(prev => ({ ...prev, [userId]: companyId }));
  };

  if (loading) {
    return <LoadingState message="Carregando usuários..." />;
  }

  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <EmptyState
            icon={UserX}
            title="Todos os usuários têm empresa"
            description="Não há usuários sem empresa atribuída"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-200 dark:border-amber-800">
      <CardHeader className="bg-amber-50 dark:bg-amber-900/20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500 rounded-lg">
            <AlertCircle className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-amber-900 dark:text-amber-100">
              Usuários sem Empresa
            </CardTitle>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
              {users.length} usuário(s) precisam ser atribuídos a uma empresa
            </p>
          </div>
          <Badge variant="warning">{users.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <UserX className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {user.name}
                  </span>
                  <Badge variant="warning" className="text-xs">
                    {user.role}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                {user.companyId && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    CompanyId atual: {user.companyId}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedCompany[user.id] || ''}
                  onChange={(e) => handleCompanySelect(user.id, e.target.value)}
                  disabled={assigningUserId === user.id}
                  className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
                >
                  <option value="">Selecione uma empresa</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleAssignCompany(user.id)}
                  disabled={!selectedCompany[user.id] || assigningUserId === user.id}
                >
                  {assigningUserId === user.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Atribuindo...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Atribuir
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
