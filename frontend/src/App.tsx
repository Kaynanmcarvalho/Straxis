import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import { OfflineIndicator } from './components/offline/OfflineIndicator';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './styles/straxis-tokens.css';
import './styles/toast-mobile.css';
import CoreLayout from './layouts/CoreLayout';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import DashboardPageCore from './pages/DashboardPageCore';
import TestPage from './pages/TestPage';
import TrabalhosPageCore from './pages/TrabalhosPageCore';
import CentralExecucaoPage from './pages/CentralExecucaoPage';
import AgendamentosPageCore from './pages/AgendamentosPageCore';
import AgendaPage from './pages/AgendaPage';
import PlanejamentoPage from './pages/PlanejamentoPage';
import GestaoPessoasPage from './pages/GestaoPessoasPage';
import RelatoriosPageCore from './pages/RelatoriosPageCore';
import RelacionamentoReceitaPage from './pages/RelacionamentoReceitaPage';
import ClientesPremiumPage from './pages/ClientesPremiumPage';
import UsuariosPage from './pages/UsuariosPage';
import EmpresasPageCore from './pages/EmpresasPageCore';
import WhatsAppPageCore from './pages/WhatsAppPageCore';
import IAConfigPageCore from './pages/IAConfigPageCore';
import IAConfigPage from './pages/IAConfigPage';
import LogsPage from './pages/LogsPage';
import { CargosPage } from './pages/CargosPage';
import { ConfiguracaoFechamentoPage } from './pages/ConfiguracaoFechamentoPage';
import { FechamentoPage } from './pages/FechamentoPage';
import { HistoricoFechamentosPage } from './pages/HistoricoFechamentosPage';
import { LoadingProvider } from './contexts/LoadingContext';

function App() {
  return (
    <ErrorBoundary>
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
              <Route path="dashboard" element={<ErrorBoundary><DashboardPageCore /></ErrorBoundary>} />
              <Route path="test" element={<TestPage />} />
              <Route path="trabalhos" element={<ErrorBoundary><CentralExecucaoPage /></ErrorBoundary>} />
              <Route path="agendamentos" element={<ErrorBoundary><AgendamentosPageCore /></ErrorBoundary>} />
              <Route path="agenda" element={<AgendaPage />} />
              <Route path="funcionarios" element={<ErrorBoundary><GestaoPessoasPage /></ErrorBoundary>} />
              <Route path="relatorios" element={<ErrorBoundary><RelatoriosPageCore /></ErrorBoundary>} />
              <Route path="clientes" element={<ErrorBoundary><ClientesPremiumPage /></ErrorBoundary>} />
              <Route path="cargos" element={<CargosPage />} />
              <Route path="fechamento/config" element={<ConfiguracaoFechamentoPage />} />
              <Route path="fechamento/historico" element={<HistoricoFechamentosPage />} />
              <Route path="fechamento/:id" element={<FechamentoPage />} />
              <Route path="usuarios" element={<UsuariosPage />} />
              <Route path="empresas" element={<EmpresasPageCore />} />
              <Route path="whatsapp" element={<WhatsAppPageCore />} />
              <Route path="ia-config" element={<IAConfigPageCore />} />
              <Route path="ia-settings" element={<IAConfigPage />} />
              <Route path="logs" element={<LogsPage />} />
            </Route>
            
            {/* Rota 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </LoadingProvider>
      </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
