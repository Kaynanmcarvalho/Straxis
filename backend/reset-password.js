/**
 * Script para resetar senha de usuário via Firebase Admin
 * 
 * Como usar:
 * node reset-password.js <email> <nova-senha>
 * 
 * Exemplo:
 * node reset-password.js renier2@gmail.com admin123
 */

const admin = require('firebase-admin');

// Inicializa Firebase Admin
const serviceAccount = require('./straxis-6e4bc-firebase-adminsdk-fbsvc-363e5b92ed.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'straxis-6e4bc'
});

const auth = admin.auth();

async function resetPassword(email, newPassword) {
  try {
    console.log('🔄 Resetando senha...\n');
    console.log('Email:', email);
    console.log('Nova senha:', newPassword);
    console.log('');

    // Busca o usuário pelo email
    const user = await auth.getUserByEmail(email);
    
    console.log('✅ Usuário encontrado:');
    console.log('   UID:', user.uid);
    console.log('   Email:', user.email);
    console.log('   Nome:', user.displayName || 'N/A');
    console.log('');

    // Atualiza a senha
    await auth.updateUser(user.uid, {
      password: newPassword
    });

    console.log('═══════════════════════════════════════');
    console.log('🎉 SENHA RESETADA COM SUCESSO!');
    console.log('═══════════════════════════════════════\n');
    console.log('📋 Novas Credenciais:');
    console.log('   Email: ', email);
    console.log('   Senha: ', newPassword);
    console.log('');
    console.log('🔗 Acesse: http://localhost:5173/login');
    console.log('═══════════════════════════════════════\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro ao resetar senha:', error);
    
    if (error.code === 'auth/user-not-found') {
      console.error('\n⚠️  Usuário não encontrado no Firebase Authentication');
      console.error('   Execute: node backend/list-users.js para ver usuários disponíveis\n');
    } else {
      console.error('\nDetalhes:', error.message);
    }
    
    process.exit(1);
  }
}

// Pega argumentos da linha de comando
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('');
  console.log('❌ Uso incorreto!');
  console.log('');
  console.log('📖 Como usar:');
  console.log('   node reset-password.js <email> <nova-senha>');
  console.log('');
  console.log('📝 Exemplo:');
  console.log('   node reset-password.js renier2@gmail.com admin123');
  console.log('');
  console.log('💡 Dica:');
  console.log('   Execute "node list-users.js" para ver usuários disponíveis');
  console.log('');
  process.exit(1);
}

const [email, newPassword] = args;

if (newPassword.length < 6) {
  console.log('');
  console.log('❌ Senha muito curta!');
  console.log('   A senha deve ter pelo menos 6 caracteres');
  console.log('');
  process.exit(1);
}

resetPassword(email, newPassword);
