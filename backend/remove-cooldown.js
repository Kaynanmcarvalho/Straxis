/**
 * Remove Cooldown do WhatsApp
 * 
 * Use apenas quando:
 * - Já aguardou 48 horas
 * - Desconectou todos os dispositivos
 * - Usou WhatsApp normalmente
 * 
 * USO: node remove-cooldown.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const cooldownFile = path.join(__dirname, '.whatsapp-cooldown');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n🔓 ========== REMOVER COOLDOWN WHATSAPP ========== 🔓\n');

if (!fs.existsSync(cooldownFile)) {
  console.log('✅ Não há cooldown ativo. Você pode tentar conectar.\n');
  process.exit(0);
}

const cooldownUntil = parseInt(fs.readFileSync(cooldownFile, 'utf-8'));
const now = Date.now();
const remainingMs = cooldownUntil - now;

if (remainingMs > 0) {
  const remainingHours = Math.ceil(remainingMs / (1000 * 60 * 60));
  const releaseDate = new Date(cooldownUntil).toLocaleString('pt-BR');
  
  console.log(`⏱️  Cooldown ativo até: ${releaseDate}`);
  console.log(`⏱️  Tempo restante: ${remainingHours} horas\n`);
  console.log('⚠️  ATENÇÃO: Remover cooldown antes do tempo pode piorar o bloqueio!\n');
  console.log('✅ Antes de remover, confirme que você:');
  console.log('   1. Desconectou TODOS os dispositivos no celular');
  console.log('   2. Usou WhatsApp normalmente (enviou/recebeu mensagens)');
  console.log('   3. Aguardou pelo menos 24 horas\n');
  
  rl.question('Tem certeza que quer remover o cooldown? (sim/não): ', (answer) => {
    rl.close();
    
    if (answer.toLowerCase() === 'sim') {
      fs.unlinkSync(cooldownFile);
      console.log('\n✅ Cooldown removido!');
      console.log('💡 Agora você pode tentar conectar novamente.\n');
      console.log('⚠️  Se der erro 515 novamente:');
      console.log('   - O cooldown será aplicado automaticamente por 48h');
      console.log('   - Considere usar número diferente\n');
    } else {
      console.log('\n❌ Operação cancelada.');
      console.log(`💡 Aguarde até ${releaseDate} e tente novamente.\n`);
    }
  });
} else {
  // Cooldown já expirou
  fs.unlinkSync(cooldownFile);
  console.log('✅ Cooldown expirado e removido automaticamente.');
  console.log('💡 Você pode tentar conectar agora.\n');
  rl.close();
}
