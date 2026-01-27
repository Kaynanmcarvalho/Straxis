import React, { useState } from 'react';
import { UserForm } from './UserForm';
import { UserList } from './UserList';
import { PermissionsEditor } from './PermissionsEditor';

type ViewMode = 'list' | 'create' | 'edit' | 'permissions';

export const UserManager: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>();

  const handleCreate = () => {
    setSelectedUserId(undefined);
    setViewMode('create');
  };

  const handleEdit = (userId: string) => {
    setSelectedUserId(userId);
    setViewMode('edit');
  };

  const handleEditPermissions = (userId: string) => {
    setSelectedUserId(userId);
    setViewMode('permissions');
  };

  const handleSuccess = () => {
    setViewMode('list');
    setSelectedUserId(undefined);
  };

  const handleCancel = () => {
    setViewMode('list');
    setSelectedUserId(undefined);
  };

  return (
    <div className="user-manager">
      <div className="manager-header">
        <h1>Gestão de Usuários</h1>
        {viewMode === 'list' && (
          <button onClick={handleCreate} className="btn-primary">
            + Novo Usuário
          </button>
        )}
      </div>

      <div className="manager-content">
        {viewMode === 'list' && (
          <UserList
            onEdit={handleEdit}
            onEditPermissions={handleEditPermissions}
          />
        )}

        {(viewMode === 'create' || viewMode === 'edit') && (
          <UserForm
            userId={selectedUserId}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        )}

        {viewMode === 'permissions' && selectedUserId && (
          <PermissionsEditor
            userId={selectedUserId}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
};
