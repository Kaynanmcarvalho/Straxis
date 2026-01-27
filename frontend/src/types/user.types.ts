export interface User {
  id: string;
  email: string;
  name: string;
  companyId: string;
  role: 'admin_platform' | 'owner' | 'user';
  permissions: Permission[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface Permission {
  module: string;
  actions: ('read' | 'write' | 'delete')[];
}
