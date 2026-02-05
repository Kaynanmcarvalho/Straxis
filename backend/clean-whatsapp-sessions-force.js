const fs = require('fs');
const path = require('path');

const authDir = path.join(__dirname, 'whatsapp-auth');

console.log('🧹 Limpeza FORÇADA de todas as sessões WhatsApp\n');

if (fs.existsSync(authDir)) {
  const files = fs.readdirSync(authDir);
  
  console.log(`📂 Encontradas ${files.length} sessões`);
  
  files.forEach(file => {
    const filePath = path.join(authDir, file);
    
    if (fs.statSync(filePath).isDirectory()) {
      console.log(`🗑️  Removendo: ${file}`);
      fs.rmSync(filePath, { recursive: true, force: true });
    }
  });
  
  console.log('\n✅ Todas as sessões foram removidas!');
  console.log('💡 Agora você pode tentar conectar novamente.');
} else {
  console.log('❌ Diretório whatsapp-auth não existe');
}
