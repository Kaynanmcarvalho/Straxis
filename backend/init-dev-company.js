/**
 * Script para inicializar empresa de desenvolvimento no Firestore
 * Execute: node init-dev-company.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Inicializar Firebase Admin
const serviceAccountPath = path.join(__dirname, 'straxis-6e4bc-firebase-adminsdk-fbsvc-363e5b92ed.json');
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'straxis-6e4bc.firebasestorage.app',
});

const db = admin.firestore();

async function initDevCompany() {
  try {
    console.log('🚀 Inicializando empresa de desenvolvimento...');

    const companyId = 'dev-company-id';
    const companyRef = db.collection('companies').doc(companyId);

    // Verificar se já existe
    const doc = await companyRef.get();
    if (doc.exists) {
      console.log('✅ Empresa de desenvolvimento já existe');
      return;
    }

    // Criar empresa
    await companyRef.set({
      name: 'Empresa de Desenvolvimento',
      cnpj: '00.000.000/0000-00',
      email: 'dev@straxis.com',
      phone: '(00) 0000-0000',
      address: 'Endereço de Desenvolvimento',
      active: true,
      config: {
        iaEnabled: false,
        iaProvider: 'openai',
        whatsappEnabled: false,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    console.log('✅ Empresa de desenvolvimento criada com sucesso!');
    console.log(`   ID: ${companyId}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao inicializar empresa:', error);
    process.exit(1);
  }
}

initDevCompany();
