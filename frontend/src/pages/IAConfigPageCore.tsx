import React, { useState, useEffect } from 'react';
import { Brain, Zap, DollarSign, Shield, Settings, Loader, ChevronDown } from 'lucide-react';
import { CoreCard, CoreCardHeader, CoreCardTitle, CoreCardDescription } from '../components/core/CoreCard';
import { Dock } from '../components/core/Dock';
import { iaService, IAConfig, IAUsage } from '../services/ia.service';
import { useToast } from '../hooks/useToast';
import './IAConfigPageCore.css';

// Definição dos modelos disponíveis por provedor
const PROVIDER_MODELS = {
  openai: [
    { id: 'gpt-4.1', name: 'GPT-4.1', description: 'Mais avançado e preciso', category: 'expensive' },
    { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini', description: 'Balanceado custo/performance', category: 'medium' },
    { id: 'gpt-4.1-nano', name: 'GPT-4.1 Nano', description: 'Rápido e econômico', category: 'cheap' },
  ],
  gemini: [
    { id: 'gemini-3-pro', name: 'Gemini 3 Pro', description: 'Máxima capacidade', category: 'expensive' },
    { id: 'gemini-3-flash', name: 'Gemini 3 Flash', description: 'Balanceado e eficiente', category: 'medium' },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Ultra rápido e econômico', category: 'cheap' },
  ],
  openrouter: [
    { id: 'openai/gpt-4.1', name: 'GPT-4.1 (OpenRouter)', description: 'OpenAI via OpenRouter', category: 'expensive' },
    { id: 'anthropic/claude-opus-4.5', name: 'Claude Opus 4.5', description: 'Anthropic avançado', category: 'expensive' },
    { id: 'anthropic/claude-sonnet-4.5', name: 'Claude Sonnet 4.5', description: 'Anthropic balanceado', category: 'medium' },
    { id: 'google/gemini-3-pro', name: 'Gemini 3 Pro (OpenRouter)', description: 'Google via OpenRouter', category: 'expensive' },
    { id: 'meta-llama/llama-4-70b', name: 'Llama 4 70B', description: 'Meta Llama 4', category: 'medium' },
    { id: 'deepseek/deepseek-v3', name: 'DeepSeek V3', description: 'Econômico', category: 'cheap' },
  ],
  kimi: [
    { id: 'moonshot-k2.5', name: 'Kimi K2.5', description: 'Modelo flagship multimodal', category: 'expensive' },
    { id: 'moonshot-k2.5-thinking', name: 'Kimi K2.5 Thinking', description: 'Com raciocínio avançado', category: 'expensive' },
    { id: 'moonshot-k2', name: 'Kimi K2', description: 'Versão anterior estável', category: 'medium' },
    { id: 'moonshot-v1-128k', name: 'Kimi 128K', description: 'Contexto longo econômico', category: 'cheap' },
  ],
};

const IAConfigPageCore: React.FC = () => {
  const [config, setConfig] = useState<IAConfig>({
    enabled: true,
    provider: 'openai',
    model: 'gpt-4.1-mini',
    autoResponse: true,
    costLimit: 100,
    antiHallucination: true,
  });

  const [usage, setUsage] = useState<IAUsage>({
    requestsToday: 0,
    costToday: 0,
    requestsMonth: 0,
    costMonth: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const toast = useToast();

  // Carregar configurações e uso do Firebase
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [configData, usageData] = await Promise.all([
        iaService.getConfig(),
        iaService.getUsage(),
      ]);
      setConfig(configData);
      setUsage(usageData);
    } catch (error) {
      console.error('Erro ao carregar dados IA:', error);
      toast.error({
        title: 'Erro',
        message: 'Erro ao carregar configurações de IA',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSetting = async (key: keyof IAConfig) => {
    const newValue = typeof config[key] === 'boolean' ? !config[key] : config[key];
    
    try {
      setSaving(true);
      await iaService.updateConfig({ [key]: newValue });
      setConfig(prev => ({
        ...prev,
        [key]: newValue,
      }));
      toast.success({
        title: 'Sucesso',
        message: 'Configuração atualizada',
      });
    } catch (error) {
      console.error('Erro ao atualizar config:', error);
      toast.error({
        title: 'Erro',
        message: 'Erro ao atualizar configuração',
      });
    } finally {
      setSaving(false);
    }
  };

  const updateProvider = async (provider: 'openai' | 'gemini' | 'openrouter' | 'kimi') => {
    try {
      setSaving(true);
      // Selecionar modelo padrão do provedor
      const defaultModel = PROVIDER_MODELS[provider][1]?.id || PROVIDER_MODELS[provider][0]?.id;
      await iaService.updateConfig({ provider, model: defaultModel });
      setConfig(prev => ({ ...prev, provider, model: defaultModel }));
      toast.success({
        title: 'Sucesso',
        message: `Provedor alterado para ${getProviderName(provider)}`,
      });
    } catch (error) {
      console.error('Erro ao atualizar provedor:', error);
      toast.error({
        title: 'Erro',
        message: 'Erro ao atualizar provedor',
      });
    } finally {
      setSaving(false);
    }
  };

  const updateModel = async (model: string) => {
    try {
      setSaving(true);
      await iaService.updateConfig({ model });
      setConfig(prev => ({ ...prev, model }));
      setShowModelSelector(false);
      toast.success({
        title: 'Sucesso',
        message: 'Modelo atualizado',
      });
    } catch (error) {
      console.error('Erro ao atualizar modelo:', error);
      toast.error({
        title: 'Erro',
        message: 'Erro ao atualizar modelo',
      });
    } finally {
      setSaving(false);
    }
  };

  const updateCostLimit = async (costLimit: number) => {
    try {
      setSaving(true);
      await iaService.updateConfig({ costLimit });
      setConfig(prev => ({ ...prev, costLimit }));
    } catch (error) {
      console.error('Erro ao atualizar limite:', error);
      toast.error({
        title: 'Erro',
        message: 'Erro ao atualizar limite de custo',
      });
    } finally {
      setSaving(false);
    }
  };

  const getProviderName = (provider: string) => {
    const names: Record<string, string> = {
      openai: 'OpenAI',
      gemini: 'Google Gemini',
      openrouter: 'OpenRouter',
      kimi: 'Kimi (Moonshot AI)',
    };
    return names[provider] || provider;
  };

  const getCurrentModel = () => {
    const models = PROVIDER_MODELS[config.provider];
    return models.find(m => m.id === config.model) || models[0];
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading) {
    return (
      <>
        <div className="page-container ia-config-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <div style={{ textAlign: 'center' }}>
            <Loader className="animate-spin" style={{ width: '48px', height: '48px', color: '#007AFF', margin: '0 auto 16px' }} />
            <p style={{ color: '#666', fontSize: '14px' }}>Carregando configurações...</p>
          </div>
        </div>
        <Dock />
      </>
    );
  }

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
                disabled={saving}
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
              <CoreCardDescription>Escolha o provedor e modelo</CoreCardDescription>
            </CoreCardHeader>

            <div className="provider-options">
              <button
                className={`provider-option ${config.provider === 'openai' ? 'selected' : ''}`}
                onClick={() => updateProvider('openai')}
                disabled={saving}
              >
                <div className="provider-content">
                  <span className="provider-name">OpenAI</span>
                  <span className="provider-description">GPT-4.1, Mini, Nano</span>
                </div>
                <div className="provider-check">
                  {config.provider === 'openai' && <div className="check-mark" />}
                </div>
              </button>

              <button
                className={`provider-option ${config.provider === 'gemini' ? 'selected' : ''}`}
                onClick={() => updateProvider('gemini')}
                disabled={saving}
              >
                <div className="provider-content">
                  <span className="provider-name">Google Gemini</span>
                  <span className="provider-description">3 Pro, 3 Flash, 2.5 Flash</span>
                </div>
                <div className="provider-check">
                  {config.provider === 'gemini' && <div className="check-mark" />}
                </div>
              </button>

              <button
                className={`provider-option ${config.provider === 'openrouter' ? 'selected' : ''}`}
                onClick={() => updateProvider('openrouter')}
                disabled={saving}
              >
                <div className="provider-content">
                  <span className="provider-name">OpenRouter</span>
                  <span className="provider-description">Acesso a múltiplos modelos</span>
                </div>
                <div className="provider-check">
                  {config.provider === 'openrouter' && <div className="check-mark" />}
                </div>
              </button>

              <button
                className={`provider-option ${config.provider === 'kimi' ? 'selected' : ''}`}
                onClick={() => updateProvider('kimi')}
                disabled={saving}
              >
                <div className="provider-content">
                  <span className="provider-name">Kimi (Moonshot AI)</span>
                  <span className="provider-description">K2.5, K2.5 Thinking, K2</span>
                </div>
                <div className="provider-check">
                  {config.provider === 'kimi' && <div className="check-mark" />}
                </div>
              </button>
            </div>
          </CoreCard>

          {/* Model Selection */}
          <CoreCard>
            <CoreCardHeader>
              <CoreCardTitle>Modelo Selecionado</CoreCardTitle>
              <CoreCardDescription>Escolha o modelo específico</CoreCardDescription>
            </CoreCardHeader>

            <button
              className="model-selector-button"
              onClick={() => setShowModelSelector(!showModelSelector)}
              disabled={saving}
            >
              <div className="model-info">
                <span className="model-name">{getCurrentModel().name}</span>
                <span className="model-description">{getCurrentModel().description}</span>
              </div>
              <ChevronDown 
                className="chevron-icon" 
                style={{ 
                  transform: showModelSelector ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }} 
              />
            </button>

            {showModelSelector && (
              <div className="model-options">
                {PROVIDER_MODELS[config.provider].map((model) => (
                  <button
                    key={model.id}
                    className={`model-option ${config.model === model.id ? 'selected' : ''}`}
                    onClick={() => updateModel(model.id)}
                    disabled={saving}
                  >
                    <div className="model-option-content">
                      <span className="model-option-name">{model.name}</span>
                      <span className="model-option-description">{model.description}</span>
                    </div>
                    <div className="model-option-badge" data-category={model.category}>
                      {model.category === 'expensive' && '💎'}
                      {model.category === 'medium' && '⚡'}
                      {model.category === 'cheap' && '💰'}
                    </div>
                  </button>
                ))}
              </div>
            )}
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
                  disabled={saving}
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
                  disabled={saving}
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
                onChange={(e) => updateCostLimit(Number(e.target.value))}
                disabled={saving}
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
