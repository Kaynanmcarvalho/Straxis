import React from 'react';
import Lottie from 'lottie-react';
import loadingAnimation from '../../assets/loading.json';
import './LoadingAnimation.css';

interface LoadingAnimationProps {
  size?: number;
  message?: string;
}

export const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ 
  size = 120, 
  message = 'Carregando...' 
}) => {
  return (
    <div className="loading-animation-container">
      <div className="loading-animation-wrapper" style={{ width: size, height: size }}>
        <Lottie 
          animationData={loadingAnimation} 
          loop={true}
          style={{ background: 'transparent' }}
        />
      </div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};

export default LoadingAnimation;
