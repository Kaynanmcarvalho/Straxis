import { Request, Response } from 'express';
import { WhatsAppService } from '../services/whatsapp.service';

export class WhatsAppController {
  /**
   * POST /whatsapp/connect - Conecta ao WhatsApp
   */
  static async connect(req: Request, res: Response): Promise<void> {
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

      const { qrCode, sessionId } = await WhatsAppService.connect(companyId);

      res.json({
        success: true,
        data: { qrCode, sessionId },
        message: 'Conexão iniciada. Escaneie o QR Code no WhatsApp.',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Erro ao conectar WhatsApp',
        message: error.message,
      });
    }
  }

  /**
   * POST /whatsapp/disconnect - Desconecta do WhatsApp
   */
  static async disconnect(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.body;
      const companyId = req.auth?.companyId;

      if (!companyId) {
        res.status(400).json({
          success: false,
          error: 'CompanyId é obrigatório',
          code: 2001,
        });
        return;
      }

      if (!sessionId) {
        res.status(400).json({
          success: false,
          error: 'SessionId é obrigatório',
          code: 2001,
        });
        return;
      }

      await WhatsAppService.disconnect(companyId, sessionId);

      res.json({
        success: true,
        message: 'Desconectado com sucesso',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Erro ao desconectar WhatsApp',
        message: error.message,
      });
    }
  }

  /**
   * GET /whatsapp/status - Obtém status da conexão
   */
  static async getStatus(req: Request, res: Response): Promise<void> {
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

      const status = await WhatsAppService.getStatus(companyId);

      res.json({
        success: true,
        data: status,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Erro ao obter status',
        message: error.message,
      });
    }
  }

  /**
   * POST /whatsapp/send - Envia mensagem
   */
  static async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { to, message } = req.body;
      const companyId = req.auth?.companyId;

      if (!companyId) {
        res.status(400).json({
          success: false,
          error: 'CompanyId é obrigatório',
          code: 2001,
        });
        return;
      }

      if (!to || !message) {
        res.status(400).json({
          success: false,
          error: 'Destinatário e mensagem são obrigatórios',
          code: 2001,
        });
        return;
      }

      await WhatsAppService.sendMessage(companyId, to, message);

      res.json({
        success: true,
        message: 'Mensagem enviada com sucesso',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Erro ao enviar mensagem',
        message: error.message,
      });
    }
  }

  /**
   * GET /whatsapp/messages - Lista mensagens
   */
  static async getMessages(req: Request, res: Response): Promise<void> {
    try {
      const { limit } = req.query;
      const companyId = req.auth?.companyId;

      if (!companyId) {
        res.status(400).json({
          success: false,
          error: 'CompanyId é obrigatório',
          code: 2001,
        });
        return;
      }

      const messages = await WhatsAppService.getMessages(
        companyId,
        limit ? parseInt(limit as string) : 50
      );

      res.json({
        success: true,
        data: messages,
        total: messages.length,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Erro ao listar mensagens',
        message: error.message,
      });
    }
  }
}
