/**
 * Script para criar usuário Admin da Plataforma
 * 
 * Como usar:
 * 1. Primeiro, crie o usuário no Firebase Authentication (console.firebase.google.com)
 * 2. Copie o UID do usuário criado
 * 3. Execute: node create-admin-user.js <UID> <email> <nome>
 * 
 * Exemplo:
 * node create-admin-user.js "abc123xyz" "admin@straxis.com" "Admin Straxis"
 */

const admin = require('firebase-admin');
const path = require('path');

// Inicializa Firebase Admin
const serviceAccount = require('./straxis-6e4bc-firebase-adminsdk-fbsvc-363e5b92ed.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'straxis-6e4bc'
});

const db = admin.firestore();

async function createAdminUser(uid, email, name) {
  try {
    console.log('🔄 Criando usuário admin...');
    console.log('UID:', uid);
    console.log('Email:', email);
    console.log('Nome:', name);

    const userData = {
      email: email,
      name: name,
      companyId: 'platform',
      role: 'admin_platform',
      permissions: [],
      active: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      deletedAt: null
    };

    // Cria o documento no Firestore
    await db.collection('users').doc(uid).set(userData);

    console.log('✅ Usuário admin criado com sucesso!');
    console.log('');
    console.log('📋 Dados do usuário:');
    console.log('   ID:', uid);
    console.log('   Email:', email);
    console.log('   Nome:', name);
    console.log('   Role:', 'admin_platform');
    console.log('   CompanyId:', 'platform');
    console.log('');
    console.log('🎉 Agora você pode fazer login com este usuário!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
    process.exit(1);
  }
}

// Pega argumentos da linha de comando
const args = process.argv.slice(2);

if (args.length < 3) {
  console.log('');
  console.log('❌ Uso incorreto!');
  console.log('');
  console.log('📖 Como usar:');
  console.log('   node create-admin-user.js <UID> <email> <nome>');
  console.log('');
  console.log('📝 Exemplo:');
  console.log('   node create-admin-user.js "abc123xyz" "admin@straxis.com" "Admin Straxis"');
  console.log('');
  console.log('⚠️  Importante:');
  console.log('   1. Primeiro crie o usuário no Firebase Authentication');
  console.log('   2. Copie o UID do usuário');
  console.log('   3. Execute este script com o UID');
  console.log('');
  process.exit(1);
}

const [uid, email, name] = args;
createAdminUser(uid, email, name);
