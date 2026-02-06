const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function testEmpresasAPI() {
  try {
    console.log('🧪 Testando dados de empresas...\n');
    
    // Buscar todas as empresas
    const companiesSnapshot = await db.collection('companies')
      .where('deletedAt', '==', null)
      .orderBy('createdAt', 'desc')
      .get();
    
    console.log(`📊 Total de empresas: ${companiesSnapshot.size}\n`);
    
    companiesSnapshot.forEach((doc) => {
      const data = doc.data();
      const type = data.isPlatform ? '🟣 PLATAFORMA' : '🔵 CLIENTE';
      
      console.log(`${type} - ${data.name}`);
      console.log(`  ID: ${doc.id}`);
      console.log(`  Usuários: ${data.userCount || 0}`);
      console.log(`  Criada em: ${data.createdAt ? data.createdAt.toDate().toLocaleString('pt-BR') : 'N/A'}`);
      console.log(`  Status: ${data.active ? 'Ativa' : 'Suspensa'}`);
      console.log(`  deletedAt: ${data.deletedAt || 'null'}`);
      console.log('');
    });
    
    // Verificar empresa plataforma específica
    const mainPlatformId = 'RGYUUGZdiJ12RpOqiOmw';
    console.log(`\n🔍 Verificando empresa plataforma: ${mainPlatformId}`);
    
    const mainPlatformDoc = await db.collection('companies').doc(mainPlatformId).get();
    if (mainPlatformDoc.exists) {
      const data = mainPlatformDoc.data();
      console.log('  ✅ Empresa encontrada:');
      console.log(`     Nome: ${data.name}`);
      console.log(`     isPlatform: ${data.isPlatform}`);
      console.log(`     userCount: ${data.userCount}`);
      console.log(`     createdAt: ${data.createdAt ? data.createdAt.toDate().toLocaleString('pt-BR') : 'N/A'}`);
      console.log(`     deletedAt: ${data.deletedAt || 'null'}`);
      
      // Contar usuários reais
      const usersSnapshot = await db.collection('users')
        .where('companyId', '==', mainPlatformId)
        .where('deletedAt', '==', null)
        .get();
      
      console.log(`\n  👥 Usuários vinculados (real): ${usersSnapshot.size}`);
      usersSnapshot.forEach((userDoc) => {
        const userData = userDoc.data();
        console.log(`     - ${userData.name} (${userData.email}) - ${userData.role}`);
      });
    } else {
      console.log('  ❌ Empresa não encontrada!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

testEmpresasAPI();
