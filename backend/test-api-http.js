const http = require('http');

function testAPI() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/empresas',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // Adicionar token se necessário
    }
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('📡 Status:', res.statusCode);
      console.log('📦 Response:\n');
      
      try {
        const json = JSON.parse(data);
        console.log(JSON.stringify(json, null, 2));
        
        if (json.data && json.data.length > 0) {
          console.log('\n🔍 Verificando primeira empresa:');
          const empresa = json.data[0];
          console.log('  Nome:', empresa.name);
          console.log('  ID:', empresa.id);
          console.log('  isPlatform:', empresa.isPlatform);
          console.log('  userCount:', empresa.userCount);
          console.log('  createdAt:', empresa.createdAt);
          console.log('  createdAt type:', typeof empresa.createdAt);
          
          if (empresa.createdAt) {
            const date = new Date(empresa.createdAt);
            console.log('  createdAt parsed:', date.toLocaleString('pt-BR'));
            console.log('  createdAt valid:', !isNaN(date.getTime()));
          }
        }
      } catch (error) {
        console.error('❌ Erro ao parsear JSON:', error.message);
        console.log('Raw data:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Erro na requisição:', error.message);
  });

  req.end();
}

testAPI();
