import React from 'react';
import { LoadingAnimation } from './LoadingAnimation';
import './LoadingAnimation.css';

interface LoadingOverlayProps {
  message?: string;
  size?: number;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  message = 'Processando...', 
  size = 150 
}) => {
  return (
    <div className="loading-overlay">
      <LoadingAnimation size={size} message={message} />
    </div>
  );
};

export default LoadingOverlay;
