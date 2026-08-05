import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  fullPage?: boolean;
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  fullPage = false,
  message = 'Loading AuraStore...',
}) => {
  if (fullPage) {
    return (
      <div className="full-page-loader">
        <div className="loader-card">
          <Loader2 className="spinner-icon text-accent animate-spin" size={48} />
          <p className="loader-message">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="inline-loader">
      <Loader2 className="spinner-icon text-accent animate-spin" size={24} />
      <span className="loader-message-inline">{message}</span>
    </div>
  );
};
