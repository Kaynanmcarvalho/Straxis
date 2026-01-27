import { Request, Response } from 'express';
import { iaService } from '../services/ia.service';
import admin from 'firebase-admin';

export class IAController {
  async query(req: Request, res: Response) {
    try {
      const { message } = req.body;
      const { companyId, userId } = (req as any).auth;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const result = await iaService.processQuery(message, companyId, userId);

      res.json({
        response: result.response,
        tokensUsed: result.tokensUsed,
        estimatedCostCentavos: result.estimatedCostCentavos,
        provider: result.provider,
        model: result.model
      });
    } catch (error: any) {
      console.error('Error processing IA query:', error);
      
      // Tentar obter mensagem de fallback
      try {
        const { companyId } = (req as any).auth;
        const fallbackMessage = await iaService.getFallbackMessage(companyId);
        return res.status(500).json({ 
          error: 'IA processing failed',
          fallbackMessage 
        });
      } catch {
        return res.status(500).json({ 
          error: 'IA processing failed',
          message: error.message 
        });
      }
    }
  }

  async getUsage(req: Request, res: Response) {
    try {
      const { companyId, role } = (req as any).auth;
      const { startDate, endDate } = req.query;

      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;

      const usage = await iaService.getUsageByCompany(companyId, start, end);

      res.json({ usage });
    } catch (error: any) {
      console.error('Error getting IA usage:', error);
      res.status(500).json({ error: 'Failed to get IA usage', message: error.message });
    }
  }

  async getUsageByCompany(req: Request, res: Response) {
    try {
      const { role } = (req as any).auth;
      const { companyId } = req.params;
      const { startDate, endDate } = req.query;

      // Apenas Admin_Plataforma pode ver uso de outras empresas
      if (role !== 'admin_platform') {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;

      const usage = await iaService.getUsageByCompany(companyId, start, end);

      res.json({ usage });
    } catch (error: any) {
      console.error('Error getting IA usage by company:', error);
      res.status(500).json({ error: 'Failed to get IA usage', message: error.message });
    }
  }

  async getUsageByUser(req: Request, res: Response) {
    try {
      const { companyId, userId: requestUserId, role } = (req as any).auth;
      const { userId } = req.params;
      const { startDate, endDate } = req.query;

      // Usuário só pode ver seu próprio uso, exceto Admin e Dono
      if (userId !== requestUserId && role !== 'admin_platform' && role !== 'owner') {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;

      const usage = await iaService.getUsageByUser(companyId, userId, start, end);

      res.json({ usage });
    } catch (error: any) {
      console.error('Error getting IA usage by user:', error);
      res.status(500).json({ error: 'Failed to get IA usage', message: error.message });
    }
  }

  async updateConfig(req: Request, res: Response) {
    try {
      const { companyId, role } = (req as any).auth;
      const { iaEnabled, iaProvider, iaModel } = req.body;

      // Apenas Dono_Empresa pode atualizar config
      if (role !== 'owner' && role !== 'admin_platform') {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const updates: any = {};
      if (iaEnabled !== undefined) updates['config.iaEnabled'] = iaEnabled;
      if (iaProvider) updates['config.iaProvider'] = iaProvider;
      if (iaModel) updates['config.iaModel'] = iaModel;

      await admin.firestore()
        .collection('companies')
        .doc(companyId)
        .update(updates);

      res.json({ message: 'IA config updated successfully' });
    } catch (error: any) {
      console.error('Error updating IA config:', error);
      res.status(500).json({ error: 'Failed to update IA config', message: error.message });
    }
  }

  async updatePrompt(req: Request, res: Response) {
    try {
      const { companyId, role } = (req as any).auth;
      const { iaPrompt } = req.body;

      // Apenas Dono_Empresa pode atualizar prompt
      if (role !== 'owner' && role !== 'admin_platform') {
        return res.status(403).json({ error: 'Forbidden' });
      }

      await admin.firestore()
        .collection('companies')
        .doc(companyId)
        .update({
          'config.iaPrompt': iaPrompt
        });

      res.json({ message: 'IA prompt updated successfully' });
    } catch (error: any) {
      console.error('Error updating IA prompt:', error);
      res.status(500).json({ error: 'Failed to update IA prompt', message: error.message });
    }
  }
}

export const iaController = new IAController();
