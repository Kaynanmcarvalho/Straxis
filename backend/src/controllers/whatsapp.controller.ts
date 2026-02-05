import { Request, Response } from 'express';
import { WhatsAppService } from '../services/whatsapp.service';

export class WhatsAppController {
  /**
   * GET /whatsapp/health - Verifica se o serviço está rodando
   */
  static async health(req: Request, res: Response): Promise<void> {
    res.json({
      success: true,
      message: 'WhatsApp service is running',
      timestamp: new Date(),
    });
  }

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
      // Verificar se é erro de cooldown
      if (error.message.includes('Cooldown ativo')) {
        const hoursMatch = error.message.match(/(\d+) horas/);
        const remainingHours = hoursMatch ? parseInt(hoursMatch[1]) : 48;
        
        res.status(429).json({
          success: false,
          error: 'COOLDOWN_ACTIVE',
          code: 'WHATSAPP_COOLDOWN',
          message: 'Número em cooldown por erro 515',
          data: {
            remainingHours,
            reason: 'Erro 515 - Número temporariamente bloqueado pelo WhatsApp',
            actions: [
              'Desconecte TODOS os dispositivos no celular',
              'Use WhatsApp normalmente (envie/receba mensagens)',
              `Aguarde ${remainingHours} horas antes de tentar novamente`,
            ],
          },
        });
        return;
      }

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
   * GET /whatsapp/cooldown - Verifica status do cooldown
   */
  static async getCooldownStatus(req: Request, res: Response): Promise<void> {
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

      const cooldownStatus = await WhatsAppService.getCooldownStatus();

      res.json({
        success: true,
        data: cooldownStatus,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Erro ao verificar cooldown',
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
