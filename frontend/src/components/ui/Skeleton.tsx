import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
}) => {
  const baseClasses = 'bg-neutral-200 dark:bg-neutral-700';
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };
  
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  };
  
  const style: React.CSSProperties = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1rem' : '100%'),
  };
  
  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
    />
  );
};

// Skeleton presets
export const SkeletonCard: React.FC = () => (
  <div className="p-6 bg-white dark:bg-neutral-800 rounded-lg shadow-md">
    <div className="flex items-center gap-3 mb-4">
      <Skeleton variant="circular" width={40} height={40} />
      <div className="flex-1">
        <Skeleton variant="text" width="60%" height={20} className="mb-2" />
        <Skeleton variant="text" width="40%" height={16} />
      </div>
    </div>
    <Skeleton variant="rectangular" height={100} className="mb-3" />
    <Skeleton variant="text" width="80%" height={16} className="mb-2" />
    <Skeleton variant="text" width="60%" height={16} />
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="space-y-4">
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="flex gap-4">
        <Skeleton variant="rectangular" className="flex-1" height={48} />
        <Skeleton variant="rectangular" className="flex-1" height={48} />
        <Skeleton variant="rectangular" className="flex-1" height={48} />
        <Skeleton variant="rectangular" width={100} height={48} />
      </div>
    ))}
  </div>
);

export const SkeletonList: React.FC<{ items?: number }> = ({ items = 5 }) => (
  <div className="space-y-3">
    {[...Array(items)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 bg-white dark:bg-neutral-800 rounded-lg">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1">
          <Skeleton variant="text" width="70%" height={20} className="mb-2" />
          <Skeleton variant="text" width="50%" height={16} />
        </div>
        <Skeleton variant="rectangular" width={80} height={32} />
      </div>
    ))}
  </div>
);

export const SkeletonDashboard: React.FC = () => (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex items-center justify-between">
      <Skeleton variant="text" width={200} height={32} />
      <Skeleton variant="rectangular" width={120} height={40} />
    </div>
    
    {/* Cards Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
    
    {/* Chart */}
    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-6">
      <Skeleton variant="text" width={150} height={24} className="mb-4" />
      <Skeleton variant="rectangular" height={300} />
    </div>
  </div>
);
