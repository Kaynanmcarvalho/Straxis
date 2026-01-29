import React from 'react';

const TestPage: React.FC = () => {
  return (
    <div 
      style={{
        background: 'linear-gradient(180deg, #E8E8ED 0%, #F2F2F7 100%)',
        minHeight: '100vh',
        padding: '20px',
        color: '#1C1C1E'
      }}
    >
      <h1>TESTE DE BACKGROUND</h1>
      <p>Se você está vendo este gradiente, o CSS inline funciona.</p>
      <p>Se está vendo fundo branco, há algo sobrescrevendo o CSS.</p>
    </div>
  );
};

export default TestPage;