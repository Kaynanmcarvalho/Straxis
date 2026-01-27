import React, { useState, useEffect } from 'react';
import { Sparkles, Zap, DollarSign, Settings2, Save, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { apiService } from '../../services/api.service';

interface IAConfigProps {
  companyId?: string;
}

interface Config {
  iaEnabled: boolean;
  iaProvider: 'openai' | 'gemini';
  iaModel: string;
  iaCostLimitCentavos?: number;
}

export const IAConfig: React.FC<IAConfigProps> = ({ companyId }) => {
  // Usa o companyId do usuário logado se não for passado
  const userCompanyId = companyId || localStorage.getItem('companyId') || '';
  
  const [config, setConfig] = useState<Config>({
    iaEnabled: false,
    iaProvider: 'openai',
    iaModel: 'gpt-3.5-turbo',
    iaCostLimitCentavos: 0
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (userCompanyId) {
      loadConfig();
    }
  }, [userCompanyId]);

  const loadConfig = async () => {
    try {
      const response = await apiService.get(`/empresas/${userCompanyId}`) as any;
      if (response.config) {
        setConfig({
          iaEnabled: response.config.iaEnabled || false,
          iaProvider: response.config.iaProvider || 'openai',
          iaModel: response.config.iaModel || 'gpt-3.5-turbo',
          iaCostLimitCentavos: response.config.iaCostLimitCentavos || 0
        });
      }
    } catch (error) {
      console.error('Error loading IA config:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
    try {
      await apiService.put('/ia/config', config);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving IA config:', error);
    } finally {
      setLoading(false);
    }
  };

  const providerInfo = {
    openai: {
      name: 'OpenAI',
      icon: '🤖',
      color: 'from-emerald-500 to-teal-600',
      description: 'GPT-4 e GPT-3.5 - Líder em IA conversacional'
    },
    gemini: {
      name: 'Google Gemini',
      icon: '✨',
      color: 'from-blue-500 to-indigo-600',
      description: 'Gemini Pro - IA multimodal do Google'
    }
  };

  const modelPricing = {
    'gpt-3.5-turbo': { label: 'GPT-3.5 Turbo', price: 'Econômico', badge: 'success' },
    'gpt-4-turbo': { label: 'GPT-4 Turbo', price: 'Moderado', badge: 'warning' },
    'gpt-4': { label: 'GPT-4', price: 'Premium', badge: 'error' },
    'gemini-pro': { label: 'Gemini Pro', price: 'Econômico', badge: 'success' },
    'gemini-pro-vision': { label: 'Gemini Pro Vision', price: 'Econômico', badge: 'success' },
    'gemini-ultra': { label: 'Gemini Ultra', price: 'Premium', badge: 'error' }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle>Configuração de IA</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Configure o assistente inteligente para sua empresa
              </p>
            </div>
          </div>
          {saved && (
            <Badge variant="success" className="animate-pulse">
              ✓ Salvo com sucesso
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Toggle IA */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200/50 dark:border-purple-700/50">
          <div className="flex items-center gap-3">
            <Zap className={`w-5 h-5 ${config.iaEnabled ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400'}`} />
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Ativar Assistente de IA</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Habilite respostas automáticas inteligentes
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.iaEnabled}
              onChange={(e) => setConfig({ ...config, iaEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-600"></div>
          </label>
        </div>

        {config.iaEnabled && (
          <>
            {/* Provider Selection */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <Settings2 className="w-4 h-4" />
                Provedor de IA
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(['openai', 'gemini'] as const).map((provider) => (
                  <button
                    key={provider}
                    onClick={() => setConfig({ 
                      ...config, 
                      iaProvider: provider,
                      iaModel: provider === 'openai' ? 'gpt-3.5-turbo' : 'gemini-pro'
                    })}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                      config.iaProvider === provider
                        ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 shadow-lg'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{providerInfo[provider].icon}</span>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                          {providerInfo[provider].name}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {providerInfo[provider].description}
                        </p>
                      </div>
                      {config.iaProvider === provider && (
                        <div className="w-5 h-5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Model Selection */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <Sparkles className="w-4 h-4" />
                Modelo de IA
              </label>
              <select
                value={config.iaModel}
                onChange={(e) => setConfig({ ...config, iaModel: e.target.value })}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
              >
                {config.iaProvider === 'openai' ? (
                  <>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo - Econômico e Rápido</option>
                    <option value="gpt-4-turbo">GPT-4 Turbo - Balanceado</option>
                    <option value="gpt-4">GPT-4 - Máxima Qualidade</option>
                  </>
                ) : (
                  <>
                    <option value="gemini-pro">Gemini Pro - Econômico</option>
                    <option value="gemini-pro-vision">Gemini Pro Vision - Com Imagens</option>
                    <option value="gemini-ultra">Gemini Ultra - Premium</option>
                  </>
                )}
              </select>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={modelPricing[config.iaModel as keyof typeof modelPricing]?.badge as any}>
                  {modelPricing[config.iaModel as keyof typeof modelPricing]?.price}
                </Badge>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {modelPricing[config.iaModel as keyof typeof modelPricing]?.label}
                </span>
              </div>
            </div>

            {/* Cost Limit */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <DollarSign className="w-4 h-4" />
                Limite de Custo Mensal
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
                  R$
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={(config.iaCostLimitCentavos || 0) / 100}
                  onChange={(e) => setConfig({ 
                    ...config, 
                    iaCostLimitCentavos: Math.round(parseFloat(e.target.value || '0') * 100)
                  })}
                  placeholder="0.00"
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Deixe em 0 para sem limite. Quando o limite for atingido, a IA será desativada automaticamente.
                </p>
              </div>
            </div>
          </>
        )}

        {/* Save Button */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Configuração
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
