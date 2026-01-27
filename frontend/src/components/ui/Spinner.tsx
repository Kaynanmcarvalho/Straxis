import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'white' | 'neutral';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colorClasses = {
    primary: 'text-primary-500',
    white: 'text-white',
    neutral: 'text-neutral-500',
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear',
      }}
      className={`${sizeClasses[size]} ${colorClasses[color]} ${className}`}
    >
      <Loader2 className="w-full h-full" />
    </motion.div>
  );
};

// Dots spinner
interface DotsSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'neutral';
}

export const DotsSpinner: React.FC<DotsSpinnerProps> = ({
  size = 'md',
  color = 'primary',
}) => {
  const sizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  };

  const colorClasses = {
    primary: 'bg-primary-500',
    white: 'bg-white',
    neutral: 'bg-neutral-500',
  };

  const dotVariants = {
    initial: { y: 0 },
    animate: { y: -10 },
  };

  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full`}
          variants={dotVariants}
          initial="initial"
          animate="animate"
          transition={{
            duration: 0.6,
            repeat: Infinity,
            repeatType: 'reverse',
            delay: index * 0.15,
          }}
        />
      ))}
    </div>
  );
};

// Pulse spinner
interface PulseSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'neutral';
}

export const PulseSpinner: React.FC<PulseSpinnerProps> = ({
  size = 'md',
  color = 'primary',
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const colorClasses = {
    primary: 'bg-primary-500',
    white: 'bg-white',
    neutral: 'bg-neutral-500',
  };

  return (
    <div className={`relative ${sizeClasses[size]}`}>
      <motion.div
        className={`absolute inset-0 ${colorClasses[color]} rounded-full opacity-75`}
        animate={{
          scale: [1, 1.5],
          opacity: [0.75, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeOut',
        }}
      />
      <motion.div
        className={`absolute inset-0 ${colorClasses[color]} rounded-full opacity-75`}
        animate={{
          scale: [1, 1.5],
          opacity: [0.75, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeOut',
          delay: 0.75,
        }}
      />
      <div className={`absolute inset-0 ${colorClasses[color]} rounded-full`} />
    </div>
  );
};

// Bar spinner
interface BarSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'neutral';
}

export const BarSpinner: React.FC<BarSpinnerProps> = ({
  size = 'md',
  color = 'primary',
}) => {
  const sizeClasses = {
    sm: { width: 'w-1', height: 'h-4' },
    md: { width: 'w-1.5', height: 'h-6' },
    lg: { width: 'w-2', height: 'h-8' },
  };

  const colorClasses = {
    primary: 'bg-primary-500',
    white: 'bg-white',
    neutral: 'bg-neutral-500',
  };

  const barVariants = {
    initial: { scaleY: 0.5 },
    animate: { scaleY: 1 },
  };

  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2, 3, 4].map((index) => (
        <motion.div
          key={index}
          className={`${sizeClasses[size].width} ${sizeClasses[size].height} ${colorClasses[color]} rounded-full`}
          variants={barVariants}
          initial="initial"
          animate="animate"
          transition={{
            duration: 0.6,
            repeat: Infinity,
            repeatType: 'reverse',
            delay: index * 0.1,
          }}
        />
      ))}
    </div>
  );
};
