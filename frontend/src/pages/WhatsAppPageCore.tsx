import React, { useState, useEffect, useRef } from 'react';
import { Power, Smartphone, Clock, AlertCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { whatsappService } from '../services/whatsapp.service';
import { Dock } from '../components/core/Dock';
import { useToast } from '../hooks/useToast';

interface ConnectionStatus {
  status: 'connected' | 'reconnecting' | 'disconnected';
  phoneNumber?: string;
  accountName?: string;
  lastSync: Date | null;
}

const WhatsAppPageCore: React.FC = () => {
  const toast = useToast();
  
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    status: 'disconnected',
    phoneNumber: undefined,
    accountName: undefined,
    lastSync: null,
  });
  
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [qrTimeout, setQrTimeout] = useState<number | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [checkingBackend, setCheckingBackend] = useState(true);
  
  const qrTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const connectionCheckRef = useRef<NodeJS.Timeout | null>(null);

  // Verificar se backend está online
  useEffect(() => {
    const checkBackend = async () => {
      try {
        await whatsappService.checkHealth();
        setBackendOnline(true);
        setCheckingBackend(false);
      } catch (err) {
        setBackendOnline(false);
        setCheckingBackend(false);
      }
    };
    
    checkBackend();
    const interval = setInterval(checkBackend, 10000); // Verificar a cada 10s
    
    return () => clearInterval(interval);
  }, []);

  // Verificar status da conexão
  useEffect(() => {
    document.body.style.background = '#ffffff';
    
    const checkStatus = async () => {
      if (!backendOnline) return;
      
      try {
        const status = await whatsappService.getStatus();
        if (status.connected) {
          setConnectionStatus({
            status: 'connected',
            phoneNumber: undefined,
            accountName: undefined,
            lastSync: status.lastActivity ? new Date(status.lastActivity) : null,
          });
          // Limpar QR se conectado
          if (qrCode) {
            setQrCode(null);
            setSessionId(null);
          }
        }
      } catch (err) {
        console.error('Erro ao verificar status:', err);
      }
    };
    
    checkStatus();
    const interval = setInterval(checkStatus, 3000); // Verificar a cada 3s
    
    return () => {
      document.body.style.background = '';
      clearInterval(interval);
    };
  }, [backendOnline, qrCode]);

  // Gerenciar timer do QR Code (20 segundos - tempo real do WhatsApp)
  useEffect(() => {
    if (qrCode) {
      // Limpar timers anteriores
      if (qrTimerRef.current) clearTimeout(qrTimerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (connectionCheckRef.current) clearInterval(connectionCheckRef.current);
      
      // Timer de expiração (20 segundos)
      setQrTimeout(20);
      qrTimerRef.current = setTimeout(() => {
        setQrCode(null);
        setQrTimeout(null);
        toast.warning({
          title: 'Código expirado',
          message: 'O QR Code expira a cada 20 segundos. Gere um novo código.',
        });
      }, 20000);
      
      // Countdown visual
      countdownRef.current = setInterval(() => {
        setQrTimeout(prev => {
          if (prev && prev > 0) {
            return prev - 1;
          }
          return null;
        });
      }, 1000);
      
      // Verificar conexão a cada 2 segundos
      connectionCheckRef.current = setInterval(async () => {
        try {
          const status = await whatsappService.getStatus();
          if (status.connected) {
            // Limpar timers
            if (qrTimerRef.current) clearTimeout(qrTimerRef.current);
            if (countdownRef.current) clearInterval(countdownRef.current);
            if (connectionCheckRef.current) clearInterval(connectionCheckRef.current);
            
            setQrCode(null);
            setConnectionStatus({
              status: 'connected',
              phoneNumber: undefined,
              accountName: undefined,
              lastSync: new Date(),
            });
            toast.success({
              title: 'Sistema ativado',
              message: 'Secretária automática operacional',
            });
          }
        } catch (err) {
          console.error('Erro ao verificar conexão:', err);
        }
      }, 2000);

      return () => {
        if (qrTimerRef.current) clearTimeout(qrTimerRef.current);
        if (countdownRef.current) clearInterval(countdownRef.current);
        if (connectionCheckRef.current) clearInterval(connectionCheckRef.current);
      };
    }
  }, [qrCode, toast]);

  const handleConnect = async () => {
    if (!backendOnline) {
      toast.error({
        title: 'Backend offline',
        message: 'O servidor não está respondendo. Verifique se o backend está rodando.',
      });
      return;
    }

    try {
      setLoading(true);
      const response = await whatsappService.connect();
      
      // Se QR Code estiver vazio, significa que sessão foi recuperada
      if (!response.qrCode || response.qrCode === '') {
        toast.success({
          title: 'Sessão recuperada',
          message: 'Conectado automaticamente à sessão anterior',
        });
        // Forçar atualização do status
        const status = await whatsappService.getStatus();
        if (status.connected) {
          setConnectionStatus({
            status: 'connected',
            phoneNumber: undefined,
            accountName: undefined,
            lastSync: new Date(),
          });
        }
      } else {
        setQrCode(response.qrCode);
        setSessionId(response.sessionId);
        toast.info({
          title: 'QR Code gerado',
          message: 'Escaneie o código em 20 segundos',
        });
      }
    } catch (err: any) {
      console.error('Erro ao conectar:', err);
      
      let errorMessage = 'Erro ao gerar código. Tente novamente.';
      
      if (err.message?.includes('sessão ativa')) {
        errorMessage = 'Já existe uma sessão ativa. Recarregue a página.';
      } else if (err.message?.includes('515')) {
        errorMessage = 'Número bloqueado temporariamente. Aguarde 15-30 minutos e tente novamente.';
      } else if (err.message?.includes('timeout')) {
        errorMessage = 'Tempo esgotado. Verifique sua conexão e tente novamente.';
      } else if (err.message?.includes('Network')) {
        errorMessage = 'Erro de rede. Verifique se o backend está rodando.';
      }
      
      toast.error({
        title: 'Erro ao conectar',
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Limpar timers
    if (qrTimerRef.current) clearTimeout(qrTimerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (connectionCheckRef.current) clearInterval(connectionCheckRef.current);
    
    setQrCode(null);
    setQrTimeout(null);
  };

  const isDisconnected = connectionStatus.status === 'disconnected';

  if (checkingBackend) {
    return (
      <>
        <div style={{ 
          minHeight: '100vh', 
          background: '#ffffff', 
          paddingBottom: '100px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid #f0f0f0',
              borderTopColor: '#000',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite'
            }} />
            <p style={{
              fontSize: '14px',
              color: '#666',
              fontWeight: 500
            }}>
              Verificando backend...
            </p>
          </div>
        </div>
        <Dock />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </>
    );
  }

  if (!backendOnline) {
    return (
      <>
        <div style={{ 
          minHeight: '100vh', 
          background: '#ffffff', 
          paddingBottom: '100px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 24px',
            maxWidth: '400px',
            margin: '0 auto',
            textAlign: 'center'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 32px',
              borderRadius: '20px',
              background: '#fff5f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #ffe0e0'
            }}>
              <AlertCircle size={36} strokeWidth={1.5} color="#dc2626" />
            </div>
            
            <h1 style={{ 
              fontSize: '24px', 
              fontWeight: 500, 
              color: '#000', 
              marginBottom: '12px',
              letterSpacing: '-0.02em',
              margin: '0 0 12px 0'
            }}>
              Backend offline
            </h1>
            
            <p style={{ 
              fontSize: '16px', 
              color: '#666', 
              lineHeight: '1.5',
              marginBottom: '24px',
              fontWeight: 400,
              letterSpacing: '-0.01em',
              margin: '0 0 24px 0'
            }}>
              O servidor não está respondendo. Verifique se o backend está rodando na porta 3000.
            </p>

            <code style={{
              display: 'block',
              padding: '12px 16px',
              background: '#fafafa',
              border: '1px solid #f0f0f0',
              borderRadius: '8px',
              fontSize: '13px',
              fontFamily: 'monospace',
              color: '#666',
              marginBottom: '24px'
            }}>
              cd backend && npm run dev
            </code>

            <button 
              onClick={() => window.location.reload()}
              style={{
                height: '48px',
                padding: '0 24px',
                border: '2px solid #000',
                borderRadius: '12px',
                background: '#fff',
                color: '#000',
                fontSize: '15px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
                letterSpacing: '-0.01em'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#000';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#fff';
                e.currentTarget.style.color = '#000';
              }}
            >
              Tentar novamente
            </button>
          </div>
        </div>
        <Dock />
      </>
    );
  }

  return (
    <>
      {qrCode && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '24px',
          animation: 'fadeIn 0.3s ease',
          overflowY: 'auto',
          overflowX: 'hidden'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '400px',
            padding: '40px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            margin: '2rem auto',
            maxHeight: 'none'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: '32px' 
            }}>
              <h2 style={{ 
                fontSize: '20px', 
                fontWeight: 500, 
                color: '#000',
                letterSpacing: '-0.02em',
                margin: 0
              }}>
                Conectar WhatsApp
              </h2>
              {qrTimeout !== null && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  background: qrTimeout <= 5 ? '#fff5f5' : '#f5f5f5',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: qrTimeout <= 5 ? '#dc2626' : '#666',
                  animation: qrTimeout <= 5 ? 'pulse 1s ease-in-out infinite' : 'none'
                }}>
                  <Clock size={14} />
                  <span>{qrTimeout}s</span>
                </div>
              )}
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '32px',
              background: '#fafafa',
              borderRadius: '16px',
              marginBottom: '32px'
            }}>
              <QRCodeSVG value={qrCode} size={220} level="H" />
            </div>

            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: '12px',
              marginBottom: '32px',
              paddingLeft: '4px'
            }}>
              {[
                'Abra o WhatsApp',
                'Acesse Aparelhos conectados',
                'Escaneie o código'
              ].map((text, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    background: '#000',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 600,
                    flexShrink: 0
                  }}>
                    {i + 1}
                  </div>
                  <span style={{ 
                    fontSize: '15px', 
                    fontWeight: 400, 
                    color: '#666',
                    letterSpacing: '-0.01em'
                  }}>
                    {text}
                  </span>
                </div>
              ))}
            </div>

            <div style={{
              padding: '12px 16px',
              background: '#fffbeb',
              border: '1px solid #fef3c7',
              borderRadius: '12px',
              marginBottom: '24px'
            }}>
              <p style={{
                fontSize: '13px',
                color: '#92400e',
                margin: 0,
                lineHeight: '1.5'
              }}>
                ⚠️ O código expira em 20 segundos. Se expirar, clique em "Cancelar" e gere um novo código.
              </p>
            </div>

            <button 
              onClick={handleCancel}
              style={{
                width: '100%',
                height: '48px',
                border: 'none',
                borderRadius: '12px',
                background: '#f5f5f5',
                color: '#000',
                fontSize: '15px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
                letterSpacing: '-0.01em'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#e8e8e8'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#f5f5f5'}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div style={{ 
        minHeight: '100vh', 
        background: '#ffffff', 
        paddingBottom: '100px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }} className="whatsapp-cockpit-container">
        {isDisconnected && !qrCode && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 24px',
            maxWidth: '400px',
            margin: '0 auto',
            textAlign: 'center'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 32px',
              borderRadius: '20px',
              background: '#fafafa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #f0f0f0'
            }}>
              <Power size={36} strokeWidth={1.5} color="#999" />
            </div>
            
            <h1 style={{ 
              fontSize: '24px', 
              fontWeight: 500, 
              color: '#000', 
              marginBottom: '12px',
              letterSpacing: '-0.02em',
              margin: '0 0 12px 0'
            }}>
              Sistema desconectado
            </h1>
            
            <p style={{ 
              fontSize: '16px', 
              color: '#666', 
              lineHeight: '1.5',
              marginBottom: '40px',
              fontWeight: 400,
              letterSpacing: '-0.01em',
              margin: '0 0 40px 0'
            }}>
              Conecte o WhatsApp para ativar a secretária automática
            </p>

            <button 
              onClick={handleConnect}
              disabled={loading}
              style={{
                height: '56px',
                padding: '0 32px',
                border: 'none',
                borderRadius: '14px',
                background: '#000',
                color: '#fff',
                fontSize: '16px',
                fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                letterSpacing: '-0.01em'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                  }} />
                  <span>Gerando código...</span>
                </>
              ) : (
                <>
                  <Smartphone size={20} strokeWidth={2} />
                  <span>Ativar sistema</span>
                </>
              )}
            </button>
          </div>
        )}

        {connectionStatus.status === 'connected' && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 24px',
            maxWidth: '400px',
            margin: '0 auto',
            textAlign: 'center'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 32px',
              borderRadius: '20px',
              background: '#f0fdf4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #bbf7d0'
            }}>
              <Smartphone size={36} strokeWidth={1.5} color="#16a34a" />
            </div>
            
            <h1 style={{ 
              fontSize: '24px', 
              fontWeight: 500, 
              color: '#000', 
              marginBottom: '12px',
              letterSpacing: '-0.02em',
              margin: '0 0 12px 0'
            }}>
              Sistema ativo
            </h1>
            
            <p style={{ 
              fontSize: '16px', 
              color: '#666', 
              lineHeight: '1.5',
              fontWeight: 400,
              letterSpacing: '-0.01em',
              margin: 0
            }}>
              Secretária automática operacional
            </p>
          </div>
        )}
      </div>

      <Dock />
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </>
  );
};

export default WhatsAppPageCore;
