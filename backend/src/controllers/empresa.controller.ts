import { Request, Response } from 'express';
import { FirestoreService } from '../services/firestore.service';
import { EmpresaService } from '../services/empresa.service';
import { LogService } from '../services/log.service';
import { EmpresaModel } from '../models/empresa.model';
import { AuthService } from '../services/auth.service';
import { Company } from '../types';

export class EmpresaController {
  /**
   * POST /empresas/create-platform - Cria empresa plataforma com primeiro admin
   */
  static async createPlatformCompany(req: Request, res: Response): Promise<void> {
    try {
      const { nome, adminNome, adminEmail, adminSenha } = req.body;

      // Validações
      if (!nome || !adminNome || !adminEmail || !adminSenha) {
        res.status(400).json({
          success: false,
          error: 'Nome da empresa, nome do admin, email e senha são obrigatórios',
          code: 2001,
        });
        return;
      }

      if (adminSenha.length < 6) {
        res.status(400).json({
          success: false,
          error: 'Senha deve ter no mínimo 6 caracteres',
          code: 2001,
        });
        return;
      }

      // Verificar se já existe empresa plataforma
      const empresasExistentes = await FirestoreService.query<Company>('companies', [
        { field: 'isPlatform', operator: '==', value: true },
      ]);

      if (empresasExistentes.length > 0) {
        res.status(400).json({
          success: false,
          error: 'Já existe uma empresa plataforma cadastrada',
          code: 3002,
        });
        return;
      }

      // Criar empresa plataforma
      const empresaData: Partial<Company> = {
        name: nome,
        planMonths: 999, // Plano ilimitado
        planStartDate: new Date(),
        planEndDate: new Date(Date.now() + 999 * 30 * 24 * 60 * 60 * 1000), // 999 meses
        active: true,
        isPlatform: true,
        config: {
          valorCargaPorToneladaCentavos: 0,
          valorDescargaPorToneladaCentavos: 0,
          whatsappEnabled: false,
          iaEnabled: false,
          iaProvider: null,
          iaModel: null,
          iaPrompt: null,
          rateLimits: {
            whatsappMessagesPerDay: 1000,
            whatsappMessagesPerMinute: 10,
            whatsappCooldownSeconds: 30,
            iaRequestsPerMinute: 60,
            iaRequestsPerDayPerUser: 500,
          },
          fallbackMessages: {
            iaFailure: 'Desculpe, não consegui processar sua mensagem.',
            whatsappDisconnected: 'WhatsApp desconectado.',
            messageNotUnderstood: 'Não entendi sua mensagem.',
            rateLimitReached: 'Limite de requisições atingido.',
          },
        },
      };

      const empresa = await EmpresaService.createWithStructure(empresaData);

      // Criar usuário admin_platform
      const admin = await AuthService.createUser(adminEmail, adminSenha, {
        name: adminNome,
        companyId: empresa.id,
        role: 'admin_platform',
        permissions: [],
        active: true,
      });

      // Registrar log
      await LogService.logCriticalChange(
        req.auth!.userId,
        empresa.id,
        'Criação de empresa plataforma',
        {
          empresaId: empresa.id,
          empresaNome: nome,
          adminId: admin.id,
          adminEmail: adminEmail,
        }
      );

      res.status(201).json({
        success: true,
        data: {
          empresa: {
            id: empresa.id,
            nome: empresa.name,
          },
          admin: {
            id: admin.id,
            nome: admin.name,
            email: admin.email,
          },
        },
        message: 'Empresa plataforma e administrador criados com sucesso',
      });
    } catch (error: any) {
      console.error('Erro ao criar empresa plataforma:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao criar empresa plataforma',
      });
    }
  }

  /**
   * POST /empresas/create-client - Cria empresa cliente com primeiro owner
   */
  static async createClientCompany(req: Request, res: Response): Promise<void> {
    try {
      const { 
        nome, 
        cnpj, 
        telefone, 
        planMonths, 
        ownerNome, 
        ownerEmail, 
        ownerSenha
      } = req.body;

      // Validações
      if (!nome || !ownerNome || !ownerEmail || !ownerSenha || !planMonths) {
        res.status(400).json({
          success: false,
          error: 'Nome da empresa, nome do proprietário, email, senha e plano são obrigatórios',
          code: 2001,
        });
        return;
      }

      if (ownerSenha.length < 6) {
        res.status(400).json({
          success: false,
          error: 'Senha deve ter no mínimo 6 caracteres',
          code: 2001,
        });
        return;
      }

      if (planMonths < 1) {
        res.status(400).json({
          success: false,
          error: 'Plano deve ter pelo menos 1 mês',
          code: 2001,
        });
        return;
      }

      // Criar empresa cliente
      const empresaData: Partial<Company> = {
        name: nome,
        cnpj,
        telefone,
        planMonths,
        planStartDate: new Date(),
        planEndDate: new Date(Date.now() + planMonths * 30 * 24 * 60 * 60 * 1000),
        active: true,
        isPlatform: false,
        config: {
          valorCargaPorToneladaCentavos: 0,
          valorDescargaPorToneladaCentavos: 0,
          whatsappEnabled: false,
          iaEnabled: false,
          iaProvider: null,
          iaModel: null,
          iaPrompt: null,
          rateLimits: {
            whatsappMessagesPerDay: 1000,
            whatsappMessagesPerMinute: 10,
            whatsappCooldownSeconds: 30,
            iaRequestsPerMinute: 60,
            iaRequestsPerDayPerUser: 500,
          },
          fallbackMessages: {
            iaFailure: 'Desculpe, não consegui processar sua mensagem.',
            whatsappDisconnected: 'WhatsApp desconectado.',
            messageNotUnderstood: 'Não entendi sua mensagem.',
            rateLimitReached: 'Limite de requisições atingido.',
          },
        },
      };

      const empresa = await EmpresaService.createWithStructure(empresaData);

      // Criar usuário owner
      const owner = await AuthService.createUser(ownerEmail, ownerSenha, {
        name: ownerNome,
        companyId: empresa.id,
        role: 'owner',
        permissions: [],
        active: true,
      });

      // Registrar log
      await LogService.logCriticalChange(
        req.auth!.userId,
        empresa.id,
        'Criação de empresa cliente',
        {
          empresaId: empresa.id,
          empresaNome: nome,
          ownerId: owner.id,
          ownerEmail: ownerEmail,
          planMonths,
        }
      );

      res.status(201).json({
        success: true,
        data: {
          empresa: {
            id: empresa.id,
            nome: empresa.name,
            cnpj: empresa.cnpj,
            planMonths: empresa.planMonths,
          },
          owner: {
            id: owner.id,
            nome: owner.name,
            email: owner.email,
          },
        },
        message: 'Empresa cliente e proprietário criados com sucesso',
      });
    } catch (error: any) {
      console.error('Erro ao criar empresa cliente:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao criar empresa cliente',
      });
    }
  }

  /**
   * GET /empresas - Lista todas as empresas (Admin apenas)
   */
  static async list(req: Request, res: Response): Promise<void> {
    try {
      console.log('🔵 [list] Listando empresas...');
      
      const empresas = await FirestoreService.query<Company>('companies', [], {
        orderBy: { field: 'createdAt', direction: 'desc' },
        limit: 50,
      });

      console.log('🔵 [list] Empresas encontradas:', empresas.length);
      console.log('🔵 [list] Empresas:', empresas.map(e => ({ id: e.id, name: e.name, isPlatform: e.isPlatform })));

      // Serializar Firestore Timestamps para ISO strings
      const empresasSerializadas = empresas.map(empresa => ({
        ...empresa,
        createdAt: empresa.createdAt ? (empresa.createdAt as any).toDate?.() || empresa.createdAt : null,
        updatedAt: empresa.updatedAt ? (empresa.updatedAt as any).toDate?.() || empresa.updatedAt : null,
        planStartDate: empresa.planStartDate ? (empresa.planStartDate as any).toDate?.() || empresa.planStartDate : null,
        planEndDate: empresa.planEndDate ? (empresa.planEndDate as any).toDate?.() || empresa.planEndDate : null,
      }));

      res.json({
        success: true,
        data: empresasSerializadas,
        total: empresasSerializadas.length,
      });
    } catch (error: any) {
      console.error('❌ [list] Erro:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao listar empresas',
        message: error.message,
      });
    }
  }

  /**
   * GET /empresas/:id - Busca empresa por ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const empresa = await FirestoreService.getById<Company>('companies', id);

      if (!empresa) {
        res.status(404).json({
          success: false,
          error: 'Empresa não encontrada',
          code: 3003,
        });
        return;
      }

      res.json({
        success: true,
        data: empresa,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar empresa',
        message: error.message,
      });
    }
  }

  /**
   * POST /empresas - Cria nova empresa
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const empresaData: Partial<Company> = req.body;

      // Validar dados
      const errors = EmpresaModel.validate(empresaData);
      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          error: 'Dados inválidos',
          details: errors,
          code: 2001,
        });
        return;
      }

      // Criar empresa com estrutura completa
      const empresa = await EmpresaService.createWithStructure(empresaData);

      // Registrar log de criação de empresa
      await LogService.logCriticalChange(
        req.auth!.userId,
        empresa.id,
        'Criação de empresa',
        {
          empresaId: empresa.id,
          empresaNome: empresa.name,
          planMonths: empresa.planMonths,
        }
      );

      res.status(201).json({
        success: true,
        data: empresa,
        message: 'Empresa criada com sucesso com estrutura completa',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Erro ao criar empresa',
        message: error.message,
      });
    }
  }

  /**
   * PUT /empresas/:id - Atualiza empresa
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates: Partial<Company> = req.body;

      // Verificar se empresa existe
      const empresaExistente = await FirestoreService.getById<Company>('companies', id);
      if (!empresaExistente) {
        res.status(404).json({
          success: false,
          error: 'Empresa não encontrada',
          code: 3003,
        });
        return;
      }

      // Atualizar
      await FirestoreService.update('companies', id, updates);

      res.json({
        success: true,
        message: 'Empresa atualizada com sucesso',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Erro ao atualizar empresa',
        message: error.message,
      });
    }
  }

  /**
   * DELETE /empresas/:id - Deleta empresa (soft delete)
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Verificar se empresa existe
      const empresa = await FirestoreService.getById<Company>('companies', id);
      if (!empresa) {
        res.status(404).json({
          success: false,
          error: 'Empresa não encontrada',
          code: 3003,
        });
        return;
      }

      // Soft delete
      await FirestoreService.softDelete('companies', id);

      res.json({
        success: true,
        message: 'Empresa deletada com sucesso',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Erro ao deletar empresa',
        message: error.message,
      });
    }
  }

  /**
   * PATCH /empresas/:id/activate - Ativa empresa
   */
  static async activate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Verificar se empresa existe
      const empresa = await FirestoreService.getById<Company>('companies', id);
      if (!empresa) {
        res.status(404).json({
          success: false,
          error: 'Empresa não encontrada',
          code: 3003,
        });
        return;
      }

      // Ativar
      await FirestoreService.update('companies', id, { active: true });

      res.json({
        success: true,
        message: 'Empresa ativada com sucesso',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Erro ao ativar empresa',
        message: error.message,
      });
    }
  }

  /**
   * PATCH /empresas/:id/deactivate - Desativa empresa
   */
  static async deactivate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Verificar se empresa existe
      const empresa = await FirestoreService.getById<Company>('companies', id);
      if (!empresa) {
        res.status(404).json({
          success: false,
          error: 'Empresa não encontrada',
          code: 3003,
        });
        return;
      }

      // Desativar
      await FirestoreService.update('companies', id, { active: false });

      res.json({
        success: true,
        message: 'Empresa desativada com sucesso',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Erro ao desativar empresa',
        message: error.message,
      });
    }
  }

  /**
   * GET /empresas/:id/funcoes - Busca funções da empresa
   */
  static async getFuncoes(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Verificar se owner está acessando sua própria empresa
      if (req.auth?.role === 'owner' && id !== req.auth.companyId) {
        res.status(403).json({
          success: false,
          error: 'Você só pode acessar funções da sua própria empresa',
          code: 1003,
        });
        return;
      }

      const empresa = await FirestoreService.getById<Company>('companies', id);

      if (!empresa) {
        res.status(404).json({
          success: false,
          error: 'Empresa não encontrada',
          code: 2002,
        });
        return;
      }

      res.status(200).json({
        success: true,
        funcoes: empresa.funcoes || [],
      });
    } catch (error) {
      console.error('❌ [getFuncoes] Erro:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar funções',
        code: 5000,
      });
    }
  }

  /**
   * PUT /empresas/:id/funcoes - Atualiza funções da empresa
   */
  static async updateFuncoes(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { funcoes } = req.body;

      // Verificar se owner está atualizando sua própria empresa
      if (req.auth?.role === 'owner' && id !== req.auth.companyId) {
        res.status(403).json({
          success: false,
          error: 'Você só pode atualizar funções da sua própria empresa',
          code: 1003,
        });
        return;
      }

      if (!Array.isArray(funcoes)) {
        res.status(400).json({
          success: false,
          error: 'Funções deve ser um array',
          code: 2001,
        });
        return;
      }

      const empresa = await FirestoreService.getById<Company>('companies', id);

      if (!empresa) {
        res.status(404).json({
          success: false,
          error: 'Empresa não encontrada',
          code: 2002,
        });
        return;
      }

      await FirestoreService.update('companies', id, {
        funcoes,
      });

      // Registrar log
      await LogService.logCriticalChange(
        req.auth!.userId,
        id,
        'Atualização de funções da empresa',
        { funcoes }
      );

      res.status(200).json({
        success: true,
        funcoes,
      });
    } catch (error) {
      console.error('❌ [updateFuncoes] Erro:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao atualizar funções',
        code: 5000,
      });
    }
  }
}
