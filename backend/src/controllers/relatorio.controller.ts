import { Request, Response } from 'express';
import { FirestoreService } from '../services/firestore.service';
import { Trabalho } from '../types';

export class RelatorioController {
  /**
   * GET /relatorios/diario - Relatório diário
   */
  static async diario(req: Request, res: Response): Promise<void> {
    try {
      const { data } = req.query;
      const companyId = req.auth?.companyId;

      if (!companyId) {
        res.status(400).json({
          success: false,
          error: 'CompanyId é obrigatório',
          code: 2001,
        });
        return;
      }

      const targetDate = data ? new Date(data as string) : new Date();
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      const trabalhos = await FirestoreService.querySubcollection<Trabalho>(
        'companies',
        companyId,
        'trabalhos',
        [
          { field: 'deletedAt', operator: '==', value: null },
          { field: 'data', operator: '>=', value: startOfDay },
          { field: 'data', operator: '<=', value: endOfDay },
        ]
      );

      const relatorio = RelatorioController.calcularTotais(trabalhos);

      res.json({
        success: true,
        data: {
          periodo: 'diario',
          data: targetDate,
          ...relatorio,
          trabalhos,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Erro ao gerar relatório diário',
        message: error.message,
      });
    }
  }

  /**
   * GET /relatorios/semanal - Relatório semanal
   */
  static async semanal(req: Request, res: Response): Promise<void> {
    try {
      const { data } = req.query;
      const companyId = req.auth?.companyId;

      if (!companyId) {
        res.status(400).json({
          success: false,
          error: 'CompanyId é obrigatório',
          code: 2001,
        });
        return;
      }

      const targetDate = data ? new Date(data as string) : new Date();
      const startOfWeek = new Date(targetDate);
      startOfWeek.setDate(targetDate.getDate() - targetDate.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      const trabalhos = await FirestoreService.querySubcollection<Trabalho>(
        'companies',
        companyId,
        'trabalhos',
        [
          { field: 'deletedAt', operator: '==', value: null },
          { field: 'data', operator: '>=', value: startOfWeek },
          { field: 'data', operator: '<=', value: endOfWeek },
        ]
      );

      const relatorio = RelatorioController.calcularTotais(trabalhos);

      res.json({
        success: true,
        data: {
          periodo: 'semanal',
          dataInicio: startOfWeek,
          dataFim: endOfWeek,
          ...relatorio,
          trabalhos,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Erro ao gerar relatório semanal',
        message: error.message,
      });
    }
  }

  /**
   * GET /relatorios/mensal - Relatório mensal
   */
  static async mensal(req: Request, res: Response): Promise<void> {
    try {
      const { mes, ano } = req.query;
      const companyId = req.auth?.companyId;

      if (!companyId) {
        res.status(400).json({
          success: false,
          error: 'CompanyId é obrigatório',
          code: 2001,
        });
        return;
      }

      const targetDate = new Date();
      const month = mes ? parseInt(mes as string) - 1 : targetDate.getMonth();
      const year = ano ? parseInt(ano as string) : targetDate.getFullYear();

      const startOfMonth = new Date(year, month, 1, 0, 0, 0, 0);
      const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

      const trabalhos = await FirestoreService.querySubcollection<Trabalho>(
        'companies',
        companyId,
        'trabalhos',
        [
          { field: 'deletedAt', operator: '==', value: null },
          { field: 'data', operator: '>=', value: startOfMonth },
          { field: 'data', operator: '<=', value: endOfMonth },
        ]
      );

      const relatorio = RelatorioController.calcularTotais(trabalhos);

      res.json({
        success: true,
        data: {
          periodo: 'mensal',
          mes: month + 1,
          ano: year,
          dataInicio: startOfMonth,
          dataFim: endOfMonth,
          ...relatorio,
          trabalhos,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Erro ao gerar relatório mensal',
        message: error.message,
      });
    }
  }

  /**
   * GET /relatorios/funcionario/:id - Relatório por funcionário
   */
  static async porFuncionario(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { dataInicio, dataFim } = req.query;
      const companyId = req.auth?.companyId;

      if (!companyId) {
        res.status(400).json({
          success: false,
          error: 'CompanyId é obrigatório',
          code: 2001,
        });
        return;
      }

      const conditions: any[] = [{ field: 'deletedAt', operator: '==', value: null }];

      if (dataInicio) {
        conditions.push({
          field: 'data',
          operator: '>=',
          value: new Date(dataInicio as string),
        });
      }

      if (dataFim) {
        conditions.push({
          field: 'data',
          operator: '<=',
          value: new Date(dataFim as string),
        });
      }

      const trabalhos = await FirestoreService.querySubcollection<Trabalho>(
        'companies',
        companyId,
        'trabalhos',
        conditions
      );

      // Filtrar trabalhos que incluem o funcionário
      const trabalhosFuncionario = trabalhos.filter((t) =>
        t.funcionarios.some((f) => f.funcionarioId === id)
      );

      // Calcular totais do funcionário
      let totalRecebidoCentavos = 0;
      let quantidadeTrabalhos = 0;

      trabalhosFuncionario.forEach((trabalho) => {
        const funcionario = trabalho.funcionarios.find((f) => f.funcionarioId === id);
        if (funcionario) {
          totalRecebidoCentavos += funcionario.valorPagoCentavos;
          quantidadeTrabalhos++;
        }
      });

      res.json({
        success: true,
        data: {
          funcionarioId: id,
          totalRecebidoCentavos,
          quantidadeTrabalhos,
          trabalhos: trabalhosFuncionario,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Erro ao gerar relatório do funcionário',
        message: error.message,
      });
    }
  }

  /**
   * Calcula totais de faturamento, custos e lucro
   */
  private static calcularTotais(trabalhos: Trabalho[]): {
    faturamentoTotalCentavos: number;
    custosTotaisCentavos: number;
    lucroTotalCentavos: number;
    quantidadeTrabalhos: number;
  } {
    let faturamentoTotalCentavos = 0;
    let custosTotaisCentavos = 0;

    trabalhos.forEach((trabalho) => {
      faturamentoTotalCentavos += trabalho.valorRecebidoCentavos;
      custosTotaisCentavos += trabalho.totalPagoCentavos;
    });

    const lucroTotalCentavos = faturamentoTotalCentavos - custosTotaisCentavos;

    return {
      faturamentoTotalCentavos,
      custosTotaisCentavos,
      lucroTotalCentavos,
      quantidadeTrabalhos: trabalhos.length,
    };
  }
}
