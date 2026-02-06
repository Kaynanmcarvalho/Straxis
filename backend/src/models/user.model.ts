import { User, Permission } from '../types';

export class UserModel {
  static create(data: Partial<User>): User {
    const now = new Date();
    return {
      id: data.id || '',
      email: data.email || '',
      name: data.name || '',
      companyId: data.companyId || '',
      role: data.role || 'user',
      permissions: data.permissions || [],
      active: data.active !== undefined ? data.active : true,
      createdAt: data.createdAt || now,
      updatedAt: data.updatedAt || now,
      deletedAt: data.deletedAt || null,
      telefone: (data as any).telefone || null,
      funcao: (data as any).funcao || null,
      dataAdmissao: (data as any).dataAdmissao || null,
      diariaCentavos: (data as any).diariaCentavos || 0,
    };
  }

  static validate(user: Partial<User>): string[] {
    const errors: string[] = [];

    if (!user.email) {
      errors.push('Email é obrigatório');
    }

    if (!user.name) {
      errors.push('Nome é obrigatório');
    }

    if (!user.companyId) {
      errors.push('CompanyId é obrigatório');
    }

    if (!user.role || !['admin_platform', 'owner', 'user'].includes(user.role)) {
      errors.push('Role inválido');
    }

    return errors;
  }

  static toFirestore(user: User): Record<string, any> {
    const data: Record<string, any> = {
      email: user.email,
      name: user.name,
      companyId: user.companyId,
      role: user.role,
      permissions: user.permissions,
      active: user.active,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
    };
    
    // Adicionar campos extras se existirem
    if ((user as any).telefone !== undefined) data.telefone = (user as any).telefone;
    if ((user as any).funcao !== undefined) data.funcao = (user as any).funcao;
    if ((user as any).dataAdmissao !== undefined) data.dataAdmissao = (user as any).dataAdmissao;
    if ((user as any).diariaCentavos !== undefined) data.diariaCentavos = (user as any).diariaCentavos;
    
    return data;
  }

  static fromFirestore(id: string, data: any): User {
    return {
      id,
      email: data.email,
      name: data.name,
      companyId: data.companyId,
      role: data.role,
      permissions: data.permissions || [],
      active: data.active,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      deletedAt: data.deletedAt?.toDate() || null,
      telefone: data.telefone || null,
      funcao: data.funcao || null,
      dataAdmissao: data.dataAdmissao || null,
      diariaCentavos: data.diariaCentavos || 0,
    } as User;
  }
}
