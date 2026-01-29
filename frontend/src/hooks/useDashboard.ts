import { useEffect } from 'react';

/**
 * Hook para gerenciar o estado do Dashboard
 * Facilita mudanças futuras e centraliza a lógica
 */
export const useDashboard = () => {
  useEffect(() => {
    // Add classes to all possible elements
    document.documentElement.classList.add('dashboard-active');
    document.body.classList.add('dashboard-active');
    const root = document.getElementById('root');
    if (root) root.classList.add('dashboard-active');
    
    // Force background with inline styles as fallback
    const gradient = 'linear-gradient(180deg, #E8E8ED 0%, #F2F2F7 100%)';
    document.documentElement.style.background = gradient;
    document.body.style.background = gradient;
    if (root) root.style.background = gradient;
    
    // Override CSS variables that might be interfering
    document.documentElement.style.setProperty('--color-background', gradient);
    document.documentElement.style.setProperty('--color-surface', 'transparent');
    
    return () => {
      // Clean up
      document.documentElement.classList.remove('dashboard-active');
      document.body.classList.remove('dashboard-active');
      if (root) root.classList.remove('dashboard-active');
      
      // Reset to default white background
      document.documentElement.style.background = '#FFFFFF';
      document.body.style.background = '#FFFFFF';
      if (root) root.style.background = '#FFFFFF';
      
      // Reset CSS variables
      document.documentElement.style.setProperty('--color-background', '#f5f5f5');
      document.documentElement.style.setProperty('--color-surface', '#ffffff');
    };
  }, []);
};