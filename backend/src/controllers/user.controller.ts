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
   * GET /usuarios/unassigned/list - Lista usuários sem empresa válida (Admin apenas)
   */
  static async listUnassigned(req: Request, res: Response): Promise<void> {
    try {
      // Buscar TODOS os usuários (sem filtro de companyId)
      const db = require('../config/firebase.config').db;
      const usersSnapshot = await db.collection('users')
        .where('deletedAt', '==', null)
        .orderBy('createdAt', 'desc')
        .get();

      const allUsers: User[] = [];
      usersSnapshot.forEach((doc: any) => {
        allUsers.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
          deletedAt: doc.data().deletedAt?.toDate() || null,
        });
      });

      // Buscar todas as empresas válidas
      const companiesSnapshot = await db.collection('companies').get();
      const validCompanyIds: string[] = [];
      companiesSnapshot.forEach((doc: any) => {
        validCompanyIds.push(doc.id);
      });

      // Filtrar usuários sem empresa válida
      const unassignedUsers = allUsers.filter(user => 
        !user.companyId || 
        !validCompanyIds.includes(user.companyId) ||
        user.companyId === 'platform' ||
        user.companyId === 'dev-company' ||
        user.companyId === 'default'
      );

      res.json({
        success: true,
        data: unassignedUsers,
        total: unassignedUsers.length,
      });
    } catch (error: any) {
      console.error('Error in listUnassigned:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao listar usuários sem empresa',
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

      // Admin pode alterar companyId, owner não pode
      if (req.auth?.role !== 'admin_platform') {
        // Verificar se usuário pertence à empresa (exceto admin)
        if (usuarioExistente.companyId !== req.auth?.companyId) {
          res.status(403).json({
            success: false,
            error: 'Acesso negado',
            code: 1003,
          });
          return;
        }
        // Não permitir alterar companyId se não for admin
        delete updates.companyId;
      }

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
   * GET /usuarios/check-email/:email - Verifica se email já existe
   */
  static async checkEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.params;

      if (!email) {
        res.status(400).json({
          success: false,
          error: 'Email é obrigatório',
          code: 2001,
        });
        return;
      }

      // Importar AuthService
      const { auth } = require('../config/firebase.config');

      try {
        // Tentar buscar usuário por email no Firebase Auth
        await auth.getUserByEmail(email);
        
        // Se chegou aqui, email existe
        res.json({
          success: true,
          exists: true,
          message: 'Email já está cadastrado',
        });
      } catch (error: any) {
        // Se erro for "user not found", email não existe
        if (error.code === 'auth/user-not-found') {
          res.json({
            success: true,
            exists: false,
            message: 'Email disponível',
          });
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Erro ao verificar email',
        message: error.message,
      });
    }
  }

  /**
   * POST /usuarios/create-funcionario - Cria funcionário com login Firebase Auth
   */
  static async createFuncionario(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name, companyId, role } = req.body;

      // Validações
      if (!email || !password || !name || !companyId) {
        res.status(400).json({
          success: false,
          error: 'Email, senha, nome e companyId são obrigatórios',
          code: 2001,
        });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({
          success: false,
          error: 'Senha deve ter no mínimo 6 caracteres',
          code: 2001,
        });
        return;
      }

      // Verificar permissão (apenas owner e admin_platform)
      if (req.auth?.role !== 'owner' && req.auth?.role !== 'admin_platform') {
        res.status(403).json({
          success: false,
          error: 'Apenas donos de empresa e administradores podem criar funcionários',
          code: 1003,
        });
        return;
      }

      // Verificar se owner está criando para sua própria empresa
      if (req.auth?.role === 'owner' && companyId !== req.auth.companyId) {
        res.status(403).json({
          success: false,
          error: 'Você só pode criar funcionários para sua própria empresa',
          code: 1003,
        });
        return;
      }

      // Importar AuthService
      const { AuthService } = require('../services/auth.service');

      console.log('🔵 [createFuncionario] Criando usuário:', { email, name, companyId, role });

      // Extrair campos extras do body
      const { telefone, funcao, dataAdmissao, diariaCentavos } = req.body;

      // Criar usuário no Firebase Auth e Firestore
      const user = await AuthService.createUser(email, password, {
        name,
        companyId,
        role: role || 'user',
        permissions: [],
        active: true,
        telefone: telefone || null,
        funcao: funcao || null,
        dataAdmissao: dataAdmissao || null,
        diariaCentavos: diariaCentavos || 0,
      });

      console.log('🔵 [createFuncionario] Usuário criado:', { userId: user.id, email: user.email });

      // Registrar log
      await LogService.logCriticalChange(
        req.auth!.userId,
        companyId,
        'Criação de funcionário com login',
        {
          funcionarioId: user.id,
          funcionarioName: name,
          funcionarioEmail: email,
        }
      );

      const responseData = {
        success: true,
        data: {
          userId: user.id,
          email: user.email,
          name: user.name,
        },
        message: 'Funcionário criado com sucesso. Login habilitado.',
      };

      console.log('✅ [createFuncionario] Resposta:', responseData);

      res.status(201).json(responseData);
    } catch (error: any) {
      console.error('Erro ao criar funcionário:', error);
      
      // Capturar mensagem de erro do AuthService
      const errorMsg = error.message || 'Erro ao criar funcionário';
      let statusCode = 500;
      
      // Se a mensagem não contém "Erro ao criar usuário:", é um erro tratado do AuthService
      // Esses erros devem retornar 400 (Bad Request)
      if (!errorMsg.includes('Erro ao criar usuário:') && 
          (errorMsg.includes('email já está cadastrado') || 
           errorMsg.includes('Email inválido') || 
           errorMsg.includes('Senha muito fraca'))) {
        statusCode = 400;
      }

      res.status(statusCode).json({
        success: false,
        error: errorMsg,
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
