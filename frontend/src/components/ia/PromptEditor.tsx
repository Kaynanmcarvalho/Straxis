import React, { useState, useEffect } from 'react';
import { Code2, Save, Lightbulb, FileText } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { apiService } from '../../services/api.service';

interface PromptEditorProps {
  companyId?: string;
}

export const PromptEditor: React.FC<PromptEditorProps> = ({ companyId = 'default' }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    loadPrompt();
  }, [companyId]);

  useEffect(() => {
    setCharCount(prompt.length);
  }, [prompt]);

  const loadPrompt = async () => {
    try {
      const response = await apiService.get(`/empresas/${companyId}`) as any;
      setPrompt(response.config?.iaPrompt || '');
    } catch (error) {
      console.error('Error loading prompt:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
    try {
      await apiService.put('/ia/prompt', { iaPrompt: prompt });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving prompt:', error);
    } finally {
      setLoading(false);
    }
  };

  const tips = [
    { icon: '🎯', text: 'Seja específico sobre o tom e estilo de resposta' },
    { icon: '🚫', text: 'Defina limites do que a IA pode ou não fazer' },
    { icon: '💼', text: 'Inclua informações específicas do seu negócio' },
    { icon: '🔗', text: 'O prompt global do sistema será combinado com este' }
  ];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle>Editor de Prompt</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Personalize o comportamento do assistente de IA
              </p>
            </div>
          </div>
          {saved && (
            <Badge variant="success" className="animate-pulse">
              ✓ Salvo
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Prompt Editor */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <FileText className="w-4 h-4" />
              Prompt Personalizado
            </label>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {charCount} caracteres
            </span>
          </div>
          
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={12}
              placeholder="Exemplo: Você é um assistente especializado em operações de carga e descarga. Sempre seja educado, objetivo e profissional nas respostas. Priorize a segurança e eficiência nas operações..."
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 dark:text-white resize-none font-mono text-sm"
            />
            <div className="absolute bottom-3 right-3 opacity-50">
              <Code2 className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200/50 dark:border-amber-800/50">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Dicas para um bom prompt</h3>
          </div>
          <ul className="space-y-2">
            {tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                <span className="text-lg flex-shrink-0">{tip.icon}</span>
                <span>{tip.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Prompt
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
