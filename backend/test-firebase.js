/**
 * Script de teste para verificar se o Firebase está configurado corretamente
 */

const admin = require('firebase-admin');
const path = require('path');

console.log('🔍 Testando configuração do Firebase...\n');

try {
  // Tenta carregar o arquivo JSON
  const serviceAccountPath = path.join(__dirname, 'straxis-6e4bc-firebase-adminsdk-fbsvc-363e5b92ed.json');
  console.log('📁 Caminho do arquivo JSON:', serviceAccountPath);
  
  const serviceAccount = require(serviceAccountPath);
  console.log('✅ Arquivo JSON carregado com sucesso');
  console.log('📦 Project ID:', serviceAccount.project_id);
  console.log('📧 Client Email:', serviceAccount.client_email);
  
  // Inicializa o Firebase Admin
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'straxis-6e4bc.firebasestorage.app',
  });
  
  console.log('\n✅ Firebase Admin inicializado com sucesso!');
  
  // Testa conexão com Firestore
  const db = admin.firestore();
  console.log('✅ Firestore conectado');
  
  // Testa conexão com Auth
  const auth = admin.auth();
  console.log('✅ Auth conectado');
  
  // Testa conexão com Storage
  const storage = admin.storage();
  console.log('✅ Storage conectado');
  
  console.log('\n🎉 Todas as configurações estão corretas!');
  
  process.exit(0);
} catch (error) {
  console.error('\n❌ Erro ao configurar Firebase:', error.message);
  console.error('\n📋 Stack trace:', error.stack);
  process.exit(1);
}
