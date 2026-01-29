/**
 * Configuração centralizada do Dashboard
 * Facilita mudanças de design futuras
 */

export const dashboardConfig = {
  // Cores principais
  colors: {
    background: 'linear-gradient(180deg, #E8E8ED 0%, #F2F2F7 100%)',
    text: '#1C1C1E',
    textSecondary: '#8E8E93',
    primary: '#007AFF',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    cardBackground: 'linear-gradient(135deg, #FFFFFF, #FAFAFA)',
  },
  
  // Tipografia
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
    sizes: {
      hero: '34px',
      title: '20px',
      body: '15px',
      caption: '13px',
      small: '11px',
    },
    weights: {
      light: 300,
      regular: 500,
      semibold: 600,
      bold: 700,
      heavy: 800,
      black: 900,
    }
  },
  
  // Espaçamentos
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  
  // Bordas e raios
  borderRadius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    full: '999px',
  },
  
  // Sombras
  shadows: {
    sm: '0 2px 6px rgba(0, 0, 0, 0.04)',
    md: '0 4px 12px rgba(0, 0, 0, 0.06)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.08)',
    xl: '0 12px 32px rgba(0, 0, 0, 0.12)',
  },
  
  // Animações
  animations: {
    duration: {
      fast: '0.15s',
      normal: '0.2s',
      slow: '0.3s',
    },
    easing: {
      ease: 'ease',
      easeInOut: 'ease-in-out',
      spring: 'cubic-bezier(0.16, 1, 0.3, 1)',
    }
  },
  
  // Layout
  layout: {
    padding: '20px 16px 80px',
    maxWidth: '1200px',
    gridGap: '16px',
  }
};

export type DashboardConfig = typeof dashboardConfig;