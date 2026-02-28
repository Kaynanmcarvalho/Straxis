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
   * Normaliza número BR removendo formatação e gerando variações com/sem 9
   * Ex: "6294510649" gera ["5562994510649", "556294510649"]
   */
  static generateBRNumberVariations(input: string): string[] {
    // Limpar tudo que não é dígito
    const clean = input.replace(/[^0-9]/g, '');
    if (!clean) return [];

    const variations = new Set<string>();

    // Determinar o número base (sem código do país)
    let national = clean;
    if (national.startsWith('55') && national.length >= 12) {
      national = national.substring(2);
    }

    // Extrair DDD e número local
    let ddd = '';
    let local = '';

    if (national.length === 10) {
      // Sem o 9: DDD(2) + 8 dígitos
      ddd = national.substring(0, 2);
      local = national.substring(2); // 8 dígitos
    } else if (national.length === 11) {
      // Com o 9: DDD(2) + 9 + 8 dígitos
      ddd = national.substring(0, 2);
      local = national.substring(2); // 9 dígitos
    } else if (national.length === 8) {
      // Só o número local sem DDD - não dá pra gerar variações completas
      return [clean];
    } else if (national.length === 9) {
      // Número local com 9 sem DDD
      return [clean];
    } else {
      return [clean];
    }

    // Gerar variação sem o 9 (8 dígitos locais)
    const localSem9 = local.length === 9 && local.startsWith('9') ? local.substring(1) : local;
    // Gerar variação com o 9 (9 dígitos locais)
    const localCom9 = local.length === 8 ? '9' + local : local;

    // Formato WhatsApp: 55 + DDD + número + @s.whatsapp.net
    // Variações: com 55, sem 55, com 9, sem 9
    variations.add(`55${ddd}${localCom9}`);
    variations.add(`55${ddd}${localSem9}`);
    variations.add(`${ddd}${localCom9}`);
    variations.add(`${ddd}${localSem9}`);

    return Array.from(variations);
  }

  /**
   * Verifica se um JID do WhatsApp deve ser ignorado baseado na config da empresa
   */
  private static async shouldIgnoreMessage(companyId: string, fromJid: string): Promise<boolean> {
    try {
      const company = await FirestoreService.getDoc('companies', companyId) as any;
      const config = company?.config || {};

      // Ignorar status (status@broadcast)
      if (config.iaIgnoreStatus !== false && fromJid === 'status@broadcast') {
        console.log(`🚫 [WhatsApp] Ignorando status broadcast para empresa ${companyId}`);
        return true;
      }

      // Ignorar grupos (@g.us)
      if (config.iaIgnoreGroups !== false && fromJid.endsWith('@g.us')) {
        console.log(`🚫 [WhatsApp] Ignorando grupo ${fromJid} para empresa ${companyId}`);
        return true;
      }

      // Ignorar números específicos
      const ignoredNumbers: string[] = config.iaIgnoredNumbers || [];
      if (ignoredNumbers.length > 0) {
        // Extrair número do JID (remover @s.whatsapp.net)
        const fromNumber = fromJid.replace('@s.whatsapp.net', '').replace('@c.us', '');

        // Gerar variações de cada número ignorado e comparar
        for (const ignored of ignoredNumbers) {
          const variations = this.generateBRNumberVariations(ignored);
          if (variations.some(v => fromNumber.includes(v) || v.includes(fromNumber))) {
            console.log(`🚫 [WhatsApp] Ignorando número ${fromNumber} (match: ${ignored}) para empresa ${companyId}`);
            return true;
          }
        }
      }

      return false;
    } catch (error) {
      console.error('Erro ao verificar filtros de mensagem:', error);
      return false; // Em caso de erro, não ignorar
    }
  }

  /**
   * Restaura todas as sessões WhatsApp salvas ao iniciar o servidor.
   * Busca no Firestore empresas com whatsappEnabled e tenta reconectar
   * usando as credenciais salvas em whatsapp-auth/
   */
  static async restoreAllSessions(): Promise<void> {
    try {
      console.log('\n🔄 [WhatsApp] Restaurando sessões salvas...');

      // Verificar se existe diretório de auth
      if (!fs.existsSync(this.authDir)) {
        console.log('📂 [WhatsApp] Nenhum diretório de auth encontrado');
        return;
      }

      const sessionDirs = fs.readdirSync(this.authDir).filter(f => {
        const fullPath = path.join(this.authDir, f);
        return f.startsWith('session_') && fs.statSync(fullPath).isDirectory();
      });

      if (sessionDirs.length === 0) {
        console.log('📂 [WhatsApp] Nenhuma sessão salva encontrada');
        return;
      }

      // Agrupar por companyId e pegar a mais recente de cada
      const companySessionMap = new Map<string, string>();
      for (const dir of sessionDirs) {
        // Formato: session_{companyId}_{timestamp}
        const parts = dir.split('_');
        if (parts.length >= 3) {
          const companyId = parts.slice(1, -1).join('_');
          const existing = companySessionMap.get(companyId);
          if (!existing || dir > existing) {
            companySessionMap.set(companyId, dir);
          }
        }
      }

      console.log(`📊 [WhatsApp] Encontradas ${companySessionMap.size} empresa(s) com sessões salvas`);

      // Tentar reconectar cada empresa
      let restored = 0;
      let failed = 0;

      for (const [companyId, sessionDir] of companySessionMap) {
        try {
          // Verificar se empresa ainda existe e tem WhatsApp habilitado
          const company = await FirestoreService.getDoc('companies', companyId) as any;
          if (!company) {
            console.log(`⚠️  [WhatsApp] Empresa ${companyId} não encontrada, pulando...`);
            continue;
          }

          console.log(`🔌 [WhatsApp] Reconectando empresa ${companyId}...`);

          const result = await this.recoverSession(companyId);
          if (result) {
            restored++;
            console.log(`✅ [WhatsApp] Empresa ${companyId} reconectada (${result.sessionId})`);

            // Atualizar status no Firestore
            await FirestoreService.update('companies', companyId, {
              'whatsapp.connected': true,
              'whatsapp.lastReconnect': new Date(),
            });
          } else {
            failed++;
            console.log(`❌ [WhatsApp] Falha ao reconectar empresa ${companyId}`);

            // Marcar como desconectado no Firestore
            await FirestoreService.update('companies', companyId, {
              'whatsapp.connected': false,
              'whatsapp.lastReconnectAttempt': new Date(),
            });
          }

          // Delay entre reconexões pra não sobrecarregar
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          failed++;
          console.error(`❌ [WhatsApp] Erro ao restaurar empresa ${companyId}:`, error);
        }
      }

      console.log(`\n📊 [WhatsApp] Restauração concluída: ${restored} reconectada(s), ${failed} falha(s)`);
    } catch (error) {
      console.error('❌ [WhatsApp] Erro ao restaurar sessões:', error);
    }
  }

  /**
   * Conecta ao WhatsApp e gera QR Code
   * Estilo BRC: sem cooldown, com reconexão automática e tratamento Bad MAC
   */
  static async connect(companyId: string): Promise<{ qrCode: string; sessionId: string }> {
    try {
      console.log(`\n🏢 [WhatsApp] Empresa: ${companyId}`);
      console.log(`📊 [WhatsApp] Sessões ativas no sistema: ${this.sessions.size}`);

      // Verificar se já existe sessão ativa E conectada
      const existingSession = await this.getActiveSession(companyId);
      if (existingSession && existingSession.socket?.user) {
        console.log(`⚠️  [WhatsApp] Empresa ${companyId} já possui sessão ativa`);
        throw new Error('Já existe uma sessão ativa. Desconecte primeiro antes de criar uma nova.');
      }

      // Se existe sessão mas não está conectada, limpar
      if (existingSession) {
        console.log(`🧹 [WhatsApp] Limpando sessão inativa da empresa ${companyId}...`);
        await this.forceDisconnect(companyId);
      }

      // Tentar recuperar sessão salva
      const recoveredSession = await this.recoverSession(companyId);
      if (recoveredSession) {
        console.log(`✅ [WhatsApp] Sessão recuperada para empresa ${companyId}!`);
        return { qrCode: '', sessionId: recoveredSession.sessionId };
      }

      // Limpar sessões antigas primeiro
      await this.cleanOldSessions(companyId);

      const sessionId = `session_${companyId}_${Date.now()}`;
      const authPath = path.join(this.authDir, sessionId);

      // Criar diretório de autenticação se não existir
      if (!fs.existsSync(this.authDir)) {
        fs.mkdirSync(this.authDir, { recursive: true });
      }

      let qrCount = 0;
      let resolveQR: (value: string) => void;
      let rejectQR: (error: Error) => void;
      const qrPromise = new Promise<string>((resolve, reject) => {
        resolveQR = resolve;
        rejectQR = reject;
      });

      // Configurar autenticação multi-arquivo
      const { state, saveCreds } = await useMultiFileAuthState(authPath);
      const { version } = await fetchLatestBaileysVersion();

      // Criar socket - browser estilo BRC (Torq System)
      const sock = makeWASocket({
        version,
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, console as any),
        },
        printQRInTerminal: false,
        browser: ['Torq System', 'Chrome', '1.0.0'],
        syncFullHistory: false,
        getMessage: async () => undefined,
      });

      // Handler de conexão - estilo BRC com reconexão e tratamento Bad MAC
      sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          qrCount++;
          console.log(`📱 QR Code gerado (${qrCount}/5)`);
          session.qrCodeData = qr;

          if (qrCount === 1) {
            resolveQR(qr);
          }

          // Atualizar QR no Firestore
          const sessions = await FirestoreService.querySubcollection(
            'companies', companyId, 'whatsappSessions',
            [{ field: 'sessionId', operator: '==', value: sessionId }]
          );
          if (sessions.length > 0) {
            const sess = sessions[0] as any;
            await FirestoreService.updateSubcollectionDoc(
              'companies', companyId, 'whatsappSessions', sess.id,
              { qrCode: qr, lastActivity: new Date(), qrCount }
            );
          }
        }

        if (connection === 'open') {
          console.log(`✅ [WhatsApp] Empresa ${companyId} - Conectado!`);
          console.log(`📊 [WhatsApp] Total de empresas conectadas: ${this.sessions.size}`);

          // Atualizar status no Firestore
          const sessions = await FirestoreService.querySubcollection(
            'companies', companyId, 'whatsappSessions',
            [{ field: 'sessionId', operator: '==', value: sessionId }]
          );
          if (sessions.length > 0) {
            const sess = sessions[0] as any;
            await FirestoreService.updateSubcollectionDoc(
              'companies', companyId, 'whatsappSessions', sess.id,
              { connected: true, qrCode: null, lastActivity: new Date(), connectedAt: new Date() }
            );
          }
        }

        if (connection === 'close') {
          const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
          const errorMessage = lastDisconnect?.error?.message || '';
          const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

          console.log(`❌ [WhatsApp] Empresa ${companyId} - Conexão fechada. Status: ${statusCode}`);

          // TRATAMENTO BAD MAC - estilo BRC: não desconecta, apenas reconecta
          if (errorMessage.includes('Bad MAC') || errorMessage.includes('decrypt')) {
            console.log(`⚠️ Bad MAC detectado para ${companyId} - mantendo sessão ativa`);
            console.log(`ℹ️  Mensagens corrompidas serão ignoradas automaticamente`);

            this.sessions.delete(sessionId);

            // Reconectar após 10 segundos
            setTimeout(() => {
              console.log(`🔄 Reconectando ${companyId} após Bad MAC...`);
              this.connect(companyId).catch(err => {
                console.error(`Erro ao reconectar após Bad MAC:`, err);
              });
            }, 10000);
            return;
          }

          // Limpar sessão em memória
          this.sessions.delete(sessionId);

          if (statusCode === 515) {
            console.log(`🔄 [WhatsApp] Empresa ${companyId} - Erro 515 (restart esperado após pareamento). Reconectando em 5s...`);

            // Reconectar silenciosamente usando credenciais salvas
            setTimeout(async () => {
              try {
                console.log(`🔄 Reconectando ${companyId} com credenciais salvas...`);
                const { state: newState, saveCreds: newSaveCreds } = await useMultiFileAuthState(authPath);
                const { version: newVersion } = await fetchLatestBaileysVersion();

                const newSock = makeWASocket({
                  version: newVersion,
                  auth: {
                    creds: newState.creds,
                    keys: makeCacheableSignalKeyStore(newState.keys, console as any),
                  },
                  printQRInTerminal: false,
                  browser: ['Torq System', 'Chrome', '1.0.0'],
                  syncFullHistory: false,
                  getMessage: async () => undefined,
                });

                newSock.ev.on('connection.update', async (reconnUpdate) => {
                  const { connection: reconnConn } = reconnUpdate;
                  if (reconnConn === 'open') {
                    console.log(`✅ [WhatsApp] Empresa ${companyId} - Reconectado com sucesso após 515!`);
                    
                    this.sessions.set(sessionId, { socket: newSock, sessionId, companyId });

                    const sessions = await FirestoreService.querySubcollection(
                      'companies', companyId, 'whatsappSessions',
                      [{ field: 'sessionId', operator: '==', value: sessionId }]
                    );
                    if (sessions.length > 0) {
                      const sess = sessions[0] as any;
                      await FirestoreService.updateSubcollectionDoc(
                        'companies', companyId, 'whatsappSessions', sess.id,
                        { connected: true, qrCode: null, lastActivity: new Date(), connectedAt: new Date() }
                      );
                    }
                  } else if (reconnConn === 'close') {
                    const reconnStatus = (reconnUpdate.lastDisconnect?.error as Boom)?.output?.statusCode;
                    console.log(`❌ [WhatsApp] Reconexão falhou para ${companyId}. Status: ${reconnStatus}`);
                    if (reconnStatus !== DisconnectReason.loggedOut) {
                      setTimeout(() => {
                        this.connect(companyId).catch(err => console.error('Erro reconexão:', err));
                      }, 10000);
                    }
                  }
                });

                newSock.ev.on('creds.update', newSaveCreds);

                newSock.ev.on('messages.upsert', async ({ messages: msgs }) => {
                  for (const msg of msgs) {
                    if (!msg.key.fromMe && msg.message) {
                      const from = msg.key.remoteJid || '';
                      const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
                      if (text) {
                        await this.handleIncomingMessage(companyId, from, text);
                      }
                    }
                  }
                });
              } catch (err) {
                console.error(`Erro ao reconectar após 515:`, err);
              }
            }, 5000);
            return;
          }

          // Se QR expirou (408) ou timeout
          if (statusCode === 408 || statusCode === DisconnectReason.timedOut) {
            console.log(`⏱️  [WhatsApp] Empresa ${companyId} - QR Code expirado ou timeout`);
            if (qrCount === 0) {
              rejectQR(new Error('Timeout ao gerar QR Code'));
            }
          }

          if (shouldReconnect) {
            // Reconectar após 5 segundos - estilo BRC
            setTimeout(() => {
              console.log(`🔄 Reconectando empresa ${companyId}...`);
              this.connect(companyId).catch(err => {
                console.error(`Erro ao reconectar:`, err);
              });
            }, 5000);
          } else {
            await this.gracefulDisconnect(companyId);
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
      const session: any = {
        socket: sock,
        sessionId,
        companyId,
        qrCodeData: null,
      };
      this.sessions.set(sessionId, session);

      // Salvar sessão no Firestore
      await FirestoreService.createSubcollectionDoc(
        'companies', companyId, 'whatsappSessions',
        { sessionId, qrCode: null, connected: false, lastActivity: new Date(), createdAt: new Date(), qrCount: 0 }
      );

      // Aguardar QR Code (timeout 30s)
      const qr = await Promise.race([
        qrPromise,
        new Promise<string>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout ao gerar QR Code')), 30000)
        )
      ]);

      await LogService.logWhatsApp(companyId, 'Conexão WhatsApp iniciada', { sessionId });
      return { qrCode: qr, sessionId };
    } catch (error) {
      console.error('Erro ao conectar WhatsApp:', error);
      throw error;
    }
  }

  /**
   * Verifica se existe sessão ativa
   */
  private static async getActiveSession(companyId: string): Promise<ActiveSession | null> {
    for (const [_, session] of this.sessions) {
      if (session.companyId === companyId) {
        return session;
      }
    }
    return null;
  }

  /**
   * Tenta recuperar sessão salva
   */
  private static async recoverSession(companyId: string): Promise<{ sessionId: string } | null> {
    try {
      console.log('🔍 Procurando sessão salva...');
      
      if (!fs.existsSync(this.authDir)) {
        return null;
      }

      const files = fs.readdirSync(this.authDir);
      const sessionDirs = files.filter(f => f.startsWith(`session_${companyId}_`));
      
      if (sessionDirs.length === 0) {
        console.log('❌ Nenhuma sessão salva encontrada');
        return null;
      }

      const latestSession = sessionDirs.sort().reverse()[0];
      const authPath = path.join(this.authDir, latestSession);
      
      console.log(`📂 Tentando recuperar: ${latestSession}`);

      const { state, saveCreds } = await useMultiFileAuthState(authPath);
      
      if (!state.creds || !state.creds.me) {
        console.log('❌ Credenciais inválidas');
        return null;
      }

      const { version } = await fetchLatestBaileysVersion();

      const sock = makeWASocket({
        version,
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, console as any),
        },
        printQRInTerminal: false,
        browser: ['Torq System', 'Chrome', '1.0.0'],
        syncFullHistory: false,
        getMessage: async () => undefined,
      });

      const connected = await new Promise<boolean>((resolve) => {
        const timeout = setTimeout(() => resolve(false), 10000);

        sock.ev.on('connection.update', async (update) => {
          const { connection } = update;
          if (connection === 'open') {
            clearTimeout(timeout);
            resolve(true);
          } else if (connection === 'close') {
            clearTimeout(timeout);
            resolve(false);
          }
        });
      });

      if (!connected) {
        console.log('❌ Não foi possível reconectar');
        return null;
      }

      this.sessions.set(latestSession, {
        socket: sock,
        sessionId: latestSession,
        companyId,
      });

      await FirestoreService.createSubcollectionDoc(
        'companies', companyId, 'whatsappSessions',
        { sessionId: latestSession, qrCode: null, connected: true, lastActivity: new Date(), createdAt: new Date(), recovered: true }
      );

      sock.ev.on('creds.update', saveCreds);

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

      console.log('✅ Sessão recuperada com sucesso!');
      return { sessionId: latestSession };
    } catch (error) {
      console.error('Erro ao recuperar sessão:', error);
      return null;
    }
  }

  /**
   * Limpa sessões antigas
   */
  private static async cleanOldSessions(companyId: string): Promise<void> {
    try {
      console.log('🧹 Limpando sessões antigas...');
      
      for (const [sessionId, session] of this.sessions) {
        if (session.companyId === companyId) {
          try { await session.socket.logout(); } catch {}
          this.sessions.delete(sessionId);
        }
      }

      if (fs.existsSync(this.authDir)) {
        const files = fs.readdirSync(this.authDir);
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        
        for (const file of files) {
          if (file.startsWith(`session_${companyId}_`)) {
            const filePath = path.join(this.authDir, file);
            const stats = fs.statSync(filePath);
            if (stats.mtimeMs < oneHourAgo) {
              console.log(`🗑️ Removendo sessão antiga: ${file}`);
              fs.rmSync(filePath, { recursive: true, force: true });
            }
          }
        }
      }
      console.log('✅ Limpeza concluída');
    } catch (error) {
      console.error('Erro ao limpar sessões antigas:', error);
    }
  }

  /**
   * Desconecta do WhatsApp
   */
  static async disconnect(companyId: string, sessionId: string): Promise<void> {
    try {
      const activeSession = this.sessions.get(sessionId);
      if (activeSession) {
        await activeSession.socket.logout();
        this.sessions.delete(sessionId);
      }

      const authPath = path.join(this.authDir, sessionId);
      if (fs.existsSync(authPath)) {
        fs.rmSync(authPath, { recursive: true, force: true });
      }

      const sessions = await FirestoreService.querySubcollection(
        'companies', companyId, 'whatsappSessions',
        [{ field: 'sessionId', operator: '==', value: sessionId }]
      );
      if (sessions.length > 0) {
        const session = sessions[0] as any;
        await FirestoreService.updateSubcollectionDoc(
          'companies', companyId, 'whatsappSessions', session.id,
          { connected: false, disconnectedAt: new Date(), lastActivity: new Date() }
        );
      }

      await LogService.logWhatsApp(companyId, 'WhatsApp desconectado', { sessionId });
    } catch (error) {
      console.error('Erro ao desconectar:', error);
      throw error;
    }
  }

  /**
   * Força desconexão de todas as sessões
   */
  static async forceDisconnect(companyId: string): Promise<void> {
    try {
      console.log(`🔌 Forçando desconexão de todas as sessões de ${companyId}...`);
      
      for (const [sessionId, session] of this.sessions) {
        if (session.companyId === companyId) {
          try { await session.socket.logout(); } catch {}
          this.sessions.delete(sessionId);
        }
      }

      if (fs.existsSync(this.authDir)) {
        const files = fs.readdirSync(this.authDir);
        for (const file of files) {
          if (file.startsWith(`session_${companyId}_`)) {
            const filePath = path.join(this.authDir, file);
            console.log(`🗑️ Removendo: ${file}`);
            fs.rmSync(filePath, { recursive: true, force: true });
          }
        }
      }
      console.log('✅ Desconexão forçada concluída');
    } catch (error) {
      console.error('Erro ao forçar desconexão:', error);
    }
  }

  /**
   * Desconexão graciosa
   */
  static async gracefulDisconnect(companyId: string): Promise<void> {
    try {
      const sessions = await FirestoreService.querySubcollection(
        'companies', companyId, 'whatsappSessions',
        [{ field: 'connected', operator: '==', value: true }]
      );

      for (const session of sessions) {
        const sess = session as any;
        await FirestoreService.updateSubcollectionDoc(
          'companies', companyId, 'whatsappSessions', sess.id,
          { connected: false, disconnectedAt: new Date(), lastActivity: new Date() }
        );
      }

      await LogService.logWhatsApp(companyId, 'Desconexão graciosa WhatsApp', {
        reason: 'unexpected_disconnect',
        sessionsAffected: sessions.length
      });
      
      console.log(`📴 Desconexão graciosa concluída para ${companyId}`);
    } catch (error) {
      console.error('Erro na desconexão graciosa WhatsApp:', error);
    }
  }

  /**
   * Envia mensagem via WhatsApp com delay anti-spam
   */
  static async sendMessage(
    companyId: string,
    to: string,
    message: string
  ): Promise<void> {
    try {
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

      const formattedNumber = to.includes('@') ? to : `${to}@s.whatsapp.net`;

      // ANTI-SPAM: Delay aleatório entre 2-5 segundos
      const humanDelay = Math.floor(Math.random() * 3000) + 2000;
      console.log(`⏱️  Aguardando ${humanDelay}ms antes de enviar...`);
      await new Promise(resolve => setTimeout(resolve, humanDelay));

      // Simular "digitando"
      try {
        await activeSession.socket.sendPresenceUpdate('composing', formattedNumber);
        await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
        await activeSession.socket.sendPresenceUpdate('paused', formattedNumber);
      } catch (presenceError) {
        console.warn('Erro ao enviar presença (não crítico):', presenceError);
      }

      await activeSession.socket.sendMessage(formattedNumber, { text: message });

      await FirestoreService.createSubcollectionDoc(
        'companies', companyId, 'whatsappMessages',
        { from: 'system', to: formattedNumber, message, type: 'sent', processedByIA: false, timestamp: new Date() }
      );

      await LogService.logWhatsApp(companyId, 'Mensagem enviada', {
        to: formattedNumber, messageLength: message.length,
      });
      
      console.log(`✅ Mensagem enviada com sucesso para ${formattedNumber}`);
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
      // Verificar se deve ignorar esta mensagem (status, grupo, número bloqueado)
      if (await this.shouldIgnoreMessage(companyId, from)) {
        return;
      }

      await FirestoreService.createSubcollectionDoc(
        'companies', companyId, 'whatsappMessages',
        { from, to: 'system', message, type: 'received', processedByIA: false, timestamp: new Date() }
      );

      await LogService.logWhatsApp(companyId, 'Mensagem recebida', {
        from, messageLength: message.length,
      });

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
      const { iaService } = await import('./ia.service');
      const { FirestoreService } = await import('./firestore.service');
      
      const company = await FirestoreService.getDoc('companies', companyId) as any;
      const config = company?.config || {};

      if (!config.iaEnabled) {
        return;
      }

      const systemUserId = userId || 'system';
      const result = await iaService.processQuery(message, companyId, systemUserId);

      // Se IA desativada, erro ou resposta vazia, não enviar nada
      if (!result.response || result.model === 'disabled' || result.model === 'error') {
        return;
      }

      await this.sendMessage(companyId, from, result.response);

      const messages = await FirestoreService.querySubcollection(
        'companies', companyId, 'whatsappMessages',
        [
          { field: 'from', operator: '==', value: from },
          { field: 'message', operator: '==', value: message }
        ],
        { orderBy: { field: 'timestamp', direction: 'desc' }, limit: 1 }
      );

      if (messages.length > 0) {
        const msg = messages[0] as any;
        await FirestoreService.updateSubcollectionDoc(
          'companies', companyId, 'whatsappMessages', msg.id,
          { processedByIA: true }
        );
      }
    } catch (error) {
      console.error('Erro ao processar mensagem com IA:', error);
      // Não enviar mensagem de fallback - apenas logar o erro
    }
  }

  /**
   * Obtém status do cooldown (mantido para compatibilidade, sempre retorna false)
   */
  static getCooldownStatus(): { 
    inCooldown: boolean; 
    remainingHours?: number;
    releaseDate?: string;
  } {
    return { inCooldown: false };
  }

  /**
   * Remove cooldown (mantido para compatibilidade)
   */
  static removeCooldown(): void {
    const cooldownFile = path.join(__dirname, '../../.whatsapp-cooldown');
    if (fs.existsSync(cooldownFile)) {
      fs.unlinkSync(cooldownFile);
      console.log('✅ Cooldown removido');
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
      const company = await FirestoreService.getDoc('companies', companyId);
      if (!company) {
        return { connected: false, lastActivity: null };
      }

      const sessions = await FirestoreService.querySubcollection(
        'companies', companyId, 'whatsappSessions',
        [{ field: 'connected', operator: '==', value: true }],
        { orderBy: { field: 'lastActivity', direction: 'desc' }, limit: 1 }
      );

      if (sessions.length > 0) {
        const session = sessions[0] as any;
        return { connected: true, lastActivity: session.lastActivity };
      }

      return { connected: false, lastActivity: null };
    } catch (error) {
      console.error('Erro ao obter status WhatsApp:', error);
      return { connected: false, lastActivity: null };
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
      const company = await FirestoreService.getDoc('companies', companyId);
      if (!company) {
        return [];
      }

      const messages = await FirestoreService.querySubcollection(
        'companies', companyId, 'whatsappMessages',
        [],
        { orderBy: { field: 'timestamp', direction: 'desc' }, limit }
      );

      return messages as any[];
    } catch (error) {
      console.error('Erro ao listar mensagens WhatsApp:', error);
      return [];
    }
  }
}
