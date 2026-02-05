/**
 * Script de Teste - Conexão WhatsApp com Anti-Detecção
 * 
 * Testa a nova implementação com:
 * - Browser fingerprint realista
 * - Comportamento humano
 * - Delays anti-spam
 * 
 * USO:
 * node test-whatsapp-connection.js
 */

const makeWASocket = require('@whiskeysockets/baileys').default;
const { useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const path = require('path');
const fs = require('fs');

const TEST_SESSION_DIR = path.join(__dirname, 'whatsapp-auth', 'test_session_' + Date.now());

async function testConnection() {
  console.log('\n🧪 ========== TESTE DE CONEXÃO WHATSAPP ========== 🧪\n');
  console.log('📋 Configurações Anti-Detecção:');
  console.log('   ✅ Browser realista (Chrome/Windows)');
  console.log('   ✅ Não marca online imediatamente');
  console.log('   ✅ Preview de links habilitado');
  console.log('   ✅ Retry conservador (3x)');
  console.log('   ✅ Delays realistas\n');

  try {
    // Criar diretório de autenticação
    if (!fs.existsSync(TEST_SESSION_DIR)) {
      fs.mkdirSync(TEST_SESSION_DIR, { recursive: true });
    }

    // Configurar autenticação
    const { state, saveCreds } = await useMultiFileAuthState(TEST_SESSION_DIR);
    const { version } = await fetchLatestBaileysVersion();

    console.log(`📱 Versão Baileys: ${version.join('.')}\n`);

    // Browsers realistas para rotação
    const browsers = [
      ['Chrome (Windows)', 'Windows', '131.0.0.0'],
      ['Chrome (MacOS)', 'Mac OS X', '130.0.0.0'],
      ['Edge (Windows)', 'Windows', '131.0.0.0'],
    ];
    const randomBrowser = browsers[Math.floor(Math.random() * browsers.length)];

    console.log(`🌐 Browser selecionado: ${randomBrowser[0]} ${randomBrowser[2]}\n`);

    let qrCount = 0;
    let connected = false;

    // Criar socket com configurações anti-detecção
    const sock = makeWASocket({
      version,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, console),
      },
      printQRInTerminal: false,
      browser: randomBrowser,
      syncFullHistory: false,
      markOnlineOnConnect: false, // ANTI-DETECÇÃO
      generateHighQualityLinkPreview: true, // COMPORTAMENTO NORMAL
      defaultQueryTimeoutMs: 60000,
      connectTimeoutMs: 60000,
      keepAliveIntervalMs: 25000, // VARIAÇÃO NATURAL
      emitOwnEvents: false,
      fireInitQueries: true,
      getMessage: async () => undefined,
      shouldIgnoreJid: (jid) => jid.endsWith('@broadcast'),
      retryRequestDelayMs: 500, // DELAY MAIOR
      maxMsgRetryCount: 3, // MENOS TENTATIVAS
      qrTimeout: 60000,
    });

    // Handler de conexão
    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        qrCount++;
        console.log(`\n📱 QR CODE ${qrCount}/3 GERADO:`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(qr);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('👆 Escaneie o QR Code acima no WhatsApp');
        console.log('   WhatsApp → Aparelhos conectados → Conectar aparelho\n');

        if (qrCount >= 3) {
          console.log('⚠️  Limite de 3 QR codes atingido.');
          console.log('💡 Dica: Se não conseguiu escanear, tente novamente em 5 minutos.\n');
        }
      }

      if (connection === 'close') {
        const statusCode = (lastDisconnect?.error)?.output?.statusCode;
        console.log(`\n❌ Conexão fechada. Status: ${statusCode}`);

        if (statusCode === 515) {
          console.log('\n🚨 ========== ERRO 515 DETECTADO ========== 🚨');
          console.log('❌ Número bloqueado ou já conectado em outro lugar\n');
          console.log('✅ SOLUÇÕES:');
          console.log('   1. Desconecte TODOS os dispositivos no celular');
          console.log('      WhatsApp → Configurações → Aparelhos conectados');
          console.log('   2. Execute: node clean-whatsapp-sessions-force.js');
          console.log('   3. Aguarde 2-4 horas (cooldown do WhatsApp)');
          console.log('   4. Leia: WHATSAPP_ANTI_BAN_GUIDE.md\n');
          console.log('⚠️  Se o número é novo (menos de 30 dias):');
          console.log('   - Use pessoalmente por 7-14 dias primeiro');
          console.log('   - Converse com pelo menos 10 contatos diferentes');
          console.log('   - Crie histórico de uso legítimo\n');
        } else if (statusCode === 403) {
          console.log('\n🚨 ========== ERRO 403 - BANIMENTO ========== 🚨');
          console.log('❌ Número BANIDO permanentemente pelo WhatsApp\n');
          console.log('✅ SOLUÇÕES:');
          console.log('   1. Apelar via: support@whatsapp.com');
          console.log('   2. Usar número diferente');
          console.log('   3. Considerar WhatsApp Business API oficial\n');
        } else if (statusCode === 408 || statusCode === DisconnectReason.timedOut) {
          console.log('\n⏱️  Timeout - QR Code expirou');
          console.log('💡 Tente novamente. Escaneie mais rápido.\n');
        } else if (statusCode === DisconnectReason.loggedOut) {
          console.log('\n🔓 Deslogado - Sessão encerrada normalmente\n');
        } else {
          console.log(`\n⚠️  Erro desconhecido: ${statusCode}`);
          console.log('💡 Verifique sua conexão de internet\n');
        }

        // Limpar sessão de teste
        if (fs.existsSync(TEST_SESSION_DIR)) {
          fs.rmSync(TEST_SESSION_DIR, { recursive: true, force: true });
          console.log('🧹 Sessão de teste removida\n');
        }

        process.exit(statusCode === DisconnectReason.loggedOut ? 0 : 1);
      } else if (connection === 'open') {
        connected = true;
        console.log('\n✅ ========== CONEXÃO ESTABELECIDA ========== ✅');
        console.log(`📱 Número: ${sock.user?.id}`);
        console.log(`👤 Nome: ${sock.user?.name || 'N/A'}`);
        console.log(`🌐 Browser: ${randomBrowser[0]} ${randomBrowser[2]}`);
        console.log(`⏰ Conectado em: ${new Date().toLocaleString('pt-BR')}\n`);

        console.log('🎉 SUCESSO! As configurações anti-detecção funcionaram!\n');
        console.log('📋 Próximos passos:');
        console.log('   1. Teste enviar 1-2 mensagens para contatos conhecidos');
        console.log('   2. Aguarde 5-10 minutos entre mensagens');
        console.log('   3. Monitore se as mensagens são entregues (2 checks)');
        console.log('   4. Leia: WHATSAPP_ANTI_BAN_GUIDE.md para boas práticas\n');

        console.log('⚠️  IMPORTANTE:');
        console.log('   - Não envie mais de 10 mensagens na primeira hora');
        console.log('   - Não envie mensagens idênticas');
        console.log('   - Evite links na primeira mensagem\n');

        // Aguardar 10 segundos e desconectar
        console.log('⏱️  Desconectando em 10 segundos...\n');
        setTimeout(async () => {
          await sock.logout();
          console.log('👋 Desconectado com sucesso!\n');
        }, 10000);
      } else if (connection === 'connecting') {
        console.log('🔄 Conectando ao WhatsApp...\n');
      }
    });

    // Handler de credenciais
    sock.ev.on('creds.update', saveCreds);

    // Aguardar conexão ou timeout (2 minutos)
    await new Promise((resolve) => {
      setTimeout(() => {
        if (!connected) {
          console.log('\n⏱️  Timeout de 2 minutos atingido');
          console.log('💡 Tente novamente ou verifique sua conexão\n');
          process.exit(1);
        }
        resolve();
      }, 120000);
    });

  } catch (error) {
    console.error('\n❌ Erro durante teste:', error.message);
    console.error('\n📋 Stack trace:', error.stack);
    
    // Limpar sessão de teste
    if (fs.existsSync(TEST_SESSION_DIR)) {
      fs.rmSync(TEST_SESSION_DIR, { recursive: true, force: true });
      console.log('\n🧹 Sessão de teste removida\n');
    }
    
    process.exit(1);
  }
}

// Executar teste
console.log('🚀 Iniciando teste de conexão WhatsApp...\n');
console.log('⚠️  ANTES DE CONTINUAR:');
console.log('   1. Desconecte TODOS os dispositivos no celular');
console.log('   2. Execute: node clean-whatsapp-sessions-force.js');
console.log('   3. Aguarde 5 minutos\n');

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

readline.question('Você fez os passos acima? (s/n): ', (answer) => {
  readline.close();
  
  if (answer.toLowerCase() === 's' || answer.toLowerCase() === 'sim') {
    testConnection();
  } else {
    console.log('\n⚠️  Por favor, siga os passos acima antes de testar.');
    console.log('💡 Isso evita erro 515 e aumenta chances de sucesso.\n');
    process.exit(0);
  }
});
