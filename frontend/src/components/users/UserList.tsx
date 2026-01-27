import React, { useState, useEffect } from 'react';
import { User } from '../../types/user.types';
import { userService } from '../../services/user.service';

interface UserListProps {
  companyId?: string;
  onEdit?: (userId: string) => void;
  onEditPermissions?: (userId: string) => void;
}

export const UserList: React.FC<UserListProps> = ({ companyId, onEdit, onEditPermissions }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, [companyId]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.list(companyId);
      setUsers(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (userId: string, currentActive: boolean) => {
    try {
      if (currentActive) {
        await userService.deactivate(userId);
      } else {
        await userService.activate(userId);
      }
      loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao alterar status');
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Tem certeza que deseja deletar este usuário?')) {
      return;
    }

    try {
      await userService.delete(userId);
      loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao deletar usuário');
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin_platform: 'Admin da Plataforma',
      owner: 'Dono da Empresa',
      user: 'Usuário Comum',
    };
    return labels[role] || role;
  };

  if (loading) {
    return <div className="loading">Carregando usuários...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="user-list">
      <div className="list-header">
        <h2>Usuários</h2>
        <span className="count">{users.length} usuário(s)</span>
      </div>

      {users.length === 0 ? (
        <div className="empty-state">
          <p>Nenhum usuário encontrado</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Tipo</th>
                <th>Status</th>
                <th>Permissões</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{getRoleLabel(user.role)}</td>
                  <td>
                    <span className={`status ${user.active ? 'active' : 'inactive'}`}>
                      {user.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>
                    <span className="permissions-count">
                      {user.permissions?.length || 0} permissão(ões)
                    </span>
                  </td>
                  <td className="actions">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(user.id)}
                        className="btn-edit"
                        title="Editar"
                      >
                        ✏️
                      </button>
                    )}
                    {onEditPermissions && (
                      <button
                        onClick={() => onEditPermissions(user.id)}
                        className="btn-permissions"
                        title="Editar Permissões"
                      >
                        🔐
                      </button>
                    )}
                    <button
                      onClick={() => handleToggleActive(user.id, user.active)}
                      className={`btn-toggle ${user.active ? 'deactivate' : 'activate'}`}
                      title={user.active ? 'Desativar' : 'Ativar'}
                    >
                      {user.active ? '🔴' : '🟢'}
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="btn-delete"
                      title="Deletar"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
