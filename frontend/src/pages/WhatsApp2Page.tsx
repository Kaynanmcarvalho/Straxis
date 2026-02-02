import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Brain,
  Clock,
  MessageSquare,
  Calendar,
  MapPin,
  DollarSign,
  UserPlus,
  Shield,
  Hand,
  Zap,
  Activity,
  Power
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { whatsappService } from '../services/whatsapp.service';
import { Dock } from '../components/core/Dock';
import { useToast } from '../hooks/useToast';
import './WhatsApp2Page.css';

interface ConnectionStatus {
  status: 'connected' | 'reconnecting' | 'disconnected';
  phoneNumber?: string;
  accountName?: string;
  lastSync: Date | null;
}

interface IAControls {
  autoAttend: boolean;
  autoSchedule: boolean;
  sendPrices: boolean;
  sendLocation: boolean;
  closeContracts: boolean;
  promiseOutsideCapacity: boolean;
}

interface ActivityStats {
  activeContacts: number;
  scheduledByIA: number;
  resolvedByIA: number;
  humanInterventions: number;
}

const WhatsApp2Page: React.FC = () => {
  const toast = useToast();
  
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    status: 'connected',
    phoneNumber: '+55 62 99451-0649',
    accountName: 'Straxis Logística',
    lastSync: new Date(),
  });
  
  const [iaControls, setIaControls] = useState<IAControls>({
    autoAttend: true,
    autoSchedule: true,
    sendPrices: true,
    sendLocation: true,
    closeContracts: false,
    promiseOutsideCapacity: false,
  });
  
  const [activityStats] = useState<ActivityStats>({
    activeContacts: 12,
    scheduledByIA: 8,
    resolvedByIA: 10,
    humanInterventions: 2,
  });
  
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [qrTimeout, setQrTimeout] = useState<number | null>(null);

  // Simular timeout do QR Code
  useEffect(() => {
    if (qrCode) {
      const timer = setTimeout(() => {
        setQrCode(null);
        setQrTimeout(null);
        toast.warning({
          title: 'QR Code Expirado',
          message: 'Gere um novo código para conectar',
        });
      }, 60000); // 60 segundos
      setQrTimeout(60);
      
      const countdown = setInterval(() => {
        setQrTimeout(prev => prev && prev > 0 ? prev - 1 : null);
      }, 1000);

      return () => {
        clearTimeout(timer);
        clearInterval(countdown);
      };
    }
  }, [qrCode, toast]);

  const handleConnect = async () => {
    try {
      setLoading(true);
      setQrCode('https://wa.me/qr/DEMO_QR_CODE_STRAXIS');
      setSessionId('demo-session-id');
    } catch (err) {
      console.error('Erro ao conectar:', err);
      toast.error({
        title: 'Erro',
        message: 'Erro ao gerar QR Code. Tente novamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!sessionId) return;

    try {
      setLoading(true);
      await whatsappService.disconnect(sessionId);
      setQrCode(null);
      setSessionId(null);
      setConnectionStatus({
        status: 'disconnected',
        lastSync: null,
      });
      setShowDisconnectConfirm(false);
      toast.success({
        title: 'Desconectado',
        message: 'WhatsApp desconectado com sucesso',
      });
    } catch (err) {
      console.error('Erro ao desconectar:', err);
      toast.error({
        title: 'Erro',
        message: 'Erro ao desconectar. Tente novamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleIAControl = (key: keyof IAControls) => {
    const newValue = !iaControls[key];
    setIaControls(prev => ({ ...prev, [key]: newValue }));
    
    const labels: Record<keyof IAControls, string> = {
      autoAttend: 'Atendimento automático',
      autoSchedule: 'Agendamento automático',
      sendPrices: 'Envio de valores',
      sendLocation: 'Envio de localização',
      closeContracts: 'Fechamento de contratos',
      promiseOutsideCapacity: 'Promessas fora da capacidade',
    };
    
    toast.success({
      title: newValue ? 'Ativado' : 'Desativado',
      message: labels[key],
    });
  };

  const handleAssumeConversation = () => {
    toast.info({
      title: 'Modo Manual Ativado',
      message: 'IA pausada. Você está no controle da conversa.',
    });
  };

  const isConnected = connectionStatus.status === 'connected';
  const isReconnecting = connectionStatus.status === 'reconnecting';
  const isDisconnected = connectionStatus.status === 'disconnected';

  // Calcular autonomia da IA (quantos controles estão ativos)
  const autonomiaAtiva = Object.values(iaControls).filter(Boolean).length;
  const autonomiaTotal = Object.keys(iaControls).length;
  const autonomiaPercentual = Math.round((autonomiaAtiva / autonomiaTotal) * 100);

  return (
    <>
      {/* QR CODE FULLSCREEN */}
      {qrCode && (
        <div className="qr-cockpit-overlay">
          <div className="qr-cockpit-container">
            <div className="qr-cockpit-header">
              <div className="qr-cockpit-title-group">
                <Smartphone className="icon" />
                <h2 className="qr-cockpit-title">Conectar WhatsApp</h2>
              </div>
              {qrTimeout && (
                <div className="qr-cockpit-timer">
                  <Clock className="icon" />
                  <span>{qrTimeout}s</span>
                </div>
              )}
            </div>
            
            <div className="qr-cockpit-code">
              <QRCodeSVG
                value={qrCode}
                size={240}
                level="H"
              />
            </div>

            <div className="qr-cockpit-steps">
              <div className="qr-step">
                <div className="step-number">1</div>
                <span>Abra o WhatsApp</span>
              </div>
              <div className="qr-step">
                <div className="step-number">2</div>
                <span>Toque em Aparelhos</span>
              </div>
              <div className="qr-step">
                <div className="step-number">3</div>
                <span>Escaneie o código</span>
              </div>
            </div>

            <button 
              className="qr-cockpit-cancel"
              onClick={() => setQrCode(null)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="whatsapp-cockpit">
        {/* STATUS BAR - NÍVEL SISTEMA */}
        <div className="cockpit-statusbar">
          <div className="statusbar-primary">
            <div className="statusbar-connection">
              <div className={`connection-indicator ${connectionStatus.status}`}>
                <div className="indicator-pulse" />
                <div className="indicator-core" />
              </div>
              <div className="connection-info">
                <span className="connection-state">
                  {isConnected && 'Operacional'}
                  {isReconnecting && 'Reconectando'}
                  {isDisconnected && 'Offline'}
                </span>
                {isConnected && connectionStatus.accountName && (
                  <span className="connection-account">{connectionStatus.accountName}</span>
                )}
              </div>
            </div>
            
            {isConnected && (
              <div className="statusbar-meta">
                {connectionStatus.phoneNumber && (
                  <div className="meta-item">
                    <Smartphone className="icon" />
                    <span>{connectionStatus.phoneNumber}</span>
                  </div>
                )}
                {connectionStatus.lastSync && (
                  <div className="meta-item">
                    <Activity className="icon" />
                    <span>
                      {new Date(connectionStatus.lastSync).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* CONTEÚDO PRINCIPAL */}
        <div className="cockpit-content">
          {/* ESTADO: DESCONECTADO */}
          {isDisconnected && !qrCode && (
            <div className="cockpit-offline-state">
              <div className="offline-visual">
                <div className="offline-icon-container">
                  <Power className="icon-main" />
                  <div className="icon-ring" />
                </div>
                <h2 className="offline-title">Sistema Offline</h2>
                <p className="offline-description">
                  Conecte o WhatsApp para ativar a secretária automática
                </p>
              </div>
              <button 
                className="cockpit-action-primary"
                onClick={handleConnect}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="action-spinner" />
                    <span>Gerando código...</span>
                  </>
                ) : (
                  <>
                    <Zap className="icon" />
                    <span>Ativar Sistema</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* ESTADO: CONECTADO */}
          {isConnected && (
            <>
              {/* INDICADORES OPERACIONAIS */}
              <div className="cockpit-section">
                <div className="section-header-minimal">
                  <Activity className="icon" />
                  <span>Visão Operacional</span>
                </div>
                <div className="operational-grid">
                  <div className="operational-indicator">
                    <div className="indicator-visual active">
                      <MessageSquare className="icon" />
                    </div>
                    <div className="indicator-data">
                      <span className="data-value">{activityStats.activeContacts}</span>
                      <span className="data-label">Ativos</span>
                    </div>
                  </div>

                  <div className="operational-indicator">
                    <div className="indicator-visual scheduled">
                      <Calendar className="icon" />
                    </div>
                    <div className="indicator-data">
                      <span className="data-value">{activityStats.scheduledByIA}</span>
                      <span className="data-label">Agendados</span>
                    </div>
                  </div>

                  <div className="operational-indicator">
                    <div className="indicator-visual resolved">
                      <CheckCircle2 className="icon" />
                    </div>
                    <div className="indicator-data">
                      <span className="data-value">{activityStats.resolvedByIA}</span>
                      <span className="data-label">Resolvidos</span>
                    </div>
                  </div>

                  <div className="operational-indicator">
                    <div className="indicator-visual manual">
                      <Hand className="icon" />
                    </div>
                    <div className="indicator-data">
                      <span className="data-value">{activityStats.humanInterventions}</span>
                      <span className="data-label">Manuais</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CONTROLE DA SECRETÁRIA */}
              <div className="cockpit-section">
                <div className="section-header">
                  <div className="header-title-group">
                    <Brain className="icon" />
                    <h3 className="section-title">Secretária Automática</h3>
                  </div>
                  <div className="header-autonomy">
                    <div className="autonomy-bar">
                      <div 
                        className="autonomy-fill" 
                        style={{ width: `${autonomiaPercentual}%` }}
                      />
                    </div>
                    <span className="autonomy-label">{autonomiaPercentual}%</span>
                  </div>
                </div>

                <div className="secretary-controls">
                  {/* Controles Permitidos */}
                  <div className="control-group">
                    <div className="control-group-label">
                      <Shield className="icon" />
                      <span>Ações Permitidas</span>
                    </div>
                    
                    <div className="control-item">
                      <div className="control-info">
                        <UserPlus className="icon" />
                        <div className="control-text">
                          <span className="control-title">Atender novos contatos</span>
                          <span className="control-description">Resposta automática inicial</span>
                        </div>
                      </div>
                      <button 
                        className={`control-toggle ${iaControls.autoAttend ? 'active' : ''}`}
                        onClick={() => toggleIAControl('autoAttend')}
                      >
                        <span className="toggle-track" />
                        <span className="toggle-thumb" />
                      </button>
                    </div>

                    <div className="control-item">
                      <div className="control-info">
                        <Calendar className="icon" />
                        <div className="control-text">
                          <span className="control-title">Agendar trabalhos</span>
                          <span className="control-description">Criar agendamentos via conversa</span>
                        </div>
                      </div>
                      <button 
                        className={`control-toggle ${iaControls.autoSchedule ? 'active' : ''}`}
                        onClick={() => toggleIAControl('autoSchedule')}
                      >
                        <span className="toggle-track" />
                        <span className="toggle-thumb" />
                      </button>
                    </div>

                    <div className="control-item">
                      <div className="control-info">
                        <DollarSign className="icon" />
                        <div className="control-text">
                          <span className="control-title">Responder valores</span>
                          <span className="control-description">Enviar tabela de preços padrão</span>
                        </div>
                      </div>
                      <button 
                        className={`control-toggle ${iaControls.sendPrices ? 'active' : ''}`}
                        onClick={() => toggleIAControl('sendPrices')}
                      >
                        <span className="toggle-track" />
                        <span className="toggle-thumb" />
                      </button>
                    </div>

                    <div className="control-item">
                      <div className="control-info">
                        <MapPin className="icon" />
                        <div className="control-text">
                          <span className="control-title">Enviar localização</span>
                          <span className="control-description">Compartilhar endereço da empresa</span>
                        </div>
                      </div>
                      <button 
                        className={`control-toggle ${iaControls.sendLocation ? 'active' : ''}`}
                        onClick={() => toggleIAControl('sendLocation')}
                      >
                        <span className="toggle-track" />
                        <span className="toggle-thumb" />
                      </button>
                    </div>
                  </div>

                  {/* Controles Bloqueados */}
                  <div className="control-group blocked">
                    <div className="control-group-label">
                      <AlertTriangle className="icon" />
                      <span>Ações Bloqueadas</span>
                    </div>
                    
                    <div className="control-item disabled">
                      <div className="control-info">
                        <XCircle className="icon" />
                        <div className="control-text">
                          <span className="control-title">Fechar contratos</span>
                          <span className="control-description">Requer aprovação humana</span>
                        </div>
                      </div>
                      <button 
                        className="control-toggle"
                        disabled
                      >
                        <span className="toggle-track" />
                        <span className="toggle-thumb" />
                      </button>
                    </div>

                    <div className="control-item disabled">
                      <div className="control-info">
                        <XCircle className="icon" />
                        <div className="control-text">
                          <span className="control-title">Prometer fora da capacidade</span>
                          <span className="control-description">Bloqueio de segurança operacional</span>
                        </div>
                      </div>
                      <button 
                        className="control-toggle"
                        disabled
                      >
                        <span className="toggle-track" />
                        <span className="toggle-thumb" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* AÇÕES DO SISTEMA */}
              <div className="cockpit-section">
                <button 
                  className="cockpit-action-danger"
                  onClick={() => setShowDisconnectConfirm(true)}
                >
                  <Power className="icon" />
                  <span>Desconectar Sistema</span>
                </button>

                {showDisconnectConfirm && (
                  <div className="cockpit-confirm">
                    <div className="confirm-content">
                      <AlertTriangle className="icon" />
                      <div className="confirm-text">
                        <span className="confirm-title">Desconectar WhatsApp?</span>
                        <span className="confirm-description">
                          A secretária automática parará de responder
                        </span>
                      </div>
                    </div>
                    <div className="confirm-actions">
                      <button 
                        className="confirm-cancel"
                        onClick={() => setShowDisconnectConfirm(false)}
                      >
                        Cancelar
                      </button>
                      <button 
                        className="confirm-proceed"
                        onClick={handleDisconnect}
                        disabled={loading}
                      >
                        {loading ? 'Desconectando...' : 'Desconectar'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* BOTÃO DE INTERVENÇÃO CRÍTICA */}
        {isConnected && (
          <button 
            className="cockpit-intervention"
            onClick={handleAssumeConversation}
          >
            <Hand className="icon" />
            <span>Assumir Conversa Agora</span>
          </button>
        )}
      </div>

      <Dock />
    </>
  );
};

export default WhatsApp2Page;
