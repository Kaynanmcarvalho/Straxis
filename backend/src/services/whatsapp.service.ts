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
   * Verifica se está em cooldown (bloqueio temporário)
   */
  private static checkCooldown(): { inCooldown: boolean; remainingTime?: number } {
    const cooldownFile = path.join(__dirname, '../../.whatsapp-cooldown');
    
    if (fs.existsSync(cooldownFile)) {
      const cooldownUntil = parseInt(fs.readFileSync(cooldownFile, 'utf-8'));
      const now = Date.now();
      
      if (now < cooldownUntil) {
        const remainingMs = cooldownUntil - now;
        const remainingHours = Math.ceil(remainingMs / (1000 * 60 * 60));
        return { inCooldown: true, remainingTime: remainingHours };
      } else {
        // Cooldown expirou, remover arquivo
        fs.unlinkSync(cooldownFile);
      }
    }
    
    return { inCooldown: false };
  }

  /**
   * Aplica cooldown de 48 horas após erro 515
   */
  private static applyCooldown(): void {
    const cooldownFile = path.join(__dirname, '../../.whatsapp-cooldown');
    const cooldownUntil = Date.now() + (48 * 60 * 60 * 1000); // 48 horas
    fs.writeFileSync(cooldownFile, cooldownUntil.toString());
    
    const releaseDate = new Date(cooldownUntil).toLocaleString('pt-BR');
    console.log(`\n🔒 COOLDOWN APLICADO até ${releaseDate}`);
  }

  /**
   * Conecta ao WhatsApp e gera QR Code
   * Se já existir sessão ativa, retorna erro
   * 
   * MULTI-TENANT: Cada empresa (companyId) tem suas próprias sessões isoladas
   */
  static async connect(companyId: string): Promise<{ qrCode: string; sessionId: string }> {
    try {
      // VERIFICAR COOLDOWN PRIMEIRO
      const cooldownCheck = this.checkCooldown();
      if (cooldownCheck.inCooldown) {
        const errorMsg = `
╔══════════════════════════════════════════════════════════════════════╗
║                    🚨 COOLDOWN ATIVO - NÃO TENTE CONECTAR 🚨          ║
╚══════════════════════════════════════════════════════════════════════╝

⏱️  Tempo restante: ${cooldownCheck.remainingTime} horas

❌ SEU NÚMERO ESTÁ EM COOLDOWN POR ERRO 515

📋 O QUE FAZER:
   1. AGUARDE ${cooldownCheck.remainingTime} horas
   2. Use WhatsApp normalmente no celular
   3. Desconecte TODOS os dispositivos
   4. Tente novamente após o cooldown

⚠️  CADA TENTATIVA PIORA A SITUAÇÃO!

📚 Leia: WHATSAPP_ERROR_515_SOLUTION.md
`;
        console.error(errorMsg);
        throw new Error(`Cooldown ativo. Aguarde ${cooldownCheck.remainingTime} horas antes de tentar novamente.`);
      }

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

      let qrCodeData = '';
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

      // Gerar user agent realista baseado em navegadores reais
      const browsers = [
        ['Chrome (Windows)', 'Windows', '10.0'],
        ['Chrome (MacOS)', 'Mac OS X', '10_15_7'],
        ['Edge (Windows)', 'Windows', '10.0'],
        ['Firefox (Windows)', 'Windows', '10.0'],
      ];
      const randomBrowser = browsers[Math.floor(Math.random() * browsers.length)];
      
      // Versões realistas de Chrome/Edge (2026)
      const chromeVersions = ['131.0.0.0', '130.0.0.0', '129.0.0.0', '128.0.0.0'];
      const randomVersion = chromeVersions[Math.floor(Math.random() * chromeVersions.length)];

      // Criar socket do WhatsApp com configurações anti-detecção
      const sock = makeWASocket({
        version,
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, console as any),
        },
        printQRInTerminal: false,
        // Browser realista - parece dispositivo legítimo
        browser: [randomBrowser[0], randomBrowser[1], randomVersion],
        // Comportamento mais humano
        syncFullHistory: false, // Não sincronizar tudo (suspeito)
        markOnlineOnConnect: false, // Não marcar online imediatamente (bot behavior)
        generateHighQualityLinkPreview: true, // Comportamento normal de usuário
        // Timeouts mais realistas (não muito rápido)
        defaultQueryTimeoutMs: 60000,
        connectTimeoutMs: 60000,
        keepAliveIntervalMs: 25000, // Variação natural
        // Configurações anti-spam
        emitOwnEvents: false,
        fireInitQueries: true,
        getMessage: async () => undefined,
        shouldIgnoreJid: (jid: string) => jid.endsWith('@broadcast'),
        // Retry mais conservador (evita flood)
        retryRequestDelayMs: 500, // Delay maior entre retries
        maxMsgRetryCount: 3, // Menos tentativas
        // Configurações adicionais anti-detecção
        qrTimeout: 60000, // 60s para escanear QR (tempo humano)
        linkPreviewImageThumbnailWidth: 192,
        transactionOpts: { maxCommitRetries: 10, delayBetweenTriesMs: 3000 },
      });

      // Handler para QR Code
      sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          qrCount++;
          console.log(`📱 QR Code gerado (${qrCount}/3)`);
          
          // Limitar a 3 QR codes
          if (qrCount > 3) {
            console.log('⚠️ Limite de 3 QR codes atingido. Encerrando tentativa de conexão.');
            sock.end(new Error('QR code limit reached'));
            this.sessions.delete(sessionId);
            
            // Limpar sessão do Firestore
            const sessions = await FirestoreService.querySubcollection(
              'companies',
              companyId,
              'whatsappSessions',
              [{ field: 'sessionId', operator: '==', value: sessionId }]
            );
            
            if (sessions.length > 0) {
              const session = sessions[0] as any;
              await FirestoreService.deleteSubcollectionDoc(
                'companies',
                companyId,
                'whatsappSessions',
                session.id
              );
            }
            
            if (qrCount === 4) {
              rejectQR(new Error('Limite de 3 QR codes atingido. Tente novamente mais tarde.'));
            }
            return;
          }
          
          qrCodeData = qr;
          
          // Resolver promise apenas no primeiro QR
          if (qrCount === 1) {
            resolveQR(qr);
          }
          
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
              { 
                qrCode: qr, 
                lastActivity: new Date(),
                qrCount 
              }
            );
          }
        }

        if (connection === 'close') {
          const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
          const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
          
          console.log(`❌ [WhatsApp] Empresa ${companyId} - Conexão fechada. Status: ${statusCode}`);
          
          // Limpar sessão em memória
          this.sessions.delete(sessionId);
          console.log(`📊 [WhatsApp] Sessões ativas restantes: ${this.sessions.size}`);
          
          if (statusCode === 515) {
            console.error(`⚠️  [WhatsApp] Empresa ${companyId} - Erro 515: Número bloqueado ou banido`);
            await this.handleError515(companyId, sessionId);
            
            // APLICAR COOLDOWN DE 48 HORAS
            this.applyCooldown();
          }
          
          // Se QR expirou (408) ou erro de conexão, rejeitar promise
          if (statusCode === 408 || statusCode === DisconnectReason.timedOut) {
            console.log(`⏱️  [WhatsApp] Empresa ${companyId} - QR Code expirado ou timeout`);
            if (qrCount === 0) {
              rejectQR(new Error('Timeout ao gerar QR Code'));
            }
          }
          
          if (!shouldReconnect) {
            await this.gracefulDisconnect(companyId);
          }
        } else if (connection === 'open') {
          console.log(`✅ [WhatsApp] Empresa ${companyId} - Conectado ao WhatsApp!`);
          console.log(`📊 [WhatsApp] Total de empresas conectadas: ${this.sessions.size}`);
          
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
                lastActivity: new Date(),
                connectedAt: new Date()
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
          qrCount: 0,
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
   * Verifica se existe sessão ativa
   */
  private static async getActiveSession(companyId: string): Promise<ActiveSession | null> {
    // Verificar em memória
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
      
      // Procurar diretórios de sessão
      if (!fs.existsSync(this.authDir)) {
        return null;
      }

      const files = fs.readdirSync(this.authDir);
      const sessionDirs = files.filter(f => f.startsWith(`session_${companyId}_`));
      
      if (sessionDirs.length === 0) {
        console.log('❌ Nenhuma sessão salva encontrada');
        return null;
      }

      // Pegar a sessão mais recente
      const latestSession = sessionDirs.sort().reverse()[0];
      const authPath = path.join(this.authDir, latestSession);
      
      console.log(`📂 Tentando recuperar: ${latestSession}`);

      // Tentar carregar credenciais
      const { state, saveCreds } = await useMultiFileAuthState(authPath);
      
      // Verificar se tem credenciais válidas
      if (!state.creds || !state.creds.me) {
        console.log('❌ Credenciais inválidas');
        return null;
      }

      const { version } = await fetchLatestBaileysVersion();

      // Criar socket com credenciais salvas e configurações anti-detecção
      const sock = makeWASocket({
        version,
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, console as any),
        },
        printQRInTerminal: false,
        // Browser realista
        browser: ['Chrome', 'Windows', '131.0.0.0'],
        syncFullHistory: false,
        markOnlineOnConnect: false, // Não marcar online imediatamente
        generateHighQualityLinkPreview: true,
        getMessage: async () => undefined,
        // Configurações conservadoras
        retryRequestDelayMs: 500,
        maxMsgRetryCount: 3,
        keepAliveIntervalMs: 25000,
      });

      // Aguardar conexão
      const connected = await new Promise<boolean>((resolve) => {
        const timeout = setTimeout(() => resolve(false), 10000); // 10s timeout

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

      // Armazenar sessão recuperada
      this.sessions.set(latestSession, {
        socket: sock,
        sessionId: latestSession,
        companyId,
      });

      // Atualizar Firestore
      await FirestoreService.createSubcollectionDoc(
        'companies',
        companyId,
        'whatsappSessions',
        {
          sessionId: latestSession,
          qrCode: null,
          connected: true,
          lastActivity: new Date(),
          createdAt: new Date(),
          recovered: true,
        }
      );

      // Handler para credenciais
      sock.ev.on('creds.update', saveCreds);

      // Handler para mensagens
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
   * Limpa sessões antigas e arquivos de autenticação
   */
  private static async cleanOldSessions(companyId: string): Promise<void> {
    try {
      console.log('🧹 Limpando sessões antigas...');
      
      // Limpar sessões ativas em memória
      for (const [sessionId, session] of this.sessions) {
        if (session.companyId === companyId) {
          try {
            await session.socket.logout();
          } catch (err) {
            console.error('Erro ao deslogar sessão:', err);
          }
          this.sessions.delete(sessionId);
        }
      }

      // Limpar diretórios de autenticação antigos (mais de 1 hora)
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
   * Handler para erro 515 (número bloqueado ou já conectado)
   */
  private static async handleError515(companyId: string, sessionId: string): Promise<void> {
    try {
      console.error(`\n🚨 ========== ERRO 515 - DIAGNÓSTICO ========== 🚨`);
      console.error(`📱 Empresa: ${companyId}`);
      console.error(`🔑 Sessão: ${sessionId}`);
      console.error(`\n❌ CAUSAS POSSÍVEIS:`);
      console.error(`   1. Número já conectado em outro dispositivo/aplicação`);
      console.error(`   2. Número temporariamente bloqueado pelo WhatsApp`);
      console.error(`   3. Sessão corrompida ou conflitante`);
      console.error(`\n✅ SOLUÇÕES:`);
      console.error(`   1. Desconecte TODOS os dispositivos no celular:`);
      console.error(`      WhatsApp → Configurações → Aparelhos conectados`);
      console.error(`   2. Execute: node clean-whatsapp-sessions-force.js`);
      console.error(`   3. Aguarde 5-10 minutos`);
      console.error(`   4. Tente conectar novamente`);
      console.error(`\n⏱️  Se o erro persistir, aguarde 1-2 horas (cooldown do WhatsApp)`);
      console.error(`================================================\n`);
      
      await LogService.logWhatsApp(companyId, 'Erro 515 - Conexão rejeitada', {
        sessionId,
        message: 'Número já conectado em outro lugar OU temporariamente bloqueado. Desconecte outros dispositivos e aguarde 5-10 minutos.',
        solutions: [
          'Desconectar todos os dispositivos no celular',
          'Limpar sessões antigas (clean-whatsapp-sessions-force.js)',
          'Aguardar 5-10 minutos',
          'Se persistir, aguardar 1-2 horas'
        ]
      });

      // Limpar sessão
      const authPath = path.join(this.authDir, sessionId);
      if (fs.existsSync(authPath)) {
        console.log(`🗑️  Removendo sessão corrompida: ${sessionId}`);
        fs.rmSync(authPath, { recursive: true, force: true });
      }
    } catch (error) {
      console.error('Erro ao processar erro 515:', error);
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

      await LogService.logWhatsApp(companyId, 'WhatsApp desconectado', { sessionId });
    } catch (error) {
      console.error('Erro ao desconectar:', error);
      throw error;
    }
  }

  /**
   * Força desconexão de todas as sessões de uma empresa
   */
  static async forceDisconnect(companyId: string): Promise<void> {
    try {
      console.log(`🔌 Forçando desconexão de todas as sessões de ${companyId}...`);
      
      // Limpar todas as sessões em memória desta empresa
      for (const [sessionId, session] of this.sessions) {
        if (session.companyId === companyId) {
          try {
            await session.socket.logout();
          } catch (err) {
            console.error('Erro ao deslogar:', err);
          }
          this.sessions.delete(sessionId);
        }
      }

      // Limpar todos os diretórios de autenticação desta empresa
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
   * Desconexão graciosa (quando WhatsApp desconecta inesperadamente)
   */
  static async gracefulDisconnect(companyId: string): Promise<void> {
    try {
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

      // Registrar log (sem notificação para evitar erro de userId undefined)
      await LogService.logWhatsApp(companyId, 'Desconexão graciosa WhatsApp', {
        reason: 'unexpected_disconnect',
        sessionsAffected: sessions.length
      });
      
      console.log(`📴 Desconexão graciosa concluída para ${companyId}`);
    } catch (error) {
      console.error('Erro na desconexão graciosa WhatsApp:', error);
      // Não fazer throw para não crashar o servidor
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

      // ANTI-SPAM: Delay aleatório entre 2-5 segundos (comportamento humano)
      const humanDelay = Math.floor(Math.random() * 3000) + 2000; // 2000-5000ms
      console.log(`⏱️  Aguardando ${humanDelay}ms antes de enviar (comportamento humano)...`);
      await new Promise(resolve => setTimeout(resolve, humanDelay));

      // Simular "digitando" antes de enviar (mais realista)
      try {
        await activeSession.socket.sendPresenceUpdate('composing', formattedNumber);
        await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000)); // 1-3s digitando
        await activeSession.socket.sendPresenceUpdate('paused', formattedNumber);
      } catch (presenceError) {
        console.warn('Erro ao enviar presença (não crítico):', presenceError);
      }

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
   * Obtém status do cooldown
   */
  static getCooldownStatus(): { 
    inCooldown: boolean; 
    remainingHours?: number;
    releaseDate?: string;
  } {
    const cooldownCheck = this.checkCooldown();
    
    if (cooldownCheck.inCooldown) {
      const cooldownFile = path.join(__dirname, '../../.whatsapp-cooldown');
      const cooldownUntil = parseInt(fs.readFileSync(cooldownFile, 'utf-8'));
      const releaseDate = new Date(cooldownUntil).toLocaleString('pt-BR');
      
      return {
        inCooldown: true,
        remainingHours: cooldownCheck.remainingTime,
        releaseDate,
      };
    }
    
    return { inCooldown: false };
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
