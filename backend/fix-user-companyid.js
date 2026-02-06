const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function fixUserCompanyId() {
  try {
    const userId = 'eSLH96R3UDUtdRVjG6ioXGq4rN92'; // renierkaynan@gmail.com
    const correctCompanyId = 'RGYUUGZdiJ12RpOqiOmw'; // Empresa plataforma
    
    console.log(`🔧 Atualizando companyId do usuário ${userId}...`);
    
    await db.collection('users').doc(userId).update({
      companyId: correctCompanyId,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    console.log('✅ CompanyId atualizado com sucesso!');
    
    // Verificar
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    console.log('\n📋 Dados atualizados:');
    console.log('  Email:', userData.email);
    console.log('  CompanyId:', userData.companyId);
    console.log('  Role:', userData.role);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

fixUserCompanyId();
