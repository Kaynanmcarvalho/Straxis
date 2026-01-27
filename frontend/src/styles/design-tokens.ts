/**
 * Design Tokens - Straxis SaaS
 * Tokens de design centralizados para cores, tipografia, espaçamento, etc.
 */

export const colors = {
  // Light Theme
  light: {
    // Primary - Azul profissional
    primary: {
      50: '#e3f2fd',
      100: '#bbdefb',
      200: '#90caf9',
      300: '#64b5f6',
      400: '#42a5f5',
      500: '#2196f3',
      600: '#1e88e5',
      700: '#1976d2',
      800: '#1565c0',
      900: '#0d47a1',
    },
    
    // Success - Verde
    success: {
      50: '#e8f5e9',
      100: '#c8e6c9',
      500: '#4caf50',
      700: '#388e3c',
      900: '#1b5e20',
    },
    
    // Error - Vermelho
    error: {
      50: '#ffebee',
      100: '#ffcdd2',
      500: '#f44336',
      700: '#d32f2f',
      900: '#b71c1c',
    },
    
    // Warning - Laranja
    warning: {
      50: '#fff3e0',
      100: '#ffe0b2',
      500: '#ff9800',
      700: '#f57c00',
      900: '#e65100',
    },
    
    // Info - Azul claro
    info: {
      50: '#e1f5fe',
      100: '#b3e5fc',
      500: '#03a9f4',
      700: '#0288d1',
      900: '#01579b',
    },
    
    // Neutral - Cinzas
    neutral: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
    
    // Background
    background: {
      default: '#fafafa',
      paper: '#ffffff',
      elevated: '#ffffff',
    },
    
    // Text
    text: {
      primary: '#212121',
      secondary: '#757575',
      disabled: '#bdbdbd',
    },
  },
  
  // Dark Theme
  dark: {
    primary: {
      500: '#90caf9',
    },
    
    success: {
      500: '#66bb6a',
    },
    
    error: {
      500: '#ef5350',
    },
    
    warning: {
      500: '#ffa726',
    },
    
    info: {
      500: '#42a5f5',
    },
    
    neutral: {
      50: '#1e1e1e',
      100: '#2d2d2d',
      200: '#3d3d3d',
      300: '#4d4d4d',
      400: '#6d6d6d',
      500: '#8d8d8d',
      600: '#adadad',
      700: '#cdcdcd',
      800: '#e0e0e0',
      900: '#f5f5f5',
    },
    
    background: {
      default: '#121212',
      paper: '#1e1e1e',
      elevated: '#2d2d2d',
    },
    
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
      disabled: '#6d6d6d',
    },
  },
};

export const typography = {
  fontFamily: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },
  
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
  },
  
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
};

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
};

export const borderRadius = {
  none: '0',
  sm: '0.25rem',   // 4px
  base: '0.5rem',  // 8px
  md: '0.75rem',   // 12px
  lg: '1rem',      // 16px
  xl: '1.5rem',    // 24px
  '2xl': '2rem',   // 32px
  full: '9999px',
};

export const breakpoints = {
  xs: '320px',   // Mobile small
  sm: '640px',   // Mobile large
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Desktop large
  '2xl': '1536px', // Desktop xlarge
};

export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  slower: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
};

export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
};
