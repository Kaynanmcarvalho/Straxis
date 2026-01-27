import express from 'express';
import cors from 'cors';

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.CORS_ORIGIN
  ].filter(Boolean),
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
import empresaRoutes from './routes/empresa.routes';
import funcionarioRoutes from './routes/funcionario.routes';
import userRoutes from './routes/user.routes';
import logRoutes from './routes/log.routes';
import agendamentoRoutes from './routes/agendamento.routes';
import trabalhoRoutes from './routes/trabalho.routes';
import relatorioRoutes from './routes/relatorio.routes';
import whatsappRoutes from './routes/whatsapp.routes';
import iaRoutes from './routes/ia.routes';

app.use('/api/empresas', empresaRoutes);
app.use('/api/funcionarios', funcionarioRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/agendamentos', agendamentoRoutes);
app.use('/api/trabalhos', trabalhoRoutes);
app.use('/api/relatorios', relatorioRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/ia', iaRoutes);

export default app;
