import React from 'react';
import { EmptyState } from '../components/ui/EmptyState';

export const NotFoundPage: React.FC = () => {
  return (
    <div style={{ padding: '80px 20px' }}>
      <EmptyState
        type="search"
        title="404 — Page Not Found"
        description="The resource or page you are trying to view does not exist on AuraStore."
        actionText="Back to Catalog"
        actionPath="/products"
      />
    </div>
  );
};
export default NotFoundPage;
