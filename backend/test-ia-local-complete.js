const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Você precisa de um token válido para testar
// Para obter um token, faça login no frontend e copie do localStorage
const AUTH_TOKEN = 'seu-token-aqui';

async function testIALocalComplete() {
  console.log('🧪 Teste Completo de IA Local\n');

  // Teste 1: Verificar configuração atual
  console.log('📋 Teste 1: Verificar configuração atual');
  try {
    const response = await axios.get(`${API_URL}/ia/config`, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
      },
    });

    console.log('   ✅ Configuração atual:');
    console.log('   ', JSON.stringify(response.data.data, null, 2));
    console.log('');
  } catch (error) {
    if (error.response) {
      console.error(`   ❌ Erro ${error.response.status}:`, error.response.data);
    } else {
      console.error('   ❌ Erro:', error.message);
    }
    console.log('   ⚠️  Você precisa de um token válido para continuar.');
    console.log('   💡 Faça login no frontend e copie o token do localStorage.');
    console.log('');
    return;
  }

  // Teste 2: Atualizar para IA Local
  console.log('🔧 Teste 2: Configurar IA Local (LM Studio)');
  try {
    await axios.put(
      `${API_URL}/ia/config`,
      {
        provider: 'local',
        localProvider: 'lmstudio',
        localServerUrl: 'http://127.0.0.1:1234',
        model: 'qwen2.5-coder-7b-instruct',
      },
      {
        headers: {
          'Authorization': `Bearer ${AUTH_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('   ✅ Configuração atualizada para IA Local');
    console.log('');
  } catch (error) {
    if (error.response) {
      console.error(`   ❌ Erro ${error.response.status}:`, error.response.data);
    } else {
      console.error('   ❌ Erro:', error.message);
    }
    console.log('');
    return;
  }

  // Teste 3: Enviar query para IA Local
  console.log('💬 Teste 3: Enviar query "Olá, como você está?"');
  try {
    const response = await axios.post(
      `${API_URL}/ia/query`,
      {
        message: 'Olá, como você está?',
      },
      {
        headers: {
          'Authorization': `Bearer ${AUTH_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('   ✅ Resposta recebida:');
    console.log('   🤖 Resposta:', response.data.response);
    console.log('   📊 Tokens:', response.data.tokensUsed);
    console.log('   💰 Custo:', response.data.estimatedCostCentavos / 100, 'R$');
    console.log('   🏷️  Provider:', response.data.provider);
    console.log('   📦 Modelo:', response.data.model);
    console.log('');
  } catch (error) {
    if (error.response) {
      console.error(`   ❌ Erro ${error.response.status}:`, error.response.data);
    } else {
      console.error('   ❌ Erro:', error.message);
    }
    console.log('');
  }

  console.log('✨ Testes concluídos!');
  console.log('\n💡 Verifique os logs do backend para ver os logs detalhados.');
}

testIALocalComplete().catch(console.error);
