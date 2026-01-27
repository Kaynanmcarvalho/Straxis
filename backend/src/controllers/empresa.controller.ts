import { Request, Response } from 'express';
import { FirestoreService } from '../services/firestore.service';
import { EmpresaService } from '../services/empresa.service';
import { LogService } from '../services/log.service';
import { EmpresaModel } from '../models/empresa.model';
import { Company } from '../types';

export class EmpresaController {
  /**
   * GET /empresas - Lista todas as empresas (Admin apenas)
   */
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const empresas = await FirestoreService.query<Company>('companies', [], {
        orderBy: { field: 'createdAt', direction: 'desc' },
        limit: 50,
      });

      res.json({
        success: true,
        data: empresas,
        total: empresas.length,
      });
    } catch (error: any) {
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
}
