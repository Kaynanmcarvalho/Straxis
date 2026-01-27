import React, { useState, useEffect } from 'react';

export const ConnectionStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowStatus(true);
      setTimeout(() => setShowStatus(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowStatus(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showStatus && isOnline) {
    return null;
  }

  return (
    <div className={`connection-status ${isOnline ? 'online' : 'offline'}`}>
      {isOnline ? (
        <>
          <span className="status-icon">✓</span>
          <span>Conexão restaurada</span>
        </>
      ) : (
        <>
          <span className="status-icon">⚠</span>
          <span>Você está offline - algumas funcionalidades podem estar limitadas</span>
        </>
      )}
    </div>
  );
};
