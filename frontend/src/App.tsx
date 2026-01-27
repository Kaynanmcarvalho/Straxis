import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './components/ui/Toast';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TrabalhosPage from './pages/TrabalhosPage';
import AgendamentosPage from './pages/AgendamentosPage';
import FuncionariosPage from './pages/FuncionariosPage';
import RelatoriosPage from './pages/RelatoriosPage';
import UsuariosPage from './pages/UsuariosPage';
import EmpresasPage from './pages/EmpresasPage';
import WhatsAppPage from './pages/WhatsAppPage';
import IAConfigPage from './pages/IAConfigPage';
import LogsPage from './pages/LogsPage';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider />
      <BrowserRouter>
        <Routes>
          {/* Rota pública */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Rotas protegidas com layout */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="trabalhos" element={<TrabalhosPage />} />
            <Route path="agendamentos" element={<AgendamentosPage />} />
            <Route path="funcionarios" element={<FuncionariosPage />} />
            <Route path="relatorios" element={<RelatoriosPage />} />
            <Route path="usuarios" element={<UsuariosPage />} />
            <Route path="empresas" element={<EmpresasPage />} />
            <Route path="whatsapp" element={<WhatsAppPage />} />
            <Route path="ia-config" element={<IAConfigPage />} />
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
