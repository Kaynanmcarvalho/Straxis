import React, { useState, useEffect } from 'react';
import { MessageSquare, Power, QrCode, CheckCircle2, XCircle, RefreshCw, Smartphone } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { whatsappService } from '../../services/whatsapp.service';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { CooldownAlert } from './CooldownAlert';

export const WhatsAppConfig: React.FC = () => {
  const [status, setStatus] = useState<{ connected: boolean; lastActivity: Date | null } | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inCooldown, setInCooldown] = useState(false);

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 10000); // Atualiza a cada 10s
    return () => clearInterval(interval);
  }, []);

  const loadStatus = async () => {
    try {
      const data = await whatsappService.getStatus();
      setStatus(data);
    } catch (err: any) {
      console.error('Erro ao carregar status:', err);
    }
  };

  const handleConnect = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await whatsappService.connect();
      setQrCode(data.qrCode);
      setSessionId(data.sessionId);
    } catch (err: any) {
      // Verificar se é erro de cooldown
      if (err.response?.status === 429 && err.response?.data?.code === 'WHATSAPP_COOLDOWN') {
        const cooldownData = err.response.data.data;
        setError(`Cooldown ativo: Aguarde ${cooldownData.remainingHours} horas antes de tentar novamente.`);
      } else {
        setError(err.response?.data?.message || err.message || 'Erro ao conectar');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!sessionId) return;

    try {
      setLoading(true);
      setError(null);
      await whatsappService.disconnect(sessionId);
      setQrCode(null);
      setSessionId(null);
      await loadStatus();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao desconectar');
    } finally {
      setLoading(false);
    }
  };

  const isConnected = status?.connected;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle>Conexão WhatsApp</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Gerencie a conexão com o WhatsApp Business
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={loadStatus}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Cooldown Alert */}
        <CooldownAlert onCooldownChange={setInCooldown} />

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900 dark:text-red-100">Erro</p>
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Status Section */}
        <div className={`p-6 rounded-xl border-2 transition-all ${
          isConnected
            ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-300 dark:border-green-700'
            : 'bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 border-gray-300 dark:border-gray-700'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Power className="w-5 h-5" />
              Status da Conexão
            </h3>
            {isConnected ? (
              <Badge variant="success" className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Conectado
              </Badge>
            ) : (
              <Badge variant="error" className="flex items-center gap-1">
                <XCircle className="w-3 h-3" />
                Desconectado
              </Badge>
            )}
          </div>

          {status?.lastActivity && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Última atividade: {new Date(status.lastActivity).toLocaleString('pt-BR')}
            </p>
          )}

          {!status && (
            <p className="text-sm text-gray-500 dark:text-gray-400">Carregando status...</p>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {!isConnected && !qrCode && (
            <Button
              variant="primary"
              onClick={handleConnect}
              disabled={loading || inCooldown}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              title={inCooldown ? 'Aguarde o cooldown terminar' : ''}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Conectando...
                </>
              ) : inCooldown ? (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Cooldown Ativo
                </>
              ) : (
                <>
                  <QrCode className="w-4 h-4 mr-2" />
                  Conectar WhatsApp
                </>
              )}
            </Button>
          )}

          {isConnected && sessionId && (
            <Button
              variant="primary"
              onClick={handleDisconnect}
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Desconectando...
                </>
              ) : (
                <>
                  <Power className="w-4 h-4 mr-2" />
                  Desconectar
                </>
              )}
            </Button>
          )}
        </div>

        {/* QR Code Section */}
        {qrCode && (
          <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-4">
              <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <h3 className="font-bold text-gray-900 dark:text-white">Escaneie o QR Code</h3>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-3 sm:p-6 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
              <div className="p-2 sm:p-4 bg-white rounded-lg shadow-inner max-w-full">
                <QRCodeSVG 
                  value={qrCode} 
                  size={Math.min(256, window.innerWidth - 120)}
                  level="H"
                  includeMargin={true}
                  className="w-full h-auto max-w-[256px]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Como conectar:</p>
              <ol className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 space-y-1 list-decimal list-inside pl-2">
                <li>Abra o WhatsApp no seu celular</li>
                <li>Toque em Menu ou Configurações</li>
                <li>Toque em Aparelhos conectados</li>
                <li>Toque em Conectar um aparelho</li>
                <li>Aponte seu celular para esta tela</li>
              </ol>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
