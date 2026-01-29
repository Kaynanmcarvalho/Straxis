import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './components/ui/Toast';
import './styles/straxis-tokens.css';
import CoreLayout from './layouts/CoreLayout';
import LoginPage from './pages/LoginPage';
import DashboardPageCore from './pages/DashboardPageCore';
import TestPage from './pages/TestPage';
import TrabalhosPageCore from './pages/TrabalhosPageCore';
import AgendamentosPageCore from './pages/AgendamentosPageCore';
import FuncionariosPage from './pages/FuncionariosPage';
import RelatoriosPage from './pages/RelatoriosPage';
import ClientesPage from './pages/ClientesPage';
import UsuariosPage from './pages/UsuariosPage';
import EmpresasPage from './pages/EmpresasPage';
import WhatsAppPageCore from './pages/WhatsAppPageCore';
import IAConfigPageCore from './pages/IAConfigPageCore';
import LogsPage from './pages/LogsPage';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider />
      <BrowserRouter>
        <Routes>
          {/* Rota pública */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Rotas protegidas com CORE layout */}
          <Route path="/" element={<CoreLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPageCore />} />
            <Route path="test" element={<TestPage />} />
            <Route path="trabalhos" element={<TrabalhosPageCore />} />
            <Route path="agendamentos" element={<AgendamentosPageCore />} />
            <Route path="funcionarios" element={<FuncionariosPage />} />
            <Route path="relatorios" element={<RelatoriosPage />} />
            <Route path="clientes" element={<ClientesPage />} />
            <Route path="usuarios" element={<UsuariosPage />} />
            <Route path="empresas" element={<EmpresasPage />} />
            <Route path="whatsapp" element={<WhatsAppPageCore />} />
            <Route path="ia-config" element={<IAConfigPageCore />} />
            <Route path="logs" element={<LogsPage />} />
          </Route>
          
          {/* Rota 404 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
