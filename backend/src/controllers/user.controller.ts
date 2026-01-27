import { Request, Response } from 'express';
import { FirestoreService } from '../services/firestore.service';
import { LogService } from '../services/log.service';
import { UserModel } from '../models/user.model';
import { User } from '../types';

export class UserController {
  /**
   * GET /usuarios - Lista usuários da empresa
   */
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const companyId = req.auth?.role === 'admin_platform' 
        ? req.query.companyId as string 
        : req.auth?.companyId;

      if (!companyId) {
        res.status(400).json({
          success: false,
          error: 'CompanyId é obrigatório',
          code: 2001,
        });
        return;
      }

      // Buscar usuários da empresa
      const usuarios = await FirestoreService.query<User>('users', [
        { field: 'companyId', operator: '==', value: companyId },
        { field: 'deletedAt', operator: '==', value: null },
      ], {
        orderBy: { field: 'createdAt', direction: 'desc' },
      });

      res.json({
        success: true,
        data: usuarios,
        total: usuarios.length,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Erro ao listar usuários',
        message: error.message,
      });
    }
  }

  /**
   * GET /usuarios/:id - Busca usuário por ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const usuario = await FirestoreService.getById<User>('users', id);

      if (!usuario) {
        res.status(404).json({
          success: false,
          error: 'Usuário não encontrado',
          code: 3003,
        });
        return;
      }

      // Verificar se usuário pertence à empresa (exceto admin)
      if (req.auth?.role !== 'admin_platform' && usuario.companyId !== req.auth?.companyId) {
        res.status(403).json({
          success: false,
          error: 'Acesso negado',
          code: 1003,
        });
        return;
      }

      res.json({
        success: true,
        data: usuario,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar usuário',
        message: error.message,
      });
    }
  }

  /**
   * POST /usuarios - Cria novo usuário
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const userData: Partial<User> = req.body;

      // Extrair companyId do criador (Dono_Empresa ou Admin)
      if (req.auth?.role === 'owner') {
        userData.companyId = req.auth.companyId;
      } else if (req.auth?.role === 'admin_platform' && !userData.companyId) {
        res.status(400).json({
          success: false,
          error: 'CompanyId é obrigatório para Admin criar usuário',
          code: 2001,
        });
        return;
      }

      // Validar dados
      const errors = UserModel.validate(userData);
      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          error: 'Dados inválidos',
          details: errors,
          code: 2001,
        });
        return;
      }

      // Criar usuário
      const usuario = UserModel.create(userData);
      const id = await FirestoreService.create('users', UserModel.toFirestore(usuario));

      res.status(201).json({
        success: true,
        data: { ...usuario, id },
        message: 'Usuário criado com sucesso',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Erro ao criar usuário',
        message: error.message,
      });
    }
  }

  /**
   * PUT /usuarios/:id - Atualiza usuário
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates: Partial<User> = req.body;

      // Verificar se usuário existe
      const usuarioExistente = await FirestoreService.getById<User>('users', id);
      if (!usuarioExistente) {
        res.status(404).json({
          success: false,
          error: 'Usuário não encontrado',
          code: 3003,
        });
        return;
      }

      // Verificar se usuário pertence à empresa (exceto admin)
      if (req.auth?.role !== 'admin_platform' && usuarioExistente.companyId !== req.auth?.companyId) {
        res.status(403).json({
          success: false,
          error: 'Acesso negado',
          code: 1003,
        });
        return;
      }

      // Não permitir alterar companyId
      delete updates.companyId;

      // Atualizar updatedAt
      updates.updatedAt = new Date();

      await FirestoreService.update('users', id, updates);

      res.json({
        success: true,
        message: 'Usuário atualizado com sucesso',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Erro ao atualizar usuário',
        message: error.message,
      });
    }
  }

  /**
   * DELETE /usuarios/:id - Deleta usuário (soft delete)
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Verificar se usuário existe
      const usuario = await FirestoreService.getById<User>('users', id);
      if (!usuario) {
        res.status(404).json({
          success: false,
          error: 'Usuário não encontrado',
          code: 3003,
        });
        return;
      }

      // Verificar se usuário pertence à empresa (exceto admin)
      if (req.auth?.role !== 'admin_platform' && usuario.companyId !== req.auth?.companyId) {
        res.status(403).json({
          success: false,
          error: 'Acesso negado',
          code: 1003,
        });
        return;
      }

      // Soft delete
      await FirestoreService.softDelete('users', id);

      res.json({
        success: true,
        message: 'Usuário deletado com sucesso',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Erro ao deletar usuário',
        message: error.message,
      });
    }
  }

  /**
   * PATCH /usuarios/:id/activate - Ativa usuário
   */
  static async activate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Verificar se usuário existe
      const usuario = await FirestoreService.getById<User>('users', id);
      if (!usuario) {
        res.status(404).json({
          success: false,
          error: 'Usuário não encontrado',
          code: 3003,
        });
        return;
      }

      // Verificar se usuário pertence à empresa (exceto admin)
      if (req.auth?.role !== 'admin_platform' && usuario.companyId !== req.auth?.companyId) {
        res.status(403).json({
          success: false,
          error: 'Acesso negado',
          code: 1003,
        });
        return;
      }

      // Ativar
      await FirestoreService.update('users', id, { active: true, updatedAt: new Date() });

      res.json({
        success: true,
        message: 'Usuário ativado com sucesso',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Erro ao ativar usuário',
        message: error.message,
      });
    }
  }

  /**
   * PATCH /usuarios/:id/deactivate - Desativa usuário
   */
  static async deactivate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Verificar se usuário existe
      const usuario = await FirestoreService.getById<User>('users', id);
      if (!usuario) {
        res.status(404).json({
          success: false,
          error: 'Usuário não encontrado',
          code: 3003,
        });
        return;
      }

      // Verificar se usuário pertence à empresa (exceto admin)
      if (req.auth?.role !== 'admin_platform' && usuario.companyId !== req.auth?.companyId) {
        res.status(403).json({
          success: false,
          error: 'Acesso negado',
          code: 1003,
        });
        return;
      }

      // Desativar
      await FirestoreService.update('users', id, { active: false, updatedAt: new Date() });

      res.json({
        success: true,
        message: 'Usuário desativado com sucesso',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Erro ao desativar usuário',
        message: error.message,
      });
    }
  }

  /**
   * PATCH /usuarios/:id/permissions - Atualiza permissões do usuário
   */
  static async updatePermissions(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { permissions } = req.body;

      if (!permissions || !Array.isArray(permissions)) {
        res.status(400).json({
          success: false,
          error: 'Permissões inválidas',
          code: 2001,
        });
        return;
      }

      // Verificar se usuário existe
      const usuario = await FirestoreService.getById<User>('users', id);
      if (!usuario) {
        res.status(404).json({
          success: false,
          error: 'Usuário não encontrado',
          code: 3003,
        });
        return;
      }

      // Verificar se usuário pertence à empresa (exceto admin)
      if (req.auth?.role !== 'admin_platform' && usuario.companyId !== req.auth?.companyId) {
        res.status(403).json({
          success: false,
          error: 'Acesso negado',
          code: 1003,
        });
        return;
      }

      // Atualizar permissões
      await FirestoreService.update('users', id, { 
        permissions, 
        updatedAt: new Date() 
      });

      // Registrar log de alteração de permissões
      await LogService.logCriticalChange(
        req.auth!.userId,
        usuario.companyId,
        'Alteração de permissões de usuário',
        {
          targetUserId: id,
          targetUserName: usuario.name,
          newPermissions: permissions,
          oldPermissions: usuario.permissions,
        }
      );

      res.json({
        success: true,
        message: 'Permissões atualizadas com sucesso',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Erro ao atualizar permissões',
        message: error.message,
      });
    }
  }
}
