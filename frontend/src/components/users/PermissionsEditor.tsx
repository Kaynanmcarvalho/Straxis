import React, { useState, useEffect } from 'react';
import { Permission } from '../../types/user.types';
import { userService } from '../../services/user.service';

interface PermissionsEditorProps {
  userId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const AVAILABLE_MODULES = [
  { id: 'trabalhos', name: 'Trabalhos' },
  { id: 'agendamentos', name: 'Agendamentos' },
  { id: 'funcionarios', name: 'Funcionários' },
  { id: 'relatorios', name: 'Relatórios' },
  { id: 'usuarios', name: 'Usuários' },
  { id: 'empresas', name: 'Empresas' },
  { id: 'whatsapp', name: 'WhatsApp' },
  { id: 'ia', name: 'IA' },
  { id: 'logs', name: 'Logs' },
];

const AVAILABLE_ACTIONS: ('read' | 'write' | 'delete')[] = ['read', 'write', 'delete'];

export const PermissionsEditor: React.FC<PermissionsEditorProps> = ({
  userId,
  onSuccess,
  onCancel,
}) => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUserPermissions();
  }, [userId]);

  const loadUserPermissions = async () => {
    try {
      setLoading(true);
      const user = await userService.getById(userId);
      setPermissions(user.permissions || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar permissões');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAction = (moduleId: string, action: 'read' | 'write' | 'delete') => {
    setPermissions((prev) => {
      const modulePermission = prev.find((p) => p.module === moduleId);

      if (!modulePermission) {
        // Criar nova permissão para o módulo
        return [...prev, { module: moduleId, actions: [action] }];
      }

      // Verificar se a ação já existe
      const hasAction = modulePermission.actions.includes(action);

      if (hasAction) {
        // Remover ação
        const newActions = modulePermission.actions.filter((a) => a !== action);
        if (newActions.length === 0) {
          // Remover módulo se não tiver mais ações
          return prev.filter((p) => p.module !== moduleId);
        }
        return prev.map((p) =>
          p.module === moduleId ? { ...p, actions: newActions } : p
        );
      } else {
        // Adicionar ação
        return prev.map((p) =>
          p.module === moduleId ? { ...p, actions: [...p.actions, action] } : p
        );
      }
    });
  };

  const hasPermission = (moduleId: string, action: 'read' | 'write' | 'delete'): boolean => {
    const modulePermission = permissions.find((p) => p.module === moduleId);
    return modulePermission?.actions.includes(action) || false;
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await userService.updatePermissions(userId, permissions);
      onSuccess?.();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar permissões');
    } finally {
      setSaving(false);
    }
  };

  const getActionLabel = (action: string): string => {
    const labels: Record<string, string> = {
      read: 'Ler',
      write: 'Escrever',
      delete: 'Deletar',
    };
    return labels[action] || action;
  };

  if (loading) {
    return <div className="loading">Carregando permissões...</div>;
  }

  return (
    <div className="permissions-editor">
      <h2>Editar Permissões</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="permissions-grid">
        <table>
          <thead>
            <tr>
              <th>Módulo</th>
              {AVAILABLE_ACTIONS.map((action) => (
                <th key={action}>{getActionLabel(action)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {AVAILABLE_MODULES.map((module) => (
              <tr key={module.id}>
                <td>{module.name}</td>
                {AVAILABLE_ACTIONS.map((action) => (
                  <td key={action}>
                    <input
                      type="checkbox"
                      checked={hasPermission(module.id, action)}
                      onChange={() => handleToggleAction(module.id, action)}
                      disabled={saving}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="permissions-summary">
        <h3>Resumo</h3>
        <p>
          {permissions.length === 0
            ? 'Nenhuma permissão configurada'
            : `${permissions.length} módulo(s) com permissões`}
        </p>
      </div>

      <div className="form-actions">
        <button onClick={handleSave} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar Permissões'}
        </button>
        {onCancel && (
          <button onClick={onCancel} disabled={saving}>
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
};
