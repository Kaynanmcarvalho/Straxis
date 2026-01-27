export interface Theme {
  name: 'light' | 'dark';
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    warning: string;
    success: string;
    info: string;
  };
}

export const lightTheme: Theme = {
  name: 'light',
  colors: {
    primary: '#1976d2',
    secondary: '#dc004e',
    background: '#f5f5f5',
    surface: '#ffffff',
    text: '#000000',
    textSecondary: '#666666',
    border: '#e0e0e0',
    error: '#f44336',
    warning: '#ff9800',
    success: '#4caf50',
    info: '#2196f3'
  }
};

export const darkTheme: Theme = {
  name: 'dark',
  colors: {
    primary: '#90caf9',
    secondary: '#f48fb1',
    background: '#121212',
    surface: '#1e1e1e',
    text: '#ffffff',
    textSecondary: '#b0b0b0',
    border: '#333333',
    error: '#ef5350',
    warning: '#ffa726',
    success: '#66bb6a',
    info: '#42a5f5'
  }
};

export const breakpoints = {
  mobile: '320px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1440px'
};

export const mediaQueries = {
  mobile: `@media (min-width: ${breakpoints.mobile})`,
  tablet: `@media (min-width: ${breakpoints.tablet})`,
  desktop: `@media (min-width: ${breakpoints.desktop})`,
  wide: `@media (min-width: ${breakpoints.wide})`
};

// CSS Variables para uso global
export const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });
  
  root.setAttribute('data-theme', theme.name);
};
