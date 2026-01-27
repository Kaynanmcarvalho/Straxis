import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme, lightTheme, darkTheme, applyTheme } from '../styles/theme';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Carregar preferência salva
    const savedTheme = localStorage.getItem('straxis-theme');
    if (savedTheme === 'dark') {
      return darkTheme;
    }
    
    // Verificar preferência do sistema
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return darkTheme;
    }
    
    return lightTheme;
  });

  useEffect(() => {
    // Aplicar tema ao carregar
    applyTheme(theme);
    
    // Salvar preferência
    localStorage.setItem('straxis-theme', theme.name);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme.name === 'light' ? darkTheme : lightTheme);
  };

  const value: ThemeContextType = {
    theme,
    toggleTheme,
    isDark: theme.name === 'dark'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
