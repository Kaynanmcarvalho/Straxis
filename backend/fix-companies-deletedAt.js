const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function fixCompanies() {
  try {
    console.log('🔧 Corrigindo empresas sem deletedAt...');
    
    // Buscar todas as empresas
    const companiesSnapshot = await db.collection('companies').get();
    
    console.log(`📊 Total de empresas encontradas: ${companiesSnapshot.size}`);
    
    const batch = db.batch();
    let count = 0;
    
    companiesSnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Se não tem deletedAt, adicionar
      if (data.deletedAt === undefined) {
        console.log(`✅ Corrigindo empresa: ${doc.id} - ${data.name}`);
        batch.update(doc.ref, { deletedAt: null });
        count++;
      }
    });
    
    if (count > 0) {
      await batch.commit();
      console.log(`✅ ${count} empresas corrigidas com sucesso!`);
    } else {
      console.log('✅ Todas as empresas já estão corretas!');
    }
    
    // Listar empresas após correção
    console.log('\n📋 Empresas no sistema:');
    const updatedSnapshot = await db.collection('companies').get();
    updatedSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`  - ${doc.id}: ${data.name} (isPlatform: ${data.isPlatform || false}, deletedAt: ${data.deletedAt})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

fixCompanies();
