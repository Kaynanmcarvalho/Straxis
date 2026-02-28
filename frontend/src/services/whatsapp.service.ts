import { apiService } from './api.service';

export const whatsappService = {
  /**
   * Verifica se o serviço está rodando
   */
  async checkHealth(): Promise<void> {
    await apiService.get('/whatsapp/health');
  },

  /**
   * Conecta ao WhatsApp
   */
  async connect(): Promise<{ qrCode: string; sessionId: string }> {
    const response: any = await apiService.post('/whatsapp/connect');
    return response.data;
  },

  /**
   * Desconecta do WhatsApp
   */
  async disconnect(sessionId: string): Promise<void> {
    await apiService.post('/whatsapp/disconnect', { sessionId });
  },

  /**
   * Força desconexão de todas as sessões
   */
  async forceDisconnect(): Promise<void> {
    await apiService.post('/whatsapp/disconnect', { force: true });
  },

  /**
   * Obtém status da conexão
   */
  async getStatus(): Promise<{ connected: boolean; lastActivity: Date | null }> {
    const response: any = await apiService.get('/whatsapp/status');
    return response.data;
  },

  /**
   * Envia mensagem
   */
  async sendMessage(to: string, message: string): Promise<void> {
    await apiService.post('/whatsapp/send', { to, message });
  },

  /**
   * Lista mensagens
   */
  async getMessages(limit: number = 50): Promise<any[]> {
    const response: any = await apiService.get('/whatsapp/messages', {
      params: { limit },
    });
    return response.data;
  },
};
