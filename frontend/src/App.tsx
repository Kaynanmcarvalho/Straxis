import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import { OfflineIndicator } from './components/offline/OfflineIndicator';
import './styles/straxis-tokens.css';
import './styles/toast-mobile.css';
import CoreLayout from './layouts/CoreLayout';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import DashboardPageCore from './pages/DashboardPageCore';
import TestPage from './pages/TestPage';
import TrabalhosPageCore from './pages/TrabalhosPageCore';
import AgendamentosPageCore from './pages/AgendamentosPageCore';
import FuncionariosPage from './pages/FuncionariosPage';
import RelatoriosPageCore from './pages/RelatoriosPageCore';
import ClientesPage from './pages/ClientesPage';
import UsuariosPage from './pages/UsuariosPage';
import EmpresasPageCore from './pages/EmpresasPageCore';
import WhatsAppPageCore from './pages/WhatsAppPageCore';
import IAConfigPageCore from './pages/IAConfigPageCore';
import LogsPage from './pages/LogsPage';
import { CargosPage } from './pages/CargosPage';
import { ConfiguracaoFechamentoPage } from './pages/ConfiguracaoFechamentoPage';
import { FechamentoPage } from './pages/FechamentoPage';
import { HistoricoFechamentosPage } from './pages/HistoricoFechamentosPage';
import { LoadingProvider } from './contexts/LoadingContext';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LoadingProvider>
          <ToastProvider />
          <OfflineIndicator />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
        <Routes>
          {/* Rotas públicas */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          
          {/* Rotas protegidas com CORE layout */}
          <Route path="/app" element={<CoreLayout />}>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPageCore />} />
            <Route path="test" element={<TestPage />} />
            <Route path="trabalhos" element={<TrabalhosPageCore />} />
            <Route path="agendamentos" element={<AgendamentosPageCore />} />
            <Route path="agenda" element={<AgendamentosPageCore />} />
            <Route path="funcionarios" element={<FuncionariosPage />} />
            <Route path="relatorios" element={<RelatoriosPageCore />} />
            <Route path="clientes" element={<ClientesPage />} />
            <Route path="cargos" element={<CargosPage />} />
            <Route path="fechamento/config" element={<ConfiguracaoFechamentoPage />} />
            <Route path="fechamento/historico" element={<HistoricoFechamentosPage />} />
            <Route path="fechamento/:id" element={<FechamentoPage />} />
            <Route path="usuarios" element={<UsuariosPage />} />
            <Route path="empresas" element={<EmpresasPageCore />} />
            <Route path="whatsapp" element={<WhatsAppPageCore />} />
            <Route path="ia-config" element={<IAConfigPageCore />} />
            <Route path="logs" element={<LogsPage />} />
          </Route>
          
          {/* Rota 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </LoadingProvider>
    </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
