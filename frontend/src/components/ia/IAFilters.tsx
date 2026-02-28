import React, { useState, useEffect } from 'react';
import { ShieldOff, Users, Phone, Plus, X, MessageSquareOff } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { iaService } from '../../services/ia.service';

/**
 * Gera variações de número BR (com/sem 9, com/sem formatação)
 */
function generateBRVariations(input: string): string[] {
  const clean = input.replace(/[^0-9]/g, '');
  if (!clean) return [];

  const variations = new Set<string>();
  let national = clean;
  if (national.startsWith('55') && national.length >= 12) {
    national = national.substring(2);
  }

  let ddd = '';
  let local = '';

  if (national.length === 10) {
    ddd = national.substring(0, 2);
    local = national.substring(2);
  } else if (national.length === 11) {
    ddd = national.substring(0, 2);
    local = national.substring(2);
  } else {
    return [clean];
  }

  const localSem9 = local.length === 9 && local.startsWith('9') ? local.substring(1) : local;
  const localCom9 = local.length === 8 ? '9' + local : local;

  variations.add(`${ddd}${localCom9}`);
  variations.add(`${ddd}${localSem9}`);

  return Array.from(variations);
}

/**
 * Normaliza número para formato de exibição
 */
function normalizeForDisplay(num: string): string {
  const clean = num.replace(/[^0-9]/g, '');
  if (clean.length === 11) {
    return `(${clean.substring(0, 2)}) ${clean.substring(2, 7)}-${clean.substring(7)}`;
  }
  if (clean.length === 10) {
    return `(${clean.substring(0, 2)}) ${clean.substring(2, 6)}-${clean.substring(6)}`;
  }
  return clean;
}

export const IAFilters: React.FC = () => {
  const [ignoreStatus, setIgnoreStatus] = useState(true);
  const [ignoreGroups, setIgnoreGroups] = useState(true);
  const [ignoredNumbers, setIgnoredNumbers] = useState<string[]>([]);
  const [newNumber, setNewNumber] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const config = await iaService.getConfig();
      setIgnoreStatus(config.ignoreStatus ?? true);
      setIgnoreGroups(config.ignoreGroups ?? true);
      setIgnoredNumbers(config.ignoredNumbers || []);
    } catch (error) {
      console.error('Erro ao carregar filtros:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveToggle = async (field: 'ignoreStatus' | 'ignoreGroups', value: boolean) => {
    try {
      setSaving(true);
      await iaService.updateConfig({ [field]: value });
    } catch (error) {
      console.error('Erro ao salvar filtro:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    const newVal = !ignoreStatus;
    setIgnoreStatus(newVal);
    await saveToggle('ignoreStatus', newVal);
  };

  const handleToggleGroups = async () => {
    const newVal = !ignoreGroups;
    setIgnoreGroups(newVal);
    await saveToggle('ignoreGroups', newVal);
  };

  const addNumber = async () => {
    const clean = newNumber.replace(/[^0-9]/g, '');
    if (!clean || clean.length < 10) return;

    // Gerar variações e pegar a versão normalizada (com 9, 11 dígitos)
    const variations = generateBRVariations(clean);
    const canonical = variations[0] || clean; // com 9

    // Verificar se já existe (comparar variações)
    const existingVariations = ignoredNumbers.flatMap(n => generateBRVariations(n));
    if (existingVariations.some(v => variations.includes(v))) {
      setNewNumber('');
      return; // Já existe
    }

    const updated = [...ignoredNumbers, canonical];
    setIgnoredNumbers(updated);
    setNewNumber('');

    try {
      setSaving(true);
      await iaService.updateConfig({ ignoredNumbers: updated });
    } catch (error) {
      console.error('Erro ao salvar número:', error);
      setIgnoredNumbers(ignoredNumbers); // Reverter
    } finally {
      setSaving(false);
    }
  };

  const removeNumber = async (numberToRemove: string) => {
    const updated = ignoredNumbers.filter(n => n !== numberToRemove);
    setIgnoredNumbers(updated);

    try {
      setSaving(true);
      await iaService.updateConfig({ ignoredNumbers: updated });
    } catch (error) {
      console.error('Erro ao remover número:', error);
      setIgnoredNumbers(ignoredNumbers); // Reverter
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addNumber();
    }
  };

  if (loading) return null;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-red-500/10 to-orange-500/10 dark:from-red-500/20 dark:to-orange-500/20 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl shadow-lg">
            <ShieldOff className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle>Filtros de Mensagens</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Controle quais mensagens a IA deve ignorar
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Ignorar Status */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <MessageSquareOff className={`w-5 h-5 ${ignoreStatus ? 'text-red-500' : 'text-gray-400'}`} />
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Ignorar Status</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Não responder atualizações de status
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={ignoreStatus}
              onChange={handleToggleStatus}
              disabled={saving}
              className="sr-only peer"
              aria-label="Ignorar status"
            />
            <div className="w-14 h-7 bg-gray-300 rounded-full peer dark:bg-gray-700 peer-checked:bg-red-500 transition-colors duration-300 after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all after:duration-300 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 dark:border-gray-600"></div>
          </label>
        </div>

        {/* Ignorar Grupos */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Users className={`w-5 h-5 ${ignoreGroups ? 'text-red-500' : 'text-gray-400'}`} />
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Ignorar Grupos</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Não responder mensagens de grupos
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={ignoreGroups}
              onChange={handleToggleGroups}
              disabled={saving}
              className="sr-only peer"
              aria-label="Ignorar grupos"
            />
            <div className="w-14 h-7 bg-gray-300 rounded-full peer dark:bg-gray-700 peer-checked:bg-red-500 transition-colors duration-300 after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all after:duration-300 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 dark:border-gray-600"></div>
          </label>
        </div>

        {/* Números Ignorados */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Números Ignorados</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            A IA não responderá mensagens destes números. Digite com DDD, variações são geradas automaticamente.
          </p>

          {/* Input para adicionar */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newNumber}
              onChange={(e) => setNewNumber(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ex: 62994510649"
              className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-gray-900 dark:text-white"
              aria-label="Número para ignorar"
            />
            <Button
              variant="primary"
              onClick={addNumber}
              disabled={saving || !newNumber.replace(/[^0-9]/g, '') || newNumber.replace(/[^0-9]/g, '').length < 10}
              className="bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 px-6"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Lista de números */}
          {ignoredNumbers.length > 0 ? (
            <div className="space-y-2">
              {ignoredNumbers.map((num) => {
                const variations = generateBRVariations(num);
                return (
                  <div
                    key={num}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {normalizeForDisplay(num)}
                        </p>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {variations.map((v) => (
                            <Badge key={v} variant="neutral" className="text-xs">
                              {v}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeNumber(num)}
                      disabled={saving}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      aria-label={`Remover número ${num}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              <Phone className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhum número ignorado</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
