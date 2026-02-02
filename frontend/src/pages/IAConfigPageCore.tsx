import React, { useState } from 'react';
import { Brain, Zap, DollarSign, Shield, Settings } from 'lucide-react';
import { CoreCard, CoreCardHeader, CoreCardTitle, CoreCardDescription } from '../components/core/CoreCard';
import { Dock } from '../components/core/Dock';
import './IAConfigPageCore.css';

const IAConfigPageCore: React.FC = () => {
  const [config, setConfig] = useState({
    enabled: true,
    provider: 'openai' as 'openai' | 'gemini',
    autoResponse: true,
    costLimit: 100,
    antiHallucination: true,
  });

  const [usage] = useState({
    requestsToday: 0,
    costToday: 0,
    requestsMonth: 0,
    costMonth: 0,
  });

  const toggleSetting = (key: keyof typeof config) => {
    setConfig(prev => ({
      ...prev,
      [key]: typeof prev[key] === 'boolean' ? !prev[key] : prev[key],
    }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <>
      <div className="page-container ia-config-container">
        {/* Header */}
        <header className="page-header">
          <div className="header-content">
            <h1 className="page-title">Inteligência Artificial</h1>
            <p className="page-subtitle">Configurações e uso</p>
          </div>
          <div className={`status-indicator ${config.enabled ? 'active' : 'inactive'}`}>
            <span className="status-dot" />
            <span className="status-text">{config.enabled ? 'Ativo' : 'Inativo'}</span>
          </div>
        </header>

        {/* Usage Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <Zap className="stat-icon" />
              <span className="stat-label">Hoje</span>
            </div>
            <div className="stat-values">
              <span className="stat-primary">{usage.requestsToday}</span>
              <span className="stat-secondary">requisições</span>
            </div>
            <div className="stat-cost">{formatCurrency(usage.costToday)}</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <DollarSign className="stat-icon" />
              <span className="stat-label">Mês</span>
            </div>
            <div className="stat-values">
              <span className="stat-primary">{usage.requestsMonth}</span>
              <span className="stat-secondary">requisições</span>
            </div>
            <div className="stat-cost">{formatCurrency(usage.costMonth)}</div>
          </div>
        </div>

        {/* Content */}
        <div className="page-content">
          {/* Main Control */}
          <CoreCard elevated>
            <div className="control-section">
              <div className="control-header">
                <div className="control-icon">
                  <Brain className="icon" />
                </div>
                <div className="control-info">
                  <h3 className="control-title">Sistema de IA</h3>
                  <p className="control-description">
                    {config.enabled ? 'Sistema ativo e processando' : 'Sistema desativado'}
                  </p>
                </div>
              </div>
              <button
                className={`toggle-switch ${config.enabled ? 'on' : 'off'}`}
                onClick={() => toggleSetting('enabled')}
                aria-label="Toggle IA"
              >
                <span className="toggle-thumb" />
              </button>
            </div>
          </CoreCard>

          {/* Provider Selection */}
          <CoreCard>
            <CoreCardHeader>
              <CoreCardTitle>Provedor de IA</CoreCardTitle>
              <CoreCardDescription>Escolha o modelo de linguagem</CoreCardDescription>
            </CoreCardHeader>

            <div className="provider-options">
              <button
                className={`provider-option ${config.provider === 'openai' ? 'selected' : ''}`}
                onClick={() => setConfig(prev => ({ ...prev, provider: 'openai' }))}
              >
                <div className="provider-content">
                  <span className="provider-name">OpenAI GPT-4</span>
                  <span className="provider-description">Mais preciso e confiável</span>
                </div>
                <div className="provider-check">
                  {config.provider === 'openai' && <div className="check-mark" />}
                </div>
              </button>

              <button
                className={`provider-option ${config.provider === 'gemini' ? 'selected' : ''}`}
                onClick={() => setConfig(prev => ({ ...prev, provider: 'gemini' }))}
              >
                <div className="provider-content">
                  <span className="provider-name">Google Gemini Pro</span>
                  <span className="provider-description">Mais rápido e econômico</span>
                </div>
                <div className="provider-check">
                  {config.provider === 'gemini' && <div className="check-mark" />}
                </div>
              </button>
            </div>
          </CoreCard>

          {/* Settings */}
          <CoreCard>
            <CoreCardHeader>
              <CoreCardTitle>Configurações</CoreCardTitle>
              <CoreCardDescription>Controles avançados do sistema</CoreCardDescription>
            </CoreCardHeader>

            <div className="settings-list">
              <div className="setting-item">
                <div className="setting-info">
                  <Settings className="setting-icon" />
                  <div className="setting-text">
                    <span className="setting-name">Resposta Automática</span>
                    <span className="setting-description">Responder mensagens automaticamente</span>
                  </div>
                </div>
                <button
                  className={`toggle-switch small ${config.autoResponse ? 'on' : 'off'}`}
                  onClick={() => toggleSetting('autoResponse')}
                >
                  <span className="toggle-thumb" />
                </button>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <Shield className="setting-icon" />
                  <div className="setting-text">
                    <span className="setting-name">Anti-Alucinação</span>
                    <span className="setting-description">Validação extra de respostas</span>
                  </div>
                </div>
                <button
                  className={`toggle-switch small ${config.antiHallucination ? 'on' : 'off'}`}
                  onClick={() => toggleSetting('antiHallucination')}
                >
                  <span className="toggle-thumb" />
                </button>
              </div>
            </div>
          </CoreCard>

          {/* Cost Limit */}
          <CoreCard>
            <CoreCardHeader>
              <CoreCardTitle>Limite de Custo</CoreCardTitle>
              <CoreCardDescription>Controle de gastos mensais</CoreCardDescription>
            </CoreCardHeader>

            <div className="cost-control">
              <div className="cost-display">
                <span className="cost-value">{formatCurrency(config.costLimit)}</span>
                <span className="cost-label">por mês</span>
              </div>
              <input
                type="range"
                min="50"
                max="500"
                step="50"
                value={config.costLimit}
                onChange={(e) => setConfig(prev => ({ ...prev, costLimit: Number(e.target.value) }))}
                className="cost-slider"
              />
              <div className="cost-marks">
                <span>R$ 50</span>
                <span>R$ 500</span>
              </div>
            </div>
          </CoreCard>
        </div>
      </div>

      <Dock />
    </>
  );
};

export default IAConfigPageCore;
