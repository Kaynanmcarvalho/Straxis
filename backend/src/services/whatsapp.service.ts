import { FirestoreService } from './firestore.service';
import { LogService } from './log.service';
import makeWASocket, { 
  DisconnectReason, 
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore
} from '@whiskeysockets/baileys';
import * as fs from 'fs';
import * as path from 'path';
import { Boom } from '@hapi/boom';

interface WhatsAppSession {
  companyId: string;
  sessionId: string;
  qrCode: string | null;
  connected: boolean;
  lastActivity: Date;
}

interface WhatsAppMessage {
  from: string;
  to: string;
  message: string;
  type: 'received' | 'sent';
  processedByIA: boolean;
}

interface ActiveSession {
  socket: any;
  sessionId: string;
  companyId: string;
}

export class WhatsAppService {
  private static sessions: Map<string, ActiveSession> = new Map();
  private static authDir = path.join(__dirname, '../../whatsapp-auth');

  /**
   * Conecta ao WhatsApp e gera QR Code
   */
  static async connect(companyId: string): Promise<{ qrCode: string; sessionId: string }> {
    try {
      const sessionId = `session_${companyId}_${Date.now()}`;
      const authPath = path.join(this.authDir, sessionId);

      // Criar diretório de autenticação se não existir
      if (!fs.existsSync(this.authDir)) {
        fs.mkdirSync(this.authDir, { recursive: true });
      }

      let qrCodeData = '';
      let resolveQR: (value: string) => void;
      const qrPromise = new Promise<string>((resolve) => {
        resolveQR = resolve;
      });

      // Configurar autenticação multi-arquivo
      const { state, saveCreds } = await useMultiFileAuthState(authPath);
      const { version } = await fetchLatestBaileysVersion();

      // Criar socket do WhatsApp
      const sock = makeWASocket({
        version,
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, {
            level: 'silent',
            child: () => ({ level: 'silent' } as any)
          } as any),
        },
        printQRInTerminal: false,
        browser: ['Straxis', 'Chrome', '1.0.0'],
      });

      // Handler para QR Code
      sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          qrCodeData = qr;
          resolveQR(qr);
          
          // Atualizar QR no Firestore
          const sessions = await FirestoreService.querySubcollection(
            'companies',
            companyId,
            'whatsappSessions',
            [{ field: 'sessionId', operator: '==', value: sessionId }]
          );

          if (sessions.length > 0) {
            const session = sessions[0] as any;
            await FirestoreService.updateSubcollectionDoc(
              'companies',
              companyId,
              'whatsappSessions',
              session.id,
              { qrCode: qr, lastActivity: new Date() }
            );
          }
        }

        if (connection === 'close') {
          const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
          
          if (shouldReconnect) {
            console.log('Conexão fechada, reconectando...');
            // Não reconectar automaticamente, deixar usuário decidir
          } else {
            // Limpar sessão
            this.sessions.delete(sessionId);
            await this.gracefulDisconnect(companyId);
          }
        } else if (connection === 'open') {
          console.log('✅ Conectado ao WhatsApp!');
          
          // Atualizar status no Firestore
          const sessions = await FirestoreService.querySubcollection(
            'companies',
            companyId,
            'whatsappSessions',
            [{ field: 'sessionId', operator: '==', value: sessionId }]
          );

          if (sessions.length > 0) {
            const session = sessions[0] as any;
            await FirestoreService.updateSubcollectionDoc(
              'companies',
              companyId,
              'whatsappSessions',
              session.id,
              { 
                connected: true, 
                qrCode: null,
                lastActivity: new Date() 
              }
            );
          }
        }
      });

      // Handler para credenciais atualizadas
      sock.ev.on('creds.update', saveCreds);

      // Handler para mensagens recebidas
      sock.ev.on('messages.upsert', async ({ messages }) => {
        for (const msg of messages) {
          if (!msg.key.fromMe && msg.message) {
            const from = msg.key.remoteJid || '';
            const text = msg.message.conversation || 
                        msg.message.extendedTextMessage?.text || '';
            
            if (text) {
              await this.handleIncomingMessage(companyId, from, text);
            }
          }
        }
      });

      // Armazenar sessão ativa
      this.sessions.set(sessionId, {
        socket: sock,
        sessionId,
        companyId,
      });

      // Salvar sessão no Firestore
      await FirestoreService.createSubcollectionDoc(
        'companies',
        companyId,
        'whatsappSessions',
        {
          sessionId,
          qrCode: null,
          connected: false,
          lastActivity: new Date(),
          createdAt: new Date(),
        }
      );

      // Aguardar QR Code ser gerado (timeout de 30 segundos)
      const qr = await Promise.race([
        qrPromise,
        new Promise<string>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout ao gerar QR Code')), 30000)
        )
      ]);

      // Registrar log
      await LogService.logWhatsApp(companyId, 'Conexão WhatsApp iniciada', {
        sessionId,
      });

      return { qrCode: qr, sessionId };
    } catch (error) {
      console.error('Erro ao conectar WhatsApp:', error);
      throw error;
    }
  }

  /**
   * Desconecta do WhatsApp
   */
  static async disconnect(companyId: string, sessionId: string): Promise<void> {
    try {
      // Desconectar socket se existir
      const activeSession = this.sessions.get(sessionId);
      if (activeSession) {
        await activeSession.socket.logout();
        this.sessions.delete(sessionId);
      }

      // Limpar diretório de autenticação
      const authPath = path.join(this.authDir, sessionId);
      if (fs.existsSync(authPath)) {
        fs.rmSync(authPath, { recursive: true, force: true });
      }

      // Atualizar sessão no Firestore
      const sessions = await FirestoreService.querySubcollection(
        'companies',
        companyId,
        'whatsappSessions',
        [{ field: 'sessionId', operator: '==', value: sessionId }]
      );

      if (sessions.length > 0) {
        const session = sessions[0] as any;
        await FirestoreService.updateSubcollectionDoc(
          'companies',
          companyId,
          'whatsappSessions',
          session.id,
          {
            connected: false,
            disconnectedAt: new Date(),
            lastActivity: new Date(),
          }
        );
      }

      // Registrar log
      await LogService.logWhatsApp(companyId, 'Desconexão WhatsApp', {
        sessionId,
      });
    } catch (error) {
      console.error('Erro ao desconectar WhatsApp:', error);
      throw error;
    }
  }

  /**
   * Desconexão graciosa (quando WhatsApp desconecta inesperadamente)
   */
  static async gracefulDisconnect(companyId: string): Promise<void> {
    try {
      // Importar dinamicamente para evitar dependência circular
      const { notificationService } = await import('./notification.service');

      // Atualizar todas as sessões ativas para desconectadas
      const sessions = await FirestoreService.querySubcollection(
        'companies',
        companyId,
        'whatsappSessions',
        [{ field: 'connected', operator: '==', value: true }]
      );

      for (const session of sessions) {
        const sess = session as any;
        await FirestoreService.updateSubcollectionDoc(
          'companies',
          companyId,
          'whatsappSessions',
          sess.id,
          {
            connected: false,
            disconnectedAt: new Date(),
            lastActivity: new Date(),
          }
        );
      }

      // Notificar no painel
      await notificationService.notifyWhatsAppDisconnected(companyId);

      // Registrar log
      await LogService.logWhatsApp(companyId, 'Desconexão graciosa WhatsApp', {
        reason: 'unexpected_disconnect',
        sessionsAffected: sessions.length
      });
    } catch (error) {
      console.error('Erro na desconexão graciosa WhatsApp:', error);
      throw error;
    }
  }

  /**
   * Envia mensagem via WhatsApp
   */
  static async sendMessage(
    companyId: string,
    to: string,
    message: string
  ): Promise<void> {
    try {
      // Buscar sessão ativa
      let activeSession: ActiveSession | undefined;
      for (const [_, session] of this.sessions) {
        if (session.companyId === companyId) {
          activeSession = session;
          break;
        }
      }

      if (!activeSession) {
        throw new Error('Nenhuma sessão ativa encontrada. Conecte-se ao WhatsApp primeiro.');
      }

      // Formatar número (adicionar @s.whatsapp.net se necessário)
      const formattedNumber = to.includes('@') ? to : `${to}@s.whatsapp.net`;

      // Enviar mensagem
      await activeSession.socket.sendMessage(formattedNumber, { text: message });

      // Salvar mensagem no Firestore
      await FirestoreService.createSubcollectionDoc(
        'companies',
        companyId,
        'whatsappMessages',
        {
          from: 'system',
          to: formattedNumber,
          message,
          type: 'sent',
          processedByIA: false,
          timestamp: new Date(),
        }
      );

      // Registrar log
      await LogService.logWhatsApp(companyId, 'Mensagem enviada', {
        to: formattedNumber,
        messageLength: message.length,
      });
    } catch (error) {
      console.error('Erro ao enviar mensagem WhatsApp:', error);
      throw error;
    }
  }

  /**
   * Handler para mensagens recebidas
   */
  static async handleIncomingMessage(
    companyId: string,
    from: string,
    message: string,
    userId?: string
  ): Promise<void> {
    try {
      // Salvar mensagem recebida no Firestore
      await FirestoreService.createSubcollectionDoc(
        'companies',
        companyId,
        'whatsappMessages',
        {
          from,
          to: 'system',
          message,
          type: 'received',
          processedByIA: false,
          timestamp: new Date(),
        }
      );

      // Registrar log
      await LogService.logWhatsApp(companyId, 'Mensagem recebida', {
        from,
        messageLength: message.length,
      });

      // Verificar se IA está ativada e processar mensagem
      await this.processWithIA(companyId, from, message, userId);
    } catch (error) {
      console.error('Erro ao processar mensagem recebida:', error);
      throw error;
    }
  }

  /**
   * Processa mensagem com IA se estiver ativada
   */
  private static async processWithIA(
    companyId: string,
    from: string,
    message: string,
    userId?: string
  ): Promise<void> {
    try {
      // Importar dinamicamente para evitar dependência circular
      const { iaService } = await import('./ia.service');
      const { FirestoreService } = await import('./firestore.service');
      
      // Buscar configuração da empresa
      const company = await FirestoreService.getDoc('companies', companyId) as any;
      const config = company?.config || {};

      // Verificar se IA está ativada
      if (!config.iaEnabled) {
        return;
      }

      // Processar com IA (usar userId do sistema se não fornecido)
      const systemUserId = userId || 'system';
      const result = await iaService.processQuery(message, companyId, systemUserId);

      // Enviar resposta via WhatsApp
      await this.sendMessage(companyId, from, result.response);

      // Atualizar mensagem como processada por IA
      const messages = await FirestoreService.querySubcollection(
        'companies',
        companyId,
        'whatsappMessages',
        [
          { field: 'from', operator: '==', value: from },
          { field: 'message', operator: '==', value: message }
        ],
        { orderBy: { field: 'timestamp', direction: 'desc' }, limit: 1 }
      );

      if (messages.length > 0) {
        const msg = messages[0] as any;
        await FirestoreService.updateSubcollectionDoc(
          'companies',
          companyId,
          'whatsappMessages',
          msg.id,
          { processedByIA: true }
        );
      }
    } catch (error) {
      console.error('Erro ao processar mensagem com IA:', error);
      
      // Enviar mensagem de fallback
      try {
        const { iaService } = await import('./ia.service');
        const fallbackMessage = await iaService.getFallbackMessage(companyId);
        await this.sendMessage(companyId, from, fallbackMessage);
      } catch (fallbackError) {
        console.error('Erro ao enviar mensagem de fallback:', fallbackError);
      }
    }
  }

  /**
   * Obtém status da conexão
   */
  static async getStatus(companyId: string): Promise<{
    connected: boolean;
    lastActivity: Date | null;
  }> {
    try {
      // Verificar se a empresa existe
      const company = await FirestoreService.getDoc('companies', companyId);
      if (!company) {
        console.warn(`Empresa ${companyId} não encontrada, retornando status desconectado`);
        return {
          connected: false,
          lastActivity: null,
        };
      }

      const sessions = await FirestoreService.querySubcollection(
        'companies',
        companyId,
        'whatsappSessions',
        [{ field: 'connected', operator: '==', value: true }],
        { orderBy: { field: 'lastActivity', direction: 'desc' }, limit: 1 }
      );

      if (sessions.length > 0) {
        const session = sessions[0] as any;
        return {
          connected: true,
          lastActivity: session.lastActivity,
        };
      }

      return {
        connected: false,
        lastActivity: null,
      };
    } catch (error) {
      console.error('Erro ao obter status WhatsApp:', error);
      // Retornar status desconectado em caso de erro ao invés de lançar exceção
      return {
        connected: false,
        lastActivity: null,
      };
    }
  }

  /**
   * Lista mensagens
   */
  static async getMessages(
    companyId: string,
    limit: number = 50
  ): Promise<WhatsAppMessage[]> {
    try {
      // Verificar se a empresa existe
      const company = await FirestoreService.getDoc('companies', companyId);
      if (!company) {
        console.warn(`Empresa ${companyId} não encontrada, retornando lista vazia`);
        return [];
      }

      const messages = await FirestoreService.querySubcollection(
        'companies',
        companyId,
        'whatsappMessages',
        [],
        { orderBy: { field: 'timestamp', direction: 'desc' }, limit }
      );

      return messages as any[];
    } catch (error) {
      console.error('Erro ao listar mensagens WhatsApp:', error);
      // Retornar lista vazia em caso de erro ao invés de lançar exceção
      return [];
    }
  }
}
