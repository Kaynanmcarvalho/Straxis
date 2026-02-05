const axios = require('axios');

const LM_STUDIO_URL = 'http://127.0.0.1:1234';

async function testLMStudio() {
  console.log('🧪 Testando conexão com LM Studio...\n');

  // Teste 1: Verificar modelos disponíveis
  console.log('📋 Teste 1: Buscando modelos disponíveis');
  try {
    // Tentar /v1/models primeiro
    let response;
    try {
      console.log('   Tentando GET /v1/models...');
      response = await axios.get(`${LM_STUDIO_URL}/v1/models`);
      console.log('   ✅ Sucesso com /v1/models');
    } catch (error) {
      console.log('   ⚠️  Falhou /v1/models, tentando /api/v1/models...');
      response = await axios.get(`${LM_STUDIO_URL}/api/v1/models`);
      console.log('   ✅ Sucesso com /api/v1/models');
    }

    const models = response.data.data || response.data.models || [];
    console.log(`   📦 Modelos encontrados: ${models.length}`);
    models.forEach((model, index) => {
      console.log(`      ${index + 1}. ${model.id || model.name}`);
    });
    console.log('');
  } catch (error) {
    console.error('   ❌ Erro ao buscar modelos:', error.message);
    console.log('');
  }

  // Teste 2: Enviar mensagem de teste
  console.log('💬 Teste 2: Enviando mensagem "Oi" para o modelo');
  try {
    const payload = {
      model: 'local-model', // LM Studio geralmente aceita qualquer nome se houver apenas 1 modelo
      messages: [
        { role: 'system', content: 'Você é um assistente útil.' },
        { role: 'user', content: 'Oi' }
      ],
      temperature: 0.7,
      max_tokens: 100,
    };

    // Tentar /v1/chat/completions primeiro
    let response;
    try {
      console.log('   Tentando POST /v1/chat/completions...');
      response = await axios.post(`${LM_STUDIO_URL}/v1/chat/completions`, payload);
      console.log('   ✅ Sucesso com /v1/chat/completions');
    } catch (error) {
      console.log('   ⚠️  Falhou /v1/chat/completions, tentando /api/v1/chat...');
      response = await axios.post(`${LM_STUDIO_URL}/api/v1/chat`, payload);
      console.log('   ✅ Sucesso com /api/v1/chat');
    }

    const completion = response.data.choices[0].message.content;
    const tokensUsed = response.data.usage?.total_tokens || 0;

    console.log(`   🤖 Resposta: "${completion}"`);
    console.log(`   📊 Tokens usados: ${tokensUsed}`);
    console.log('');
  } catch (error) {
    console.error('   ❌ Erro ao enviar mensagem:', error.message);
    if (error.response) {
      console.error('   📄 Resposta do servidor:', error.response.data);
    }
    console.log('');
  }

  // Teste 3: Verificar todas as rotas disponíveis
  console.log('🔍 Teste 3: Verificando rotas disponíveis');
  const routes = [
    '/v1/models',
    '/api/v1/models',
    '/v1/chat/completions',
    '/api/v1/chat',
    '/api/v1/completions',
    '/v1/completions',
  ];

  for (const route of routes) {
    try {
      if (route.includes('chat') || route.includes('completions')) {
        // POST routes
        await axios.post(`${LM_STUDIO_URL}${route}`, {
          model: 'test',
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 1,
        }, { timeout: 2000 });
        console.log(`   ✅ ${route} (POST)`);
      } else {
        // GET routes
        await axios.get(`${LM_STUDIO_URL}${route}`, { timeout: 2000 });
        console.log(`   ✅ ${route} (GET)`);
      }
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        console.log(`   ⏱️  ${route} (timeout)`);
      } else if (error.response && error.response.status !== 404) {
        console.log(`   ⚠️  ${route} (${error.response.status})`);
      } else {
        console.log(`   ❌ ${route} (não disponível)`);
      }
    }
  }

  console.log('\n✨ Testes concluídos!');
}

testLMStudio().catch(console.error);
