const admin = require('firebase-admin');

// Inicializar Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function updateUserRole(email, newRole) {
  try {
    console.log(`🔍 Buscando usuário com email: ${email}`);
    
    // Buscar usuário por email
    const usersSnapshot = await db.collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();
    
    if (usersSnapshot.empty) {
      console.log('❌ Usuário não encontrado');
      return;
    }
    
    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();
    
    console.log('✅ Usuário encontrado:');
    console.log('   ID:', userDoc.id);
    console.log('   Nome:', userData.name);
    console.log('   Email:', userData.email);
    console.log('   Role atual:', userData.role);
    console.log('   CompanyId:', userData.companyId);
    
    // Atualizar role
    await db.collection('users').doc(userDoc.id).update({
      role: newRole,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`✅ Role atualizado para: ${newRole}`);
    
    // Atualizar custom claims no Firebase Auth
    try {
      await admin.auth().setCustomUserClaims(userDoc.id, {
        role: newRole,
        companyId: userData.companyId
      });
      console.log('✅ Custom claims atualizados no Firebase Auth');
    } catch (authError) {
      console.log('⚠️  Aviso: Não foi possível atualizar custom claims:', authError.message);
    }
    
    console.log('\n🎉 Atualização concluída com sucesso!');
    console.log('⚠️  IMPORTANTE: O usuário precisa fazer logout e login novamente para as mudanças terem efeito.');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    process.exit(0);
  }
}

// Email do usuário e nova role
const email = 'renierkaynan@gmail.com';
const newRole = 'admin_platform';

updateUserRole(email, newRole);
