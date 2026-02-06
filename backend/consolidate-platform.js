const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function consolidatePlatform() {
  try {
    console.log('🔧 Consolidando empresas plataforma...\n');
    
    // Empresa plataforma principal (a que tem mais usuários)
    const mainPlatformId = 'RGYUUGZdiJ12RpOqiOmw';
    
    // Outras empresas plataforma para marcar como clientes
    const otherPlatformIds = [
      'RJJx6FAmOazfBZNUfteE',
      'iIXyRIsGVTpZAYCTasvN'
    ];
    
    console.log(`✅ Empresa Plataforma Principal: ${mainPlatformId}`);
    console.log(`🔄 Marcando outras como clientes: ${otherPlatformIds.join(', ')}\n`);
    
    // Mover usuário da empresa iIXyRIsGVTpZAYCTasvN para a principal
    const userToMove = 'PPG4lRnodvZEaUDhY1blx8AAFlN2'; // renierkaynan1@gmail.com
    
    const batch = db.batch();
    
    // 1. Marcar outras empresas como clientes
    for (const id of otherPlatformIds) {
      const docRef = db.collection('companies').doc(id);
      batch.update(docRef, {
        isPlatform: false,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`  🔵 Marcando ${id} como cliente`);
    }
    
    // 2. Mover usuário para empresa principal
    const userRef = db.collection('users').doc(userToMove);
    batch.update(userRef, {
      companyId: mainPlatformId,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`  👤 Movendo usuário ${userToMove} para empresa principal`);
    
    await batch.commit();
    console.log('\n✅ Consolidação concluída!');
    
    // 3. Atualizar contagens
    console.log('\n🔄 Atualizando contagens...');
    
    // Contar usuários da empresa principal
    const mainUsersSnapshot = await db.collection('users')
      .where('companyId', '==', mainPlatformId)
      .where('deletedAt', '==', null)
      .get();
    
    await db.collection('companies').doc(mainPlatformId).update({
      userCount: mainUsersSnapshot.size,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    console.log(`  ✅ Empresa principal: ${mainUsersSnapshot.size} usuários`);
    
    // Zerar contagem das outras
    for (const id of otherPlatformIds) {
      await db.collection('companies').doc(id).update({
        userCount: 0,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`  ✅ ${id}: 0 usuários`);
    }
    
    // 4. Listar resultado final
    console.log('\n📋 RESULTADO FINAL:');
    const companiesSnapshot = await db.collection('companies').get();
    
    companiesSnapshot.forEach((doc) => {
      const data = doc.data();
      const type = data.isPlatform ? '🟣 PLATAFORMA' : '🔵 CLIENTE';
      console.log(`  ${type} - ${data.name} (${doc.id}): ${data.userCount || 0} usuários`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

consolidatePlatform();
