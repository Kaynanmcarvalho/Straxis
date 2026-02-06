const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function fixPlatformCompanies() {
  try {
    console.log('🔧 Corrigindo empresas plataforma...');
    
    // IDs das empresas que devem ser plataforma (baseado nos logs)
    const platformIds = [
      'RJJx6FAmOazfBZNUfteE',
      'iIXyRIsGVTpZAYCTasvN',
      'RGYUUGZdiJ12RpOqiOmw'
    ];
    
    const batch = db.batch();
    
    for (const id of platformIds) {
      const docRef = db.collection('companies').doc(id);
      const doc = await docRef.get();
      
      if (doc.exists) {
        const data = doc.data();
        console.log(`✅ Marcando como plataforma: ${id} - ${data.name}`);
        batch.update(docRef, { isPlatform: true });
      }
    }
    
    await batch.commit();
    console.log(`✅ Empresas plataforma corrigidas!`);
    
    // Listar empresas após correção
    console.log('\n📋 Empresas no sistema:');
    const snapshot = await db.collection('companies').get();
    snapshot.forEach((doc) => {
      const data = doc.data();
      const type = data.isPlatform ? '🟣 PLATAFORMA' : '🔵 CLIENTE';
      console.log(`  ${type} - ${doc.id}: ${data.name}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

fixPlatformCompanies();
