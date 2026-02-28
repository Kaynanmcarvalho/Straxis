import React, { useState, useEffect } from 'react';
import { Brain, Shield, Settings, Loader, ChevronDown, Server, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { CoreCard, CoreCardHeader, CoreCardTitle, CoreCardDescription } from '../components/core/CoreCard';
import { Dock } from '../components/core/Dock';
import { iaService, IAConfig, fetchLocalModels, checkLocalServerHealth } from '../services/ia.service';
import { useToast } from '../hooks/useToast';
import './IAConfigPageCore.css';

// Definição dos modelos disponíveis por provedor
const PROVIDER_MODELS: Record<string, { id: string; name: string; description: string; category: string }[]> = {
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
  local: [], // Será preenchido dinamicamente
};

const LOCAL_PROVIDERS = {
  lmstudio: {
    name: 'LM Studio',
    description: 'Servidor local LM Studio',
    defaultUrl: 'http://localhost:1234',
    icon: '🖥️',
  },
  ollama: {
    name: 'Ollama',
    description: 'Servidor local Ollama',
    defaultUrl: 'http://localhost:11434',
    icon: '🦙',
  },
  huggingface: {
    name: 'Hugging Face',
    description: 'Inference API gratuita',
    defaultUrl: 'https://api-inference.huggingface.co',
    icon: '🤗',
  },
};

const IAConfigPageCore: React.FC = () => {
  const [config, setConfig] = useState<IAConfig>({
    enabled: true,
    provider: 'openai',
    localProvider: 'lmstudio',
    localServerUrl: '',
    model: 'gpt-4.1-mini',
    autoResponse: true,
    costLimit: 100,
    antiHallucination: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [showLocalConfig, setShowLocalConfig] = useState(false);
  const [localModels, setLocalModels] = useState<any[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [serverHealthy, setServerHealthy] = useState<boolean | null>(null);
  const toast = useToast();

  // Carregar configurações e uso do Firebase
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [configData] = await Promise.all([
        iaService.getConfig(),
      ]);
      
      // Só atualizar se configData existir e tiver dados válidos
      if (configData && Object.keys(configData).length > 0) {
        setConfig(configData);
      }
      
      // Se o provider for local, carregar modelos automaticamente
      if (configData?.provider === 'local' && configData?.localProvider) {
        await loadLocalModels(configData.localProvider, configData.localServerUrl);
      }
    } catch (error) {
      console.error('Erro ao carregar dados IA:', error);
      toast.error({
        title: 'Erro',
        message: 'Erro ao carregar configurações de IA',
      });
      // Garantir estado padrão em caso de erro
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

  const updateProvider = async (provider: 'openai' | 'gemini' | 'openrouter' | 'kimi' | 'local') => {
    try {
      setSaving(true);
      
      if (provider === 'local') {
        // Abrir configuração de IA local
        setShowLocalConfig(true);
        setSaving(false);
        return;
      }
      
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

  const updateLocalProvider = async (localProvider: 'lmstudio' | 'ollama' | 'huggingface') => {
    try {
      setSaving(true);
      setConfig(prev => ({ ...prev, localProvider }));
      
      // Buscar modelos disponíveis
      await loadLocalModels(localProvider, config.localServerUrl);
      
      toast.success({
        title: 'Sucesso',
        message: `Provedor local alterado para ${LOCAL_PROVIDERS[localProvider].name}`,
      });
    } catch (error) {
      console.error('Erro ao atualizar provedor local:', error);
      toast.error({
        title: 'Erro',
        message: 'Erro ao atualizar provedor local',
      });
    } finally {
      setSaving(false);
    }
  };

  const loadLocalModels = async (localProvider: 'lmstudio' | 'ollama' | 'huggingface', serverUrl?: string) => {
    try {
      setLoadingModels(true);
      const models = await fetchLocalModels(localProvider, serverUrl);
      setLocalModels(models);
      PROVIDER_MODELS.local = models.map((m: any) => ({
        id: m.id || m.name,
        name: m.name || m.id,
        description: m.description || 'Modelo local',
        category: 'medium',
      }));
    } catch (error) {
      console.error('Erro ao carregar modelos locais:', error);
      setLocalModels([]);
    } finally {
      setLoadingModels(false);
    }
  };

  const checkServerHealth = async () => {
    if (!config.localProvider || config.localProvider === 'huggingface') {
      setServerHealthy(true);
      return;
    }
    
    try {
      const healthy = await checkLocalServerHealth(config.localProvider, config.localServerUrl);
      setServerHealthy(healthy);
      
      if (healthy) {
        toast.success({
          title: 'Servidor Online',
          message: `${LOCAL_PROVIDERS[config.localProvider].name} está respondendo`,
        });
        // Carregar modelos automaticamente
        await loadLocalModels(config.localProvider, config.localServerUrl);
      } else {
        toast.error({
          title: 'Servidor Offline',
          message: `Não foi possível conectar ao ${LOCAL_PROVIDERS[config.localProvider].name}`,
        });
      }
    } catch (error) {
      setServerHealthy(false);
      toast.error({
        title: 'Erro',
        message: 'Erro ao verificar servidor',
      });
    }
  };

  const saveLocalConfig = async () => {
    try {
      setSaving(true);
      
      if (!config.model) {
        toast.warning({
          title: 'Atenção',
          message: 'Selecione um modelo antes de salvar',
        });
        return;
      }
      
      await iaService.updateConfig({
        provider: 'local',
        localProvider: config.localProvider,
        localServerUrl: config.localServerUrl,
        model: config.model,
      });
      
      // Recarregar dados para atualizar a UI
      await loadData();
      
      setShowLocalConfig(false);
      toast.success({
        title: 'Sucesso',
        message: 'Configuração de IA local salva',
      });
    } catch (error) {
      console.error('Erro ao salvar config local:', error);
      toast.error({
        title: 'Erro',
        message: 'Erro ao salvar configuração',
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
      local: 'IA Local (Beta)',
    };
    return names[provider] || provider;
  };

  const getCurrentModel = () => {
    if (config?.provider === 'local') {
      // Usar localModels ao invés de PROVIDER_MODELS.local
      if (localModels.length > 0) {
        const found = localModels.find(m => (m.id || m.name) === config.model);
        if (found) {
          return {
            id: found.id || found.name,
            name: found.name || found.id,
            description: found.description || 'Modelo local',
            category: 'medium',
          };
        }
      }
      
      // Se não encontrou mas tem um modelo configurado, mostrar o nome do modelo
      if (config.model) {
        return {
          id: config.model,
          name: config.model,
          description: `${config.localProvider || 'Local'} - ${config.localServerUrl || 'servidor padrão'}`,
          category: 'medium',
        };
      }
      
      return { 
        id: '', 
        name: 'Nenhum modelo selecionado', 
        description: 'Configure o servidor local',
        category: 'medium',
      };
    }
    const models = PROVIDER_MODELS[config?.provider || 'openai'];
    return models.find(m => m.id === config?.model) || models[0];
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
          <div className={`status-indicator ${config?.enabled ? 'active' : 'inactive'}`}>
            <span className="status-dot" />
            <span className="status-text">{config?.enabled ? 'Ativo' : 'Inativo'}</span>
          </div>
        </header>

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
                    {config?.enabled ? 'Sistema ativo e processando' : 'Sistema desativado'}
                  </p>
                </div>
              </div>
              <button
                className={`toggle-switch ${config?.enabled ? 'on' : 'off'}`}
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
                className={`provider-option ${config?.provider === 'openai' ? 'selected' : ''}`}
                onClick={() => updateProvider('openai')}
                disabled={saving}
              >
                <div className="provider-content">
                  <span className="provider-name">OpenAI</span>
                  <span className="provider-description">GPT-4.1, Mini, Nano</span>
                </div>
                <div className="provider-check">
                  {config?.provider === 'openai' && <div className="check-mark" />}
                </div>
              </button>

              <button
                className={`provider-option ${config?.provider === 'gemini' ? 'selected' : ''}`}
                onClick={() => updateProvider('gemini')}
                disabled={saving}
              >
                <div className="provider-content">
                  <span className="provider-name">Google Gemini</span>
                  <span className="provider-description">3 Pro, 3 Flash, 2.5 Flash</span>
                </div>
                <div className="provider-check">
                  {config?.provider === 'gemini' && <div className="check-mark" />}
                </div>
              </button>

              <button
                className={`provider-option ${config?.provider === 'openrouter' ? 'selected' : ''}`}
                onClick={() => updateProvider('openrouter')}
                disabled={saving}
              >
                <div className="provider-content">
                  <span className="provider-name">OpenRouter</span>
                  <span className="provider-description">Acesso a múltiplos modelos</span>
                </div>
                <div className="provider-check">
                  {config?.provider === 'openrouter' && <div className="check-mark" />}
                </div>
              </button>

              <button
                className={`provider-option ${config?.provider === 'kimi' ? 'selected' : ''}`}
                onClick={() => updateProvider('kimi')}
                disabled={saving}
              >
                <div className="provider-content">
                  <span className="provider-name">Kimi (Moonshot AI)</span>
                  <span className="provider-description">K2.5, K2.5 Thinking, K2</span>
                </div>
                <div className="provider-check">
                  {config?.provider === 'kimi' && <div className="check-mark" />}
                </div>
              </button>

              <button
                className={`provider-option ${config?.provider === 'local' ? 'selected' : ''}`}
                onClick={() => updateProvider('local')}
                disabled={saving}
              >
                <div className="provider-content">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="provider-name">IA Local</span>
                    <span style={{ 
                      fontSize: '10px', 
                      padding: '2px 6px', 
                      background: 'rgba(59, 130, 246, 0.1)', 
                      color: 'var(--straxis-blue-600)',
                      borderRadius: '4px',
                      fontWeight: 600
                    }}>BETA v1</span>
                  </div>
                  <span className="provider-description">LM Studio, Ollama, Hugging Face</span>
                </div>
                <div className="provider-check">
                  {config?.provider === 'local' && <div className="check-mark" />}
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

            {showModelSelector && config?.provider && (
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
                  className={`toggle-switch small ${config?.autoResponse ? 'on' : 'off'}`}
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
                  className={`toggle-switch small ${config?.antiHallucination ? 'on' : 'off'}`}
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
                <span className="cost-value">{formatCurrency(config?.costLimit)}</span>
                <span className="cost-label">por mês</span>
              </div>
              <input
                type="range"
                min="1"
                max="500"
                step="1"
                value={config?.costLimit}
                onChange={(e) => updateCostLimit(Number(e.target.value))}
                disabled={saving}
                className="cost-slider"
              />
              <div className="cost-marks">
                <span>R$ 1</span>
                <span>R$ 500</span>
              </div>
            </div>
          </CoreCard>
        </div>
      </div>

      {/* Modal de Configuração de IA Local */}
      {showLocalConfig && (
        <div className="modal-overlay" onClick={() => setShowLocalConfig(false)}>
          <div className="modal-content local-ai-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                <Server style={{ width: '24px', height: '24px' }} />
                Configurar IA Local
                <span className="beta-badge">BETA v1</span>
              </h2>
              <button className="modal-close" onClick={() => setShowLocalConfig(false)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              {/* Seleção de Provedor Local */}
              <div className="form-section">
                <label className="form-label">Provedor Local</label>
                <div className="local-provider-options">
                  {Object.entries(LOCAL_PROVIDERS).map(([key, provider]) => (
                    <button
                      key={key}
                      className={`local-provider-option ${config.localProvider === key ? 'selected' : ''}`}
                      onClick={() => updateLocalProvider(key as any)}
                      disabled={saving}
                    >
                      <span className="provider-icon">{provider.icon}</span>
                      <div className="provider-info">
                        <span className="provider-name">{provider.name}</span>
                        <span className="provider-description">{provider.description}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* URL do Servidor (apenas para LM Studio e Ollama) */}
              {config.localProvider && config.localProvider !== 'huggingface' && (
                <div className="form-section">
                  <label className="form-label">URL do Servidor</label>
                  <div className="server-url-input">
                    <input
                      type="text"
                      value={config.localServerUrl || LOCAL_PROVIDERS[config.localProvider].defaultUrl}
                      onChange={(e) => setConfig(prev => ({ ...prev, localServerUrl: e.target.value }))}
                      placeholder={LOCAL_PROVIDERS[config.localProvider].defaultUrl}
                      className="form-input"
                    />
                    <button
                      className="check-health-button"
                      onClick={checkServerHealth}
                      disabled={loadingModels}
                    >
                      {loadingModels ? (
                        <Loader className="animate-spin" style={{ width: '16px', height: '16px' }} />
                      ) : (
                        <RefreshCw style={{ width: '16px', height: '16px' }} />
                      )}
                      Testar
                    </button>
                  </div>
                  {serverHealthy !== null && (
                    <div className={`server-status ${serverHealthy ? 'online' : 'offline'}`}>
                      {serverHealthy ? (
                        <>
                          <CheckCircle style={{ width: '16px', height: '16px' }} />
                          Servidor online
                        </>
                      ) : (
                        <>
                          <XCircle style={{ width: '16px', height: '16px' }} />
                          Servidor offline
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Lista de Modelos */}
              {localModels.length > 0 && (
                <div className="form-section">
                  <label className="form-label">Modelo Disponível</label>
                  <div className="local-models-list">
                    {localModels.map((model: any) => (
                      <button
                        key={model.id || model.name}
                        className={`local-model-option ${config.model === (model.id || model.name) ? 'selected' : ''}`}
                        onClick={() => setConfig(prev => ({ ...prev, model: model.id || model.name }))}
                      >
                        <span className="model-name">{model.name || model.id}</span>
                        {model.size && <span className="model-size">{model.size}</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {loadingModels && (
                <div className="loading-models">
                  <Loader className="animate-spin" style={{ width: '24px', height: '24px' }} />
                  <span>Carregando modelos...</span>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="button-secondary" onClick={() => setShowLocalConfig(false)}>
                Cancelar
              </button>
              <button 
                className="button-primary" 
                onClick={saveLocalConfig}
                disabled={saving || !config.model}
              >
                {saving ? 'Salvando...' : 'Salvar Configuração'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Dock />
    </>
  );
};

export default IAConfigPageCore;
