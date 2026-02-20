const http = require('http');

// Simular token válido (você precisa pegar um token real do localStorage)
const token = 'SEU_TOKEN_AQUI';

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/trabalhos',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
};

console.log('🔍 Testando GET /api/trabalhos...\n');

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  console.log('');

  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Response Body:');
    try {
      const json = JSON.parse(data);
      console.log(JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('Não é JSON:');
      console.log(data.substring(0, 500));
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Erro:', error.message);
});

req.end();
