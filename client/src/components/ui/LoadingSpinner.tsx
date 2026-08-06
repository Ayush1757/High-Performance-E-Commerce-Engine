import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  fullPage?: boolean;
  count?: number;
}

const SkeletonCard: React.FC = () => (
  <div className="skeleton-card">
    <div className="aspect-square skeleton" />
    <div className="p-4 space-y-3">
      <div className="h-3 w-16 skeleton rounded" />
      <div className="h-4 w-full skeleton rounded" />
      <div className="h-4 w-3/4 skeleton rounded" />
      <div className="flex items-center justify-between pt-2">
        <div className="h-5 w-20 skeleton rounded" />
        <div className="h-9 w-9 skeleton rounded-lg" />
      </div>
    </div>
  </div>
);

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message, fullPage = false, count = 8 }) => {
  const grid = (
    <div className="space-y-6">
      {message && <p className="text-sm text-text-muted text-center animate-pulse">{message}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );

  if (fullPage) {
    return (
      <div className="container-main py-12">
        {grid}
      </div>
    );
  }

  return grid;
};

export default LoadingSpinner;
