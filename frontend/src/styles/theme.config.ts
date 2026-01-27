/**
 * Theme Configuration - Straxis SaaS
 * Configuração completa do tema com suporte a dark mode
 */

import { colors, typography, spacing, shadows, borderRadius, transitions, zIndex } from './design-tokens';

export type ThemeMode = 'light' | 'dark';

export interface Theme {
  mode: ThemeMode;
  colors: typeof colors.light;
  typography: typeof typography;
  spacing: typeof spacing;
  shadows: typeof shadows;
  borderRadius: typeof borderRadius;
  transitions: typeof transitions;
  zIndex: typeof zIndex;
}

export const lightTheme: Theme = {
  mode: 'light',
  colors: colors.light,
  typography,
  spacing,
  shadows,
  borderRadius,
  transitions,
  zIndex,
};

export const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    ...colors.light,
    ...colors.dark,
    primary: { ...colors.light.primary, ...colors.dark.primary },
    success: { ...colors.light.success, ...colors.dark.success },
    error: { ...colors.light.error, ...colors.dark.error },
    warning: { ...colors.light.warning, ...colors.dark.warning },
    info: { ...colors.light.info, ...colors.dark.info },
    neutral: colors.dark.neutral,
    background: colors.dark.background,
    text: colors.dark.text,
  },
  typography,
  spacing,
  shadows,
  borderRadius,
  transitions,
  zIndex,
};

/**
 * Gera CSS variables para o tema
 */
export function generateCSSVariables(theme: Theme): string {
  const { colors } = theme;
  
  return `
    /* Primary Colors */
    --color-primary-50: ${colors.primary[50]};
    --color-primary-100: ${colors.primary[100]};
    --color-primary-200: ${colors.primary[200]};
    --color-primary-300: ${colors.primary[300]};
    --color-primary-400: ${colors.primary[400]};
    --color-primary-500: ${colors.primary[500]};
    --color-primary-600: ${colors.primary[600]};
    --color-primary-700: ${colors.primary[700]};
    --color-primary-800: ${colors.primary[800]};
    --color-primary-900: ${colors.primary[900]};
    
    /* Success Colors */
    --color-success-50: ${colors.success[50]};
    --color-success-100: ${colors.success[100]};
    --color-success-500: ${colors.success[500]};
    --color-success-700: ${colors.success[700]};
    --color-success-900: ${colors.success[900]};
    
    /* Error Colors */
    --color-error-50: ${colors.error[50]};
    --color-error-100: ${colors.error[100]};
    --color-error-500: ${colors.error[500]};
    --color-error-700: ${colors.error[700]};
    --color-error-900: ${colors.error[900]};
    
    /* Warning Colors */
    --color-warning-50: ${colors.warning[50]};
    --color-warning-100: ${colors.warning[100]};
    --color-warning-500: ${colors.warning[500]};
    --color-warning-700: ${colors.warning[700]};
    --color-warning-900: ${colors.warning[900]};
    
    /* Info Colors */
    --color-info-50: ${colors.info[50]};
    --color-info-100: ${colors.info[100]};
    --color-info-500: ${colors.info[500]};
    --color-info-700: ${colors.info[700]};
    --color-info-900: ${colors.info[900]};
    
    /* Neutral Colors */
    --color-neutral-50: ${colors.neutral[50]};
    --color-neutral-100: ${colors.neutral[100]};
    --color-neutral-200: ${colors.neutral[200]};
    --color-neutral-300: ${colors.neutral[300]};
    --color-neutral-400: ${colors.neutral[400]};
    --color-neutral-500: ${colors.neutral[500]};
    --color-neutral-600: ${colors.neutral[600]};
    --color-neutral-700: ${colors.neutral[700]};
    --color-neutral-800: ${colors.neutral[800]};
    --color-neutral-900: ${colors.neutral[900]};
    
    /* Background Colors */
    --color-background-default: ${colors.background.default};
    --color-background-paper: ${colors.background.paper};
    --color-background-elevated: ${colors.background.elevated};
    
    /* Text Colors */
    --color-text-primary: ${colors.text.primary};
    --color-text-secondary: ${colors.text.secondary};
    --color-text-disabled: ${colors.text.disabled};
    
    /* Shadows */
    --shadow-sm: ${shadows.sm};
    --shadow-base: ${shadows.base};
    --shadow-md: ${shadows.md};
    --shadow-lg: ${shadows.lg};
    --shadow-xl: ${shadows.xl};
    --shadow-2xl: ${shadows['2xl']};
    --shadow-inner: ${shadows.inner};
    
    /* Border Radius */
    --radius-sm: ${borderRadius.sm};
    --radius-base: ${borderRadius.base};
    --radius-md: ${borderRadius.md};
    --radius-lg: ${borderRadius.lg};
    --radius-xl: ${borderRadius.xl};
    --radius-2xl: ${borderRadius['2xl']};
    --radius-full: ${borderRadius.full};
    
    /* Transitions */
    --transition-fast: ${transitions.fast};
    --transition-base: ${transitions.base};
    --transition-slow: ${transitions.slow};
    --transition-slower: ${transitions.slower};
  `;
}

/**
 * Aplica CSS variables no documento
 */
export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  const cssVariables = generateCSSVariables(theme);
  
  // Remove style anterior se existir
  const existingStyle = document.getElementById('theme-variables');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  // Cria novo style element
  const style = document.createElement('style');
  style.id = 'theme-variables';
  style.innerHTML = `:root { ${cssVariables} }`;
  document.head.appendChild(style);
  
  // Adiciona classe de tema no body
  document.body.classList.remove('light', 'dark');
  document.body.classList.add(theme.mode);
}
