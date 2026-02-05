const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
const LM_STUDIO_URL = 'http://127.0.0.1:1234';

// Token de teste (você precisa ter um usuário autenticado)
// Para teste, vamos simular sem autenticação primeiro
const testToken = 'seu-token-aqui'; // Substitua por um token válido

async function testIALocalRoutes() {
  console.log('🧪 Testando rotas de IA Local no backend...\n');

  // Teste 1: Buscar modelos do LM Studio
  console.log('📋 Teste 1: POST /api/ia/local/models (LM Studio)');
  try {
    const response = await axios.post(
      `${API_URL}/ia/local/models`,
      {
        provider: 'lmstudio',
        serverUrl: LM_STUDIO_URL,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${testToken}`, // Descomente se tiver token
        },
      }
    );

    console.log('   ✅ Sucesso!');
    console.log(`   📦 Modelos encontrados: ${response.data.data.length}`);
    response.data.data.forEach((model, index) => {
      console.log(`      ${index + 1}. ${model.id}`);
    });
    console.log('');
  } catch (error) {
    if (error.response) {
      console.error(`   ❌ Erro ${error.response.status}:`, error.response.data);
    } else {
      console.error('   ❌ Erro:', error.message);
    }
    console.log('');
  }

  // Teste 2: Verificar saúde do servidor LM Studio
  console.log('🏥 Teste 2: POST /api/ia/local/health (LM Studio)');
  try {
    const response = await axios.post(
      `${API_URL}/ia/local/health`,
      {
        provider: 'lmstudio',
        serverUrl: LM_STUDIO_URL,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${testToken}`, // Descomente se tiver token
        },
      }
    );

    console.log('   ✅ Sucesso!');
    console.log(`   💚 Servidor saudável: ${response.data.data.healthy}`);
    console.log('');
  } catch (error) {
    if (error.response) {
      console.error(`   ❌ Erro ${error.response.status}:`, error.response.data);
    } else {
      console.error('   ❌ Erro:', error.message);
    }
    console.log('');
  }

  // Teste 3: Testar com provider inválido
  console.log('⚠️  Teste 3: POST /api/ia/local/models (provider inválido)');
  try {
    const response = await axios.post(
      `${API_URL}/ia/local/models`,
      {
        provider: 'invalid-provider',
        serverUrl: LM_STUDIO_URL,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('   ❌ Deveria ter falhado!');
    console.log('');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('   ✅ Validação funcionando corretamente!');
      console.log(`   📄 Erro esperado: ${error.response.data.error}`);
    } else {
      console.error('   ❌ Erro inesperado:', error.message);
    }
    console.log('');
  }

  console.log('✨ Testes concluídos!');
  console.log('\n💡 Nota: Se você viu erros de autenticação (401/403), isso é esperado.');
  console.log('   As rotas requerem autenticação. Para testar completamente, use um token válido.');
}

testIALocalRoutes().catch(console.error);
