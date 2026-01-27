import React from 'react';
import { LucideIcon } from 'lucide-react';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface IconProps {
  icon: LucideIcon;
  size?: IconSize;
  className?: string;
}

const sizeMap: Record<IconSize, string> = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
};

/**
 * IconWrapper - Componente para renderizar ícones com tamanhos consistentes
 */
export const Icon: React.FC<IconProps> = ({
  icon: IconComponent,
  size = 'md',
  className = '',
}) => {
  return <IconComponent className={`${sizeMap[size]} ${className}`} />;
};

/**
 * IconButton - Botão com ícone
 */
export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  size?: IconSize;
  variant?: 'default' | 'ghost' | 'danger';
  label?: string;
}

const variantStyles = {
  default: 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700',
  ghost: 'hover:bg-neutral-100 dark:hover:bg-neutral-800',
  danger: 'text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20',
};

export const IconButton: React.FC<IconButtonProps> = ({
  icon: IconComponent,
  size = 'md',
  variant = 'default',
  label,
  className = '',
  ...props
}) => {
  return (
    <button
      className={`
        inline-flex items-center justify-center
        p-2 rounded-md
        text-text-primary
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${className}
      `}
      aria-label={label}
      {...props}
    >
      <IconComponent className={sizeMap[size]} />
    </button>
  );
};
