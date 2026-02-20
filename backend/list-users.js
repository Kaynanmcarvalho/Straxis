/**
 * Script para listar usuários existentes no Firestore
 * 
 * Como usar:
 * node list-users.js
 */

const admin = require('firebase-admin');

// Inicializa Firebase Admin
const serviceAccount = require('./straxis-6e4bc-firebase-adminsdk-fbsvc-363e5b92ed.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'straxis-6e4bc'
});

const db = admin.firestore();

async function listUsers() {
  try {
    console.log('🔍 Buscando usuários no Firestore...\n');

    const usersSnapshot = await db.collection('users').get();

    if (usersSnapshot.empty) {
      console.log('⚠️  Nenhum usuário encontrado no Firestore\n');
      console.log('📝 Para criar um usuário:');
      console.log('   1. Acesse: https://console.firebase.google.com/project/straxis-6e4bc/authentication/users');
      console.log('   2. Clique em "Add user"');
      console.log('   3. Crie com email: admin@straxis.com e senha: admin123');
      console.log('   4. Copie o UID gerado');
      console.log('   5. Execute: node create-admin-user.js <UID> "admin@straxis.com" "Admin Straxis"\n');
      process.exit(0);
    }

    console.log(`✅ ${usersSnapshot.size} usuário(s) encontrado(s):\n`);
    console.log('═══════════════════════════════════════════════════════════════════════════════');

    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`\n👤 ID: ${doc.id}`);
      console.log(`   Email:     ${data.email || 'N/A'}`);
      console.log(`   Nome:      ${data.name || 'N/A'}`);
      console.log(`   Role:      ${data.role || 'N/A'}`);
      console.log(`   CompanyId: ${data.companyId || 'N/A'}`);
      console.log(`   Ativo:     ${data.active !== false ? '✅ Sim' : '❌ Não'}`);
      console.log(`   Criado:    ${data.createdAt ? new Date(data.createdAt.toDate()).toLocaleString('pt-BR') : 'N/A'}`);
    });

    console.log('\n═══════════════════════════════════════════════════════════════════════════════\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro ao listar usuários:', error);
    console.error('\nDetalhes:', error.message);
    process.exit(1);
  }
}

listUsers();
