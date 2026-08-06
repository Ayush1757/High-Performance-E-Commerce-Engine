import React from 'react';
import { EmptyState } from '../components/ui/EmptyState';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="container-main py-16">
      <EmptyState
        type="error"
        title="404 — Page Not Found"
        description="The page you are looking for doesn't exist or has been moved."
        actionText="Back to Home"
        actionPath="/"
      />
    </div>
  );
};

export default NotFoundPage;
