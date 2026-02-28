import dotenv from 'dotenv';
import app from './app';
import { WhatsAppService } from './services/whatsapp.service';

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);

  // Restaurar sessões WhatsApp salvas após o servidor iniciar
  setTimeout(() => {
    WhatsAppService.restoreAllSessions().catch(err => {
      console.error('❌ Erro ao restaurar sessões WhatsApp:', err);
    });
  }, 3000); // Aguarda 3s pro Firebase estar pronto
});
