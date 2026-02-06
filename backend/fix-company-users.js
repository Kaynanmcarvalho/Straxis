const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function fixCompanyUsers() {
  try {
    console.log('🔧 Diagnosticando e corrigindo empresas e usuários...\n');
    
    // 1. Listar todas as empresas
    console.log('📋 EMPRESAS NO SISTEMA:');
    const companiesSnapshot = await db.collection('companies').get();
    const companies = [];
    
    companiesSnapshot.forEach((doc) => {
      const data = doc.data();
      companies.push({
        id: doc.id,
        name: data.name,
        isPlatform: data.isPlatform || false,
        createdAt: data.createdAt,
      });
      
      const type = data.isPlatform ? '🟣 PLATAFORMA' : '🔵 CLIENTE';
      console.log(`  ${type} - ${doc.id}`);
      console.log(`    Nome: ${data.name}`);
      console.log(`    Data criação: ${data.createdAt ? data.createdAt.toDate() : 'N/A'}`);
    });
    
    // 2. Listar todos os usuários
    console.log('\n👥 USUÁRIOS NO SISTEMA:');
    const usersSnapshot = await db.collection('users')
      .where('deletedAt', '==', null)
      .get();
    
    const usersByCompany = {};
    const usersWithoutCompany = [];
    
    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      const companyId = data.companyId;
      
      console.log(`  - ${doc.id}: ${data.name} (${data.email})`);
      console.log(`    CompanyId: ${companyId || 'SEM EMPRESA'}`);
      console.log(`    Role: ${data.role}`);
      
      if (companyId) {
        if (!usersByCompany[companyId]) {
          usersByCompany[companyId] = [];
        }
        usersByCompany[companyId].push({
          id: doc.id,
          name: data.name,
          email: data.email,
          role: data.role,
        });
      } else {
        usersWithoutCompany.push({
          id: doc.id,
          name: data.name,
          email: data.email,
          role: data.role,
        });
      }
    });
    
    // 3. Contar usuários por empresa
    console.log('\n📊 CONTAGEM DE USUÁRIOS POR EMPRESA:');
    for (const company of companies) {
      const count = usersByCompany[company.id]?.length || 0;
      const type = company.isPlatform ? '🟣 PLATAFORMA' : '🔵 CLIENTE';
      console.log(`  ${type} ${company.name} (${company.id}): ${count} usuários`);
      
      if (usersByCompany[company.id]) {
        usersByCompany[company.id].forEach(user => {
          console.log(`    - ${user.name} (${user.email}) - ${user.role}`);
        });
      }
    }
    
    if (usersWithoutCompany.length > 0) {
      console.log(`\n⚠️  ${usersWithoutCompany.length} usuários SEM EMPRESA:`);
      usersWithoutCompany.forEach(user => {
        console.log(`    - ${user.name} (${user.email}) - ${user.role}`);
      });
    }
    
    // 4. Perguntar qual empresa é a plataforma principal
    console.log('\n🔧 CORREÇÕES NECESSÁRIAS:');
    
    // Encontrar empresa plataforma
    const platformCompanies = companies.filter(c => c.isPlatform);
    
    if (platformCompanies.length === 0) {
      console.log('❌ Nenhuma empresa plataforma encontrada!');
      process.exit(1);
    }
    
    if (platformCompanies.length > 1) {
      console.log(`⚠️  ${platformCompanies.length} empresas marcadas como plataforma. Usando a primeira.`);
    }
    
    const platformCompany = platformCompanies[0];
    console.log(`\n✅ Empresa Plataforma: ${platformCompany.name} (${platformCompany.id})`);
    
    // 5. Atualizar userCount em todas as empresas
    console.log('\n🔄 Atualizando contagem de usuários...');
    const batch = db.batch();
    
    for (const company of companies) {
      const count = usersByCompany[company.id]?.length || 0;
      const docRef = db.collection('companies').doc(company.id);
      
      batch.update(docRef, {
        userCount: count,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      console.log(`  ✅ ${company.name}: ${count} usuários`);
    }
    
    await batch.commit();
    console.log('\n✅ Contagem de usuários atualizada!');
    
    // 6. Verificar e corrigir datas
    console.log('\n🔄 Verificando datas...');
    const dataBatch = db.batch();
    let datesFixed = 0;
    
    for (const company of companies) {
      const docRef = db.collection('companies').doc(company.id);
      const doc = await docRef.get();
      const data = doc.data();
      
      if (!data.createdAt || typeof data.createdAt === 'string') {
        console.log(`  🔧 Corrigindo data de ${company.name}`);
        dataBatch.update(docRef, {
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        datesFixed++;
      }
    }
    
    if (datesFixed > 0) {
      await dataBatch.commit();
      console.log(`✅ ${datesFixed} datas corrigidas!`);
    } else {
      console.log('✅ Todas as datas estão corretas!');
    }
    
    // 7. Resumo final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO FINAL:');
    console.log('='.repeat(60));
    console.log(`Total de empresas: ${companies.length}`);
    console.log(`Empresas plataforma: ${platformCompanies.length}`);
    console.log(`Empresas clientes: ${companies.length - platformCompanies.length}`);
    console.log(`Total de usuários: ${usersSnapshot.size}`);
    console.log(`Usuários sem empresa: ${usersWithoutCompany.length}`);
    console.log('='.repeat(60));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

fixCompanyUsers();
