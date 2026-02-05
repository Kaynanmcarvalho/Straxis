/**
 * Script para Verificar Status do Número WhatsApp
 * 
 * Verifica se o número está bloqueado, em cooldown ou OK
 * 
 * USO: node check-number-status.js
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n🔍 ========== VERIFICAÇÃO DE STATUS DO NÚMERO ========== 🔍\n');
console.log('Este script vai te guiar para verificar se seu número está bloqueado.\n');

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.toLowerCase());
    });
  });
}

async function checkStatus() {
  let score = 0;
  let issues = [];
  let recommendations = [];

  console.log('📋 Responda as perguntas abaixo:\n');

  // Teste 1: Enviar mensagens
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TESTE 1: Envio de Mensagens');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const test1 = await ask('Você consegue enviar mensagens normais pelo celular? (s/n): ');
  if (test1 === 's' || test1 === 'sim') {
    score += 25;
    console.log('✅ Bom sinal! Número não está totalmente bloqueado.\n');
  } else {
    issues.push('❌ Não consegue enviar mensagens - BLOQUEIO GRAVE');
    recommendations.push('🔧 Contate support@whatsapp.com imediatamente');
    console.log('❌ Problema grave detectado!\n');
  }

  // Teste 2: Mensagens entregues
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TESTE 2: Entrega de Mensagens');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const test2 = await ask('As mensagens são entregues (2 checks cinza/azul)? (s/n): ');
  if (test2 === 's' || test2 === 'sim') {
    score += 25;
    console.log('✅ Ótimo! Mensagens estão sendo entregues.\n');
  } else {
    issues.push('⚠️  Mensagens não entregam - Possível soft-ban');
    recommendations.push('🔧 Aguarde 24-48h sem enviar mensagens');
    console.log('⚠️  Possível restrição temporária.\n');
  }

  // Teste 3: Dispositivos conectados
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TESTE 3: Aparelhos Conectados');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const test3 = await ask('Consegue acessar "Aparelhos conectados" nas configurações? (s/n): ');
  if (test3 === 's' || test3 === 'sim') {
    score += 25;
    console.log('✅ Acesso normal às configurações.\n');
    
    const test3b = await ask('Há algum dispositivo conectado atualmente? (s/n): ');
    if (test3b === 's' || test3b === 'sim') {
      issues.push('⚠️  Dispositivo já conectado - Causa do erro 515');
      recommendations.push('🔧 Desconecte TODOS os dispositivos antes de tentar novamente');
      console.log('⚠️  Dispositivo conectado detectado!\n');
    } else {
      console.log('✅ Nenhum dispositivo conectado.\n');
    }
  } else {
    issues.push('❌ Não consegue acessar configurações - BLOQUEIO');
    recommendations.push('🔧 Número pode estar banido permanentemente');
    console.log('❌ Problema de acesso detectado!\n');
  }

  // Teste 4: Criar grupo
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TESTE 4: Criação de Grupo');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const test4 = await ask('Consegue criar um grupo novo? (s/n): ');
  if (test4 === 's' || test4 === 'sim') {
    score += 25;
    console.log('✅ Funcionalidade de grupos OK.\n');
  } else {
    issues.push('⚠️  Não consegue criar grupos - Restrição ativa');
    recommendations.push('🔧 Aguarde 48-72h e use o WhatsApp normalmente');
    console.log('⚠️  Restrição em grupos detectada.\n');
  }

  // Teste 5: Tentativas recentes
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TESTE 5: Histórico de Tentativas');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const test5 = await ask('Tentou conectar mais de 3 vezes nas últimas 24h? (s/n): ');
  if (test5 === 's' || test5 === 'sim') {
    issues.push('⚠️  Múltiplas tentativas - Cooldown aplicado');
    recommendations.push('🔧 PARE de tentar por 48 horas');
    console.log('⚠️  Cooldown detectado!\n');
  } else {
    console.log('✅ Poucas tentativas recentes.\n');
  }

  // Teste 6: Tipo de conta
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TESTE 6: Tipo de Conta');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const test6 = await ask('Está usando WhatsApp Business? (s/n): ');
  if (test6 === 's' || test6 === 'sim') {
    issues.push('ℹ️  WhatsApp Business tem regras mais rígidas');
    recommendations.push('💡 Considere usar WhatsApp pessoal para Baileys');
    console.log('ℹ️  WhatsApp Business detectado.\n');
  } else {
    console.log('✅ WhatsApp pessoal (menos restritivo).\n');
  }

  // Teste 7: Idade do número
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TESTE 7: Idade do Número');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const test7 = await ask('O número tem mais de 30 dias de uso? (s/n): ');
  if (test7 === 's' || test7 === 'sim') {
    console.log('✅ Número estabelecido.\n');
  } else {
    issues.push('⚠️  Número novo - Maior risco de bloqueio');
    recommendations.push('💡 Use pessoalmente por 14 dias antes de conectar via API');
    console.log('⚠️  Número novo detectado!\n');
  }

  // Resultado final
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 RESULTADO DA ANÁLISE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log(`🎯 Pontuação: ${score}/100\n`);

  if (score >= 75) {
    console.log('✅ STATUS: SAUDÁVEL');
    console.log('📋 Diagnóstico: Número está OK, problema é cooldown temporário\n');
    console.log('🔧 SOLUÇÃO:');
    console.log('   1. Aguarde 48 horas sem tentar conectar');
    console.log('   2. Use WhatsApp normalmente no celular');
    console.log('   3. Desconecte todos os dispositivos');
    console.log('   4. Tente novamente após 48h\n');
    console.log('📈 Chance de sucesso: 80-90%\n');
  } else if (score >= 50) {
    console.log('⚠️  STATUS: RESTRIÇÃO TEMPORÁRIA');
    console.log('📋 Diagnóstico: Número com soft-ban ou cooldown ativo\n');
    console.log('🔧 SOLUÇÃO:');
    console.log('   1. PARE de tentar conectar por 7 dias');
    console.log('   2. Use WhatsApp normalmente (5-10 msg/dia)');
    console.log('   3. Não envie links ou mensagens em massa');
    console.log('   4. Tente novamente após 7 dias\n');
    console.log('📈 Chance de sucesso: 60-70%\n');
  } else if (score >= 25) {
    console.log('❌ STATUS: BLOQUEIO GRAVE');
    console.log('📋 Diagnóstico: Número com restrições severas\n');
    console.log('🔧 SOLUÇÃO:');
    console.log('   1. Contate support@whatsapp.com');
    console.log('   2. Aguarde resposta (3-7 dias)');
    console.log('   3. Se não resolver, use número diferente\n');
    console.log('📈 Chance de sucesso: 30-40%\n');
  } else {
    console.log('🚨 STATUS: BANIMENTO PERMANENTE');
    console.log('📋 Diagnóstico: Número banido pelo WhatsApp\n');
    console.log('🔧 SOLUÇÃO:');
    console.log('   1. Apelar via support@whatsapp.com');
    console.log('   2. Usar número diferente (RECOMENDADO)');
    console.log('   3. Considerar WhatsApp Business API oficial\n');
    console.log('📈 Chance de recuperação: <10%\n');
  }

  if (issues.length > 0) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  PROBLEMAS DETECTADOS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    issues.forEach(issue => console.log(issue));
    console.log('');
  }

  if (recommendations.length > 0) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💡 RECOMENDAÇÕES');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    recommendations.forEach(rec => console.log(rec));
    console.log('');
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📚 DOCUMENTAÇÃO');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('Leia os guias completos:');
  console.log('   📄 WHATSAPP_ERROR_515_SOLUTION.md');
  console.log('   📄 WHATSAPP_ANTI_BAN_GUIDE.md');
  console.log('   📄 diagnose-whatsapp-515.md\n');

  rl.close();
}

checkStatus().catch(console.error);
