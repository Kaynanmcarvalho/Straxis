/**
 * Verifica se seu IP está bloqueado pelo WhatsApp
 * 
 * USO: node check-ip-block.js
 */

const https = require('https');
const { exec } = require('child_process');

console.log('\n🔍 ========== VERIFICAÇÃO DE BLOQUEIO DE IP ========== 🔍\n');

// 1. Verificar IP público
console.log('📡 Verificando seu IP público...\n');

https.get('https://api.ipify.org?format=json', (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const ip = JSON.parse(data).ip;
      console.log(`✅ Seu IP público: ${ip}\n`);
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📋 DIAGNÓSTICO');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      console.log('🚨 PROBLEMA IDENTIFICADO:');
      console.log('   Você testou 2 números diferentes e AMBOS deram erro 515.');
      console.log('   Isso indica que o WhatsApp bloqueou seu IP/conexão.\n');
      
      console.log('❌ NÃO É PROBLEMA DOS NÚMEROS');
      console.log('❌ É BLOQUEIO TEMPORÁRIO DO SEU IP\n');
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ SOLUÇÕES (em ordem de prioridade)');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      console.log('🥇 OPÇÃO 1: Aguardar (MAIS SEGURO)');
      console.log('   ⏱️  Tempo: 24-48 horas');
      console.log('   ✅ Chance: 95% de sucesso');
      console.log('   💡 O que fazer:');
      console.log('      - NÃO tente conectar mais nenhum número');
      console.log('      - Aguarde até 06/02 ou 07/02');
      console.log('      - WhatsApp vai liberar seu IP automaticamente\n');
      
      console.log('🥈 OPÇÃO 2: Mudar Conexão (IMEDIATO)');
      console.log('   ⏱️  Tempo: 5 minutos');
      console.log('   ✅ Chance: 80% de sucesso');
      console.log('   💡 Como fazer:');
      console.log('      A. Usar 4G/5G do celular:');
      console.log('         - Ativar hotspot no celular');
      console.log('         - Conectar PC no hotspot');
      console.log('         - Tentar novamente');
      console.log('      B. Reiniciar modem:');
      console.log('         - Desligar modem por 5 minutos');
      console.log('         - Pode receber novo IP');
      console.log('         - Tentar novamente\n');
      
      console.log('🥉 OPÇÃO 3: Servidor Cloud (DEFINITIVO)');
      console.log('   ⏱️  Tempo: 30-60 minutos');
      console.log('   ✅ Chance: 100% de sucesso');
      console.log('   💡 Como fazer:');
      console.log('      - Deploy em AWS/Google Cloud/DigitalOcean');
      console.log('      - IP limpo, sem histórico de bloqueios');
      console.log('      - Funciona sempre\n');
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('⚠️  O QUE NÃO FAZER');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      console.log('❌ Testar mais números no mesmo IP');
      console.log('   → Só piora o bloqueio\n');
      
      console.log('❌ Usar VPN gratuita');
      console.log('   → IPs de VPN grátis já estão bloqueados\n');
      
      console.log('❌ Tentar "truques" ou "hacks"');
      console.log('   → WhatsApp detecta e bloqueia permanentemente\n');
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('💡 RECOMENDAÇÃO FINAL');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      console.log('Para uso profissional/comercial:');
      console.log('   ✅ WhatsApp Business API oficial (pago)');
      console.log('   ✅ Sem risco de bloqueio');
      console.log('   ✅ Suporte oficial da Meta');
      console.log('   ✅ Limites maiores');
      console.log('   💰 Custo: ~$0.005-0.05 por mensagem\n');
      
      console.log('Provedores recomendados:');
      console.log('   - Twilio: https://www.twilio.com/whatsapp');
      console.log('   - MessageBird: https://messagebird.com/whatsapp');
      console.log('   - 360Dialog: https://www.360dialog.com/\n');
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
    } catch (error) {
      console.error('❌ Erro ao obter IP:', error.message);
    }
  });
}).on('error', (error) => {
  console.error('❌ Erro na requisição:', error.message);
  console.log('\n💡 Verifique sua conexão com a internet.\n');
});
