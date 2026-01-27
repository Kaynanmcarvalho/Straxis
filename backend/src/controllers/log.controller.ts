import { Request, Response } from 'express';
import { LogService } from '../services/log.service';

export class LogController {
  /**
   * GET /logs - Lista logs com filtros
   */
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const {
        companyId,
        userId,
        type,
        startDate,
        endDate,
        limit,
      } = req.query;

      // Se não for admin, filtrar apenas logs da empresa do usuário
      const filterCompanyId = req.auth?.role === 'admin_platform'
        ? (companyId as string)
        : req.auth?.companyId;

      const logs = await LogService.queryLogs({
        companyId: filterCompanyId,
        userId: userId as string,
        type: type as any,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        limit: limit ? parseInt(limit as string) : 100,
      });

      res.json({
        success: true,
        data: logs,
        total: logs.length,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Erro ao listar logs',
        message: error.message,
      });
    }
  }

  /**
   * GET /logs/company/:companyId - Lista logs de uma empresa
   */
  static async getByCompany(req: Request, res: Response): Promise<void> {
    try {
      const { companyId } = req.params;
      const { limit } = req.query;

      // Verificar permissão
      if (req.auth?.role !== 'admin_platform' && req.auth?.companyId !== companyId) {
        res.status(403).json({
          success: false,
          error: 'Acesso negado',
          code: 1003,
        });
        return;
      }

      const logs = await LogService.getLogsByCompany(
        companyId,
        limit ? parseInt(limit as string) : 100
      );

      res.json({
        success: true,
        data: logs,
        total: logs.length,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar logs da empresa',
        message: error.message,
      });
    }
  }

  /**
   * GET /logs/user/:userId - Lista logs de um usuário
   */
  static async getByUser(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { limit } = req.query;

      const logs = await LogService.getLogsByUser(
        userId,
        limit ? parseInt(limit as string) : 100
      );

      res.json({
        success: true,
        data: logs,
        total: logs.length,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar logs do usuário',
        message: error.message,
      });
    }
  }

  /**
   * GET /logs/type/:type - Lista logs por tipo
   */
  static async getByType(req: Request, res: Response): Promise<void> {
    try {
      const { type } = req.params;
      const { companyId, limit } = req.query;

      // Se não for admin, filtrar apenas logs da empresa do usuário
      const filterCompanyId = req.auth?.role === 'admin_platform'
        ? (companyId as string)
        : req.auth?.companyId;

      const logs = await LogService.getLogsByType(
        type as any,
        filterCompanyId,
        limit ? parseInt(limit as string) : 100
      );

      res.json({
        success: true,
        data: logs,
        total: logs.length,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar logs por tipo',
        message: error.message,
      });
    }
  }
}
