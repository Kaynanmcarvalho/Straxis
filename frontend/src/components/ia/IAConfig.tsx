import React, { useState, useEffect } from 'react';
import { Sparkles, Zap } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { apiService } from '../../services/api.service';

interface IAConfigProps {
  companyId?: string;
}

export const IAConfig: React.FC<IAConfigProps> = ({ companyId }) => {
  const userCompanyId = companyId || localStorage.getItem('companyId') || '';
  
  const [iaEnabled, setIaEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userCompanyId) {
      loadConfig();
    } else {
      setLoading(false);
    }
  }, [userCompanyId]);

  const loadConfig = async () => {
    try {
      const response = await apiService.get(`/empresas/${userCompanyId}`) as any;
      if (response.config) {
        setIaEnabled(response.config.iaEnabled || false);
      }
    } catch (error) {
      console.error('Error loading IA config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    const newValue = !iaEnabled;
    setIaEnabled(newValue);
    try {
      setSaving(true);
      await apiService.put('/ia/config', { enabled: newValue });
    } catch (error) {
      console.error('Error saving IA config:', error);
      setIaEnabled(!newValue); // Reverter
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle>Assistente de IA</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Ative ou desative o assistente inteligente
              </p>
            </div>
          </div>
          <Badge variant={iaEnabled ? 'success' : 'neutral'}>
            {iaEnabled ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200/50 dark:border-purple-700/50">
          <div className="flex items-center gap-3">
            <Zap className={`w-5 h-5 ${iaEnabled ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400'}`} />
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
              checked={iaEnabled}
              onChange={handleToggle}
              disabled={saving}
              className="sr-only peer"
              aria-label="Ativar assistente de IA"
            />
            <div className="w-14 h-7 bg-gray-300 rounded-full peer dark:bg-gray-700 peer-checked:bg-purple-500 transition-colors duration-300 after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all after:duration-300 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 dark:border-gray-600"></div>
          </label>
        </div>
      </CardContent>
    </Card>
  );
};
