/**
 * Script para criar usuário de teste completo
 * Cria no Firebase Authentication E no Firestore
 * 
 * Como usar:
 * node create-test-user.js
 */

const admin = require('firebase-admin');

// Inicializa Firebase Admin
const serviceAccount = require('./straxis-6e4bc-firebase-adminsdk-fbsvc-363e5b92ed.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'straxis-6e4bc'
});

const db = admin.firestore();
const auth = admin.auth();

async function createTestUser() {
  try {
    console.log('🔄 Criando usuário de teste...\n');

    // Dados do usuário
    const email = 'admin@straxis.com';
    const password = 'admin123';
    const name = 'Admin Straxis';
    const companyId = 'platform';
    const role = 'admin_platform';

    // 1. Criar no Firebase Authentication
    console.log('📝 Criando no Firebase Authentication...');
    let firebaseUser;
    
    try {
      // Tenta criar novo usuário
      firebaseUser = await auth.createUser({
        email: email,
        password: password,
        displayName: name,
        emailVerified: true
      });
      console.log('✅ Usuário criado no Authentication');
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        console.log('⚠️  Usuário já existe no Authentication, buscando...');
        firebaseUser = await auth.getUserByEmail(email);
        
        // Atualiza a senha
        await auth.updateUser(firebaseUser.uid, {
          password: password
        });
        console.log('✅ Senha atualizada');
      } else {
        throw error;
      }
    }

    const uid = firebaseUser.uid;

    // 2. Criar/Atualizar no Firestore
    console.log('📝 Criando/Atualizando no Firestore...');
    
    const userData = {
      email: email,
      name: name,
      companyId: companyId,
      role: role,
      permissions: [],
      active: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      deletedAt: null
    };

    await db.collection('users').doc(uid).set(userData, { merge: true });
    console.log('✅ Usuário criado/atualizado no Firestore\n');

    // 3. Exibir informações
    console.log('═══════════════════════════════════════');
    console.log('🎉 USUÁRIO DE TESTE CRIADO COM SUCESSO!');
    console.log('═══════════════════════════════════════\n');
    console.log('📋 Credenciais de Login:');
    console.log('   Email:    ', email);
    console.log('   Senha:    ', password);
    console.log('');
    console.log('👤 Dados do Usuário:');
    console.log('   UID:      ', uid);
    console.log('   Nome:     ', name);
    console.log('   Role:     ', role);
    console.log('   CompanyId:', companyId);
    console.log('');
    console.log('🔗 Acesse: http://localhost:5173/login');
    console.log('═══════════════════════════════════════\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro ao criar usuário:', error);
    console.error('\nDetalhes:', error.message);
    process.exit(1);
  }
}

createTestUser();
