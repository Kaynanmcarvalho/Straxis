import React, { useEffect, useState } from 'react';
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';

interface CooldownAlertProps {
  onCooldownChange?: (inCooldown: boolean) => void;
}

interface CooldownStatus {
  inCooldown: boolean;
  remainingHours?: number;
  releaseDate?: string;
}

export const CooldownAlert: React.FC<CooldownAlertProps> = ({ onCooldownChange }) => {
  const [cooldownStatus, setCooldownStatus] = useState<CooldownStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const checkCooldown = async () => {
    try {
      const response = await fetch('/api/whatsapp/cooldown', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCooldownStatus(data.data);
        
        if (onCooldownChange) {
          onCooldownChange(data.data.inCooldown);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar cooldown:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkCooldown();
    
    // Verificar a cada 5 minutos
    const interval = setInterval(checkCooldown, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return null;
  }

  if (!cooldownStatus?.inCooldown) {
    return (
      <div className="cooldown-alert success">
        <CheckCircle className="icon" />
        <div className="content">
          <h3>WhatsApp Disponível</h3>
          <p>Você pode conectar ao WhatsApp normalmente.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cooldown-alert error">
      <AlertTriangle className="icon" />
      <div className="content">
        <h3>🚨 Cooldown Ativo - Erro 515</h3>
        <p className="main-message">
          Seu número está temporariamente bloqueado pelo WhatsApp.
        </p>
        
        <div className="cooldown-info">
          <Clock className="clock-icon" />
          <div>
            <strong>Tempo restante:</strong> {cooldownStatus.remainingHours} horas
            <br />
            <strong>Liberação:</strong> {cooldownStatus.releaseDate}
          </div>
        </div>

        <div className="actions-required">
          <h4>📋 O que fazer enquanto aguarda:</h4>
          <ol>
            <li>
              <strong>Desconecte TODOS os dispositivos</strong>
              <br />
              <small>WhatsApp → Configurações → Aparelhos conectados</small>
            </li>
            <li>
              <strong>Use WhatsApp normalmente no celular</strong>
              <br />
              <small>Envie/receba 5-10 mensagens por dia</small>
            </li>
            <li>
              <strong>NÃO tente conectar novamente</strong>
              <br />
              <small>Cada tentativa piora a situação</small>
            </li>
          </ol>
        </div>

        <div className="warning-box">
          <AlertTriangle className="warning-icon" />
          <p>
            <strong>IMPORTANTE:</strong> O cooldown é aplicado automaticamente após erro 515.
            Aguarde o tempo completo para evitar bloqueio permanente.
          </p>
        </div>
      </div>

      <style>{`
        .cooldown-alert {
          display: flex;
          gap: 1rem;
          padding: 1.5rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .cooldown-alert.error {
          background: linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%);
          border: 2px solid #ff4444;
          box-shadow: 0 4px 12px rgba(255, 68, 68, 0.15);
        }

        .cooldown-alert.success {
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          border: 2px solid #22c55e;
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.15);
        }

        .cooldown-alert .icon {
          flex-shrink: 0;
          width: 32px;
          height: 32px;
          margin-top: 0.25rem;
        }

        .cooldown-alert.error .icon {
          color: #ff4444;
        }

        .cooldown-alert.success .icon {
          color: #22c55e;
        }

        .cooldown-alert .content {
          flex: 1;
        }

        .cooldown-alert h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
        }

        .cooldown-alert .main-message {
          margin: 0 0 1rem 0;
          font-size: 1rem;
          color: #4b5563;
        }

        .cooldown-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: white;
          border-radius: 8px;
          margin-bottom: 1rem;
          border: 1px solid #fecaca;
        }

        .cooldown-info .clock-icon {
          width: 24px;
          height: 24px;
          color: #ff4444;
          flex-shrink: 0;
        }

        .cooldown-info strong {
          color: #1f2937;
        }

        .actions-required {
          background: white;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          border: 1px solid #fecaca;
        }

        .actions-required h4 {
          margin: 0 0 0.75rem 0;
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
        }

        .actions-required ol {
          margin: 0;
          padding-left: 1.5rem;
        }

        .actions-required li {
          margin-bottom: 0.75rem;
          color: #4b5563;
        }

        .actions-required li:last-child {
          margin-bottom: 0;
        }

        .actions-required strong {
          color: #1f2937;
          display: block;
          margin-bottom: 0.25rem;
        }

        .actions-required small {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .warning-box {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 1rem;
          background: #fef2f2;
          border-radius: 8px;
          border: 1px solid #fca5a5;
        }

        .warning-box .warning-icon {
          width: 20px;
          height: 20px;
          color: #dc2626;
          flex-shrink: 0;
          margin-top: 0.125rem;
        }

        .warning-box p {
          margin: 0;
          font-size: 0.875rem;
          color: #991b1b;
          line-height: 1.5;
        }

        .warning-box strong {
          color: #7f1d1d;
        }

        @media (max-width: 768px) {
          .cooldown-alert {
            flex-direction: column;
            padding: 1rem;
          }

          .cooldown-alert .icon {
            width: 28px;
            height: 28px;
          }

          .cooldown-alert h3 {
            font-size: 1.125rem;
          }

          .cooldown-info {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};
