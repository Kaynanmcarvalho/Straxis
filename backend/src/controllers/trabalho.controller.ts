import { Request, Response } from 'express';
import { FirestoreService } from '../services/firestore.service';
import { TrabalhoModel } from '../models/trabalho.model';
import { TrabalhoCompleto } from '../types/trabalho.types';
import { Trabalho } from '../types';

export class TrabalhoController {
  /**
   * GET /trabalhos - Lista trabalhos da empresa
   */
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const companyId = req.auth?.companyId;

      if (!companyId) {
        res.status(400).json({
          success: false,
          error: 'CompanyId é obrigatório',
          code: 2001,
        });
        return;
      }

      // Buscar trabalhos da empresa
      const trabalhos = await FirestoreService.querySubcollection<TrabalhoCompleto>(
        'companies',
        companyId,
        'trabalhos',
        [{ field: 'deletedAt', operator: '==', value: null }],
        { orderBy: { field: 'data', direction: 'desc' } }
      );

      res.json({
        success: true,
        data: trabalhos,
        total: trabalhos.length,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Erro ao listar trabalhos',
        message: error.message,
      });
    }
  }

  /**
   * GET /trabalhos/:id - Busca trabalho por ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const companyId = req.auth?.companyId;

      if (!companyId) {
        res.status(400).json({
          success: false,
          error: 'CompanyId é obrigatório',
          code: 2001,
        });
        return;
      }

      const trabalho = await FirestoreService.getSubcollectionDoc<Trabalho>(
        'companies',
        companyId,
        'trabalhos',
        id
      );

      if (!trabalho) {
        res.status(404).json({
          success: false,
          error: 'Trabalho não encontrado',
          code: 3003,
        });
        return;
      }

      res.json({
        success: true,
        data: trabalho,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar trabalho',
        message: error.message,
      });
    }
  }

  /**
   * POST /trabalhos - Cria novo trabalho
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      console.log('📥 POST /trabalhos - Recebendo requisição');
      console.log('Body:', JSON.stringify(req.body, null, 2));
      console.log('Auth:', req.auth);

      const trabalhoData: Partial<Trabalho> = req.body;
      const companyId = req.auth?.companyId;
      const userId = req.auth?.userId;

      if (!companyId || !userId) {
        console.log('❌ CompanyId ou UserId ausente');
        res.status(400).json({
          success: false,
          error: 'CompanyId e UserId são obrigatórios',
          code: 2001,
        });
        return;
      }

      // Adicionar companyId e createdBy
      trabalhoData.companyId = companyId;
      trabalhoData.createdBy = userId;

      console.log('🔍 Validando dados...');
      // Validar dados
      const errors = TrabalhoModel.validate(trabalhoData);
      if (errors.length > 0) {
        console.log('❌ Erros de validação:', errors);
        res.status(400).json({
          success: false,
          error: 'Dados inválidos',
          details: errors,
          code: 2001,
        });
        return;
      }

      console.log('✅ Validação OK, criando trabalho...');
      // Criar trabalho (cálculos automáticos são feitos no model)
      const trabalho = TrabalhoModel.create(trabalhoData);
      console.log('📝 Trabalho criado (model):', trabalho);

      const id = await FirestoreService.createSubcollectionDoc(
        'companies',
        companyId,
        'trabalhos',
        TrabalhoModel.toFirestore(trabalho)
      );
      console.log('✅ Trabalho salvo no Firestore com ID:', id);

      res.status(201).json({
        success: true,
        data: { ...trabalho, id },
        message: 'Trabalho criado com sucesso',
      });
    } catch (error: any) {
      console.error('❌ Erro ao criar trabalho:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao criar trabalho',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      });
    }
  }

  /**
   * PUT /trabalhos/:id - Atualiza trabalho
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates: Partial<Trabalho> = req.body;
      const companyId = req.auth?.companyId;

      if (!companyId) {
        res.status(400).json({
          success: false,
          error: 'CompanyId é obrigatório',
          code: 2001,
        });
        return;
      }

      // Verificar se trabalho existe
      const trabalhoExistente = await FirestoreService.getSubcollectionDoc<any>(
        'companies',
        companyId,
        'trabalhos',
        id
      );

      if (!trabalhoExistente) {
        res.status(404).json({
          success: false,
          error: 'Trabalho não encontrado',
          code: 3003,
        });
        return;
      }

      // Não permitir alterar companyId e createdBy
      delete updates.companyId;
      delete updates.createdBy;

      // Recalcular lucro se valores mudaram
      if (updates.valorRecebidoCentavos !== undefined || updates.totalPagoCentavos !== undefined) {
        const valorRecebido = updates.valorRecebidoCentavos ?? trabalhoExistente.valorRecebidoCentavos ?? 0;
        const totalPago = updates.totalPagoCentavos ?? trabalhoExistente.totalPagoCentavos ?? 0;
        updates.lucroCentavos = valorRecebido - totalPago;
      }

      // Atualizar updatedAt
      updates.updatedAt = new Date();

      await FirestoreService.updateSubcollectionDoc(
        'companies',
        companyId,
        'trabalhos',
        id,
        updates
      );

      res.json({
        success: true,
        message: 'Trabalho atualizado com sucesso',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Erro ao atualizar trabalho',
        message: error.message,
      });
    }
  }

  /**
   * DELETE /trabalhos/:id - Deleta trabalho (soft delete)
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const companyId = req.auth?.companyId;
      const userId = req.auth?.userId;

      console.log('🗑️ DELETE trabalho:', { id, companyId, userId, auth: req.auth });

      if (!companyId) {
        res.status(400).json({
          success: false,
          error: 'CompanyId é obrigatório',
          code: 2001,
        });
        return;
      }

      // Verificar se trabalho existe
      const trabalho = await FirestoreService.getSubcollectionDoc<Trabalho>(
        'companies',
        companyId,
        'trabalhos',
        id
      );

      if (!trabalho) {
        res.status(404).json({
          success: false,
          error: 'Trabalho não encontrado',
          code: 3003,
        });
        return;
      }

      console.log('✅ Trabalho encontrado, fazendo soft delete...');

      // Soft delete - usar Timestamp do Firestore
      const now = new Date();
      await FirestoreService.updateSubcollectionDoc(
        'companies',
        companyId,
        'trabalhos',
        id,
        { 
          deletedAt: now,
          updatedAt: now
        } as any
      );

      console.log('✅ Soft delete concluído');

      // Registrar log
      // TODO: Implementar log service
      // await LogService.createLog({
      //   companyId,
      //   userId,
      //   type: 'critical_change',
      //   action: 'soft_delete_trabalho',
      //   details: { trabalhoId: id, trabalhoData: trabalho }
      // });

      res.json({
        success: true,
        message: 'Trabalho deletado com sucesso',
      });
    } catch (error: any) {
      console.error('❌ Erro ao deletar trabalho:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao deletar trabalho',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      });
    }
  }

  /**
   * PATCH /trabalhos/:id/restore - Restaura trabalho soft-deleted
   */
  static async restore(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const companyId = req.auth?.companyId;
      const userId = req.auth?.userId;

      if (!companyId) {
        res.status(400).json({
          success: false,
          error: 'CompanyId é obrigatório',
          code: 2001,
        });
        return;
      }

      // Verificar se trabalho existe
      const trabalho = await FirestoreService.getSubcollectionDoc<Trabalho>(
        'companies',
        companyId,
        'trabalhos',
        id
      );

      if (!trabalho) {
        res.status(404).json({
          success: false,
          error: 'Trabalho não encontrado',
          code: 3003,
        });
        return;
      }

      if (!trabalho.deletedAt) {
        res.status(400).json({
          success: false,
          error: 'Trabalho não está deletado',
          code: 2001,
        });
        return;
      }

      // Restaurar (remover deletedAt)
      await FirestoreService.updateSubcollectionDoc(
        'companies',
        companyId,
        'trabalhos',
        id,
        { deletedAt: null, updatedAt: new Date() }
      );

      // Registrar log
      // TODO: Implementar log service
      // await LogService.createLog({
      //   companyId,
      //   userId,
      //   type: 'critical_change',
      //   action: 'restore_trabalho',
      //   details: { trabalhoId: id }
      // });

      res.json({
        success: true,
        message: 'Trabalho restaurado com sucesso',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Erro ao restaurar trabalho',
        message: error.message,
      });
    }
  }

  /**
   * DELETE /trabalhos/:id/hard - Delete permanente (apenas Admin_Plataforma)
   */
  static async hardDelete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const companyId = req.auth?.companyId;
      const userId = req.auth?.userId;
      const userRole = req.auth?.role;

      // Apenas Admin_Plataforma pode fazer hard delete
      if (userRole !== 'admin_platform') {
        res.status(403).json({
          success: false,
          error: 'Apenas Admin da Plataforma pode fazer delete permanente',
          code: 1003,
        });
        return;
      }

      if (!companyId) {
        res.status(400).json({
          success: false,
          error: 'CompanyId é obrigatório',
          code: 2001,
        });
        return;
      }

      // Verificar se trabalho existe
      const trabalho = await FirestoreService.getSubcollectionDoc<Trabalho>(
        'companies',
        companyId,
        'trabalhos',
        id
      );

      if (!trabalho) {
        res.status(404).json({
          success: false,
          error: 'Trabalho não encontrado',
          code: 3003,
        });
        return;
      }

      // Delete permanente
      await FirestoreService.deleteSubcollectionDoc(
        'companies',
        companyId,
        'trabalhos',
        id
      );

      // Registrar log
      // TODO: Implementar log service
      // await LogService.createLog({
      //   companyId,
      //   userId,
      //   type: 'critical_change',
      //   action: 'hard_delete_trabalho',
      //   details: { trabalhoId: id, trabalhoData: trabalho }
      // });

      res.json({
        success: true,
        message: 'Trabalho deletado permanentemente',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Erro ao deletar trabalho permanentemente',
        message: error.message,
      });
    }
  }

  /**
   * POST /trabalhos/:id/iniciar - Inicia trabalho
   */
  static async iniciar(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const companyId = req.auth?.companyId;

      if (!companyId) {
        res.status(400).json({
          success: false,
          error: 'CompanyId é obrigatório',
          code: 2001,
        });
        return;
      }

      // Verificar se trabalho existe
      const trabalho = await FirestoreService.getSubcollectionDoc<any>(
        'companies',
        companyId,
        'trabalhos',
        id
      );

      if (!trabalho) {
        res.status(404).json({
          success: false,
          error: 'Trabalho não encontrado',
          code: 3003,
        });
        return;
      }

      const status = trabalho.status || 'rascunho';
      if (status !== 'planejado' && status !== 'agendado') {
        res.status(400).json({
          success: false,
          error: 'Trabalho não está no status planejado',
          code: 2001,
        });
        return;
      }

      await FirestoreService.updateSubcollectionDoc(
        'companies',
        companyId,
        'trabalhos',
        id,
        {
          status: 'em_andamento',
          startedAt: new Date(),
          updatedAt: new Date(),
        }
      );

      res.json({
        success: true,
        message: 'Trabalho iniciado com sucesso',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Erro ao iniciar trabalho',
        message: error.message,
      });
    }
  }

  /**
   * POST /trabalhos/:id/pausar - Pausa trabalho
   */
  static async pausar(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { motivo } = req.body;
      const companyId = req.auth?.companyId;

      if (!companyId) {
        res.status(400).json({
          success: false,
          error: 'CompanyId é obrigatório',
          code: 2001,
        });
        return;
      }

      const trabalho = await FirestoreService.getSubcollectionDoc<any>(
        'companies',
        companyId,
        'trabalhos',
        id
      );

      if (!trabalho) {
        res.status(404).json({
          success: false,
          error: 'Trabalho não encontrado',
          code: 3003,
        });
        return;
      }

      const status = trabalho.status || 'rascunho';
      if (status !== 'em_andamento' && status !== 'em_execucao') {
        res.status(400).json({
          success: false,
          error: 'Trabalho não está em execução',
          code: 2001,
        });
        return;
      }

      const pausas = trabalho.pausas || [];
      pausas.push({
        inicio: new Date(),
        motivo: motivo || 'Não informado',
      });

      await FirestoreService.updateSubcollectionDoc(
        'companies',
        companyId,
        'trabalhos',
        id,
        {
          status: 'pausado',
          pausas,
          updatedAt: new Date(),
        }
      );

      res.json({
        success: true,
        message: 'Trabalho pausado com sucesso',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Erro ao pausar trabalho',
        message: error.message,
      });
    }
  }

  /**
   * POST /trabalhos/:id/retomar - Retoma trabalho pausado
   */
  static async retomar(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const companyId = req.auth?.companyId;

      if (!companyId) {
        res.status(400).json({
          success: false,
          error: 'CompanyId é obrigatório',
          code: 2001,
        });
        return;
      }

      const trabalho = await FirestoreService.getSubcollectionDoc<any>(
        'companies',
        companyId,
        'trabalhos',
        id
      );

      if (!trabalho) {
        res.status(404).json({
          success: false,
          error: 'Trabalho não encontrado',
          code: 3003,
        });
        return;
      }

      const status = trabalho.status || 'rascunho';
      if (status !== 'pausado') {
        res.status(400).json({
          success: false,
          error: 'Trabalho não está pausado',
          code: 2001,
        });
        return;
      }

      const pausas = trabalho.pausas || [];
      if (pausas.length > 0) {
        const ultimaPausa = pausas[pausas.length - 1];
        if (!ultimaPausa.fim) {
          ultimaPausa.fim = new Date();
        }
      }

      await FirestoreService.updateSubcollectionDoc(
        'companies',
        companyId,
        'trabalhos',
        id,
        {
          status: 'em_andamento',
          pausas,
          updatedAt: new Date(),
        }
      );

      res.json({
        success: true,
        message: 'Trabalho retomado com sucesso',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Erro ao retomar trabalho',
        message: error.message,
      });
    }
  }

  /**
   * POST /trabalhos/:id/finalizar - Finaliza trabalho
   */
  static async finalizar(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const companyId = req.auth?.companyId;

      if (!companyId) {
        res.status(400).json({
          success: false,
          error: 'CompanyId é obrigatório',
          code: 2001,
        });
        return;
      }

      const trabalho = await FirestoreService.getSubcollectionDoc<any>(
        'companies',
        companyId,
        'trabalhos',
        id
      );

      if (!trabalho) {
        res.status(404).json({
          success: false,
          error: 'Trabalho não encontrado',
          code: 3003,
        });
        return;
      }

      const status = trabalho.status || 'rascunho';
      if (status !== 'em_andamento' && status !== 'em_execucao' && status !== 'pausado') {
        res.status(400).json({
          success: false,
          error: 'Trabalho não pode ser finalizado neste status',
          code: 2001,
        });
        return;
      }

      await FirestoreService.updateSubcollectionDoc(
        'companies',
        companyId,
        'trabalhos',
        id,
        {
          status: 'concluido',
          finishedAt: new Date(),
          updatedAt: new Date(),
        }
      );

      res.json({
        success: true,
        message: 'Trabalho finalizado com sucesso',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Erro ao finalizar trabalho',
        message: error.message,
      });
    }
  }
}
