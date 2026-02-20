/**
 * Script de Migração - Trabalhos para Schema v13.0.0
 * 
 * Migra trabalhos existentes para o novo schema canônico
 * com campos corretos e status padronizados
 */

import { initializeApp, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as path from 'path';
import * as fs from 'fs';

// Inicializar Firebase Admin
const serviceAccountPath = path.join(__dirname, '../straxis-6e4bc-firebase-adminsdk-fbsvc-7e5474d6f1.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8')) as ServiceAccount;

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

interface TrabalhoLegacy {
  id: string;
  tipo: 'carga' | 'descarga';
  tonelagem?: number;
  toneladasParciais?: number;
  status?: string;
  clienteNome?: string;
  localDescricao?: string;
  data?: any;
  createdAt?: any;
  updatedAt?: any;
  deletedAt?: any;
  [key: string]: any;
}

const mapearStatus = (statusAntigo?: string): string => {
  if (!statusAntigo) return 'rascunho';
  
  const mapa: Record<string, string> = {
    'planejado': 'agendado',
    'em_execucao': 'em_andamento',
    'pausado': 'pausado',
    'finalizado': 'concluido',
    'cancelado': 'cancelado'
  };
  
  return mapa[statusAntigo] || 'rascunho';
};

async function migrarTrabalhos() {
  console.log('🚀 Iniciando migração de trabalhos...\n');
  
  try {
    // Buscar todas as empresas
    const companiesSnapshot = await db.collection('companies').get();
    
    let totalEmpresas = 0;
    let totalTrabalhos = 0;
    let totalMigrados = 0;
    let totalErros = 0;
    
    for (const companyDoc of companiesSnapshot.docs) {
      const companyId = companyDoc.id;
      const companyData = companyDoc.data();
      
      console.log(`\n📦 Empresa: ${companyData.nome || companyId}`);
      totalEmpresas++;
      
      // Buscar trabalhos da empresa
      const trabalhosSnapshot = await db
        .collection(`companies/${companyId}/trabalhos`)
        .get();
      
      if (trabalhosSnapshot.empty) {
        console.log('   ℹ️  Nenhum trabalho encontrado');
        continue;
      }
      
      console.log(`   📊 ${trabalhosSnapshot.size} trabalhos encontrados`);
      
      for (const trabalhoDoc of trabalhosSnapshot.docs) {
        totalTrabalhos++;
        const trabalhoId = trabalhoDoc.id;
        const trabalhoData = trabalhoDoc.data() as TrabalhoLegacy;
        
        try {
          // Verificar se já foi migrado
          if (trabalhoData.tonelagemPrevista !== undefined) {
            console.log(`   ⏭️  ${trabalhoId} - Já migrado`);
            continue;
          }
          
          // Preparar dados migrados
          const dadosMigrados: any = {
            // Campos obrigatórios
            source: trabalhoData.source || 'manual',
            status: mapearStatus(trabalhoData.status),
            priority: trabalhoData.priority || 'normal',
            
            // Tonelagem
            tonelagemPrevista: trabalhoData.tonelagem || 0,
            tonelagemRealizada: trabalhoData.toneladasParciais || 0,
            
            // Datas
            scheduledAt: trabalhoData.data || trabalhoData.createdAt || null,
            startedAt: trabalhoData.dataInicio || null,
            finishedAt: trabalhoData.dataFim || null,
            slaDueAt: null,
            
            // Equipe
            assignees: trabalhoData.funcionarios?.map((f: any) => f.id) || [],
            registrosPresenca: trabalhoData.registrosPresenca || [],
            pausas: trabalhoData.pausas || [],
            
            // Histórico
            historico: trabalhoData.historico || [],
            
            // Timestamps
            updatedAt: new Date(),
            migratedAt: new Date(),
            migratedFrom: 'v12.x'
          };
          
          // Atualizar documento
          await db
            .collection(`companies/${companyId}/trabalhos`)
            .doc(trabalhoId)
            .update(dadosMigrados);
          
          totalMigrados++;
          console.log(`   ✅ ${trabalhoId} - Migrado com sucesso`);
          
        } catch (error: any) {
          totalErros++;
          console.error(`   ❌ ${trabalhoId} - Erro: ${error.message}`);
        }
      }
    }
    
    // Resumo final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO DA MIGRAÇÃO');
    console.log('='.repeat(60));
    console.log(`Empresas processadas: ${totalEmpresas}`);
    console.log(`Trabalhos encontrados: ${totalTrabalhos}`);
    console.log(`✅ Migrados com sucesso: ${totalMigrados}`);
    console.log(`❌ Erros: ${totalErros}`);
    console.log('='.repeat(60) + '\n');
    
    if (totalErros === 0) {
      console.log('🎉 Migração concluída com sucesso!\n');
    } else {
      console.log('⚠️  Migração concluída com erros. Verifique os logs acima.\n');
    }
    
  } catch (error: any) {
    console.error('\n❌ Erro fatal na migração:', error);
    process.exit(1);
  }
}

// Executar migração
migrarTrabalhos()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Erro:', error);
    process.exit(1);
  });
