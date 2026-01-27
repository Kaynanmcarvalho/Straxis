import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export const Card: React.FC<CardProps> = ({
  children,
  hover = false,
  padding = 'md',
  className = '',
  ...props
}) => {
  const baseStyles = 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg';
  const hoverStyles = hover ? 'transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/20 hover:-translate-y-0.5' : '';
  const combinedClassName = `${baseStyles} ${hoverStyles} ${paddingStyles[padding]} ${className}`;
  
  return (
    <div className={combinedClassName} {...props}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`mb-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <h3 className={`text-xl font-bold text-gray-900 dark:text-white ${className}`} {...props}>
      {children}
    </h3>
  );
};

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <p className={`text-sm text-gray-600 dark:text-gray-400 ${className}`} {...props}>
      {children}
    </p>
  );
};

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50 ${className}`} {...props}>
      {children}
    </div>
  );
};
