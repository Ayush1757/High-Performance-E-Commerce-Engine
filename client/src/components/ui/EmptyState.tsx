import React from 'react';
import { ShoppingBag, SearchSlash, AlertOctagon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  type: 'cart' | 'search' | 'error';
  title?: string;
  description?: string;
  actionText?: string;
  actionPath?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  description,
  actionText,
  actionPath,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'cart':
        return <ShoppingBag size={48} className="empty-icon text-muted" />;
      case 'search':
        return <SearchSlash size={48} className="empty-icon text-muted" />;
      case 'error':
        return <AlertOctagon size={48} className="empty-icon text-error" />;
    }
  };

  const getDefaults = () => {
    switch (type) {
      case 'cart':
        return {
          title: 'Your shopping cart is empty',
          description: "Looks like you haven't added any products to your cart yet.",
          actionText: 'Start Shopping',
          actionPath: '/products',
        };
      case 'search':
        return {
          title: 'No search results found',
          description: 'Try adjusting your search terms or filters to find what you are looking for.',
          actionText: 'View All Products',
          actionPath: '/products',
        };
      case 'error':
        return {
          title: 'Something went wrong',
          description: 'There was an issue retrieving the requested page. Please try again.',
          actionText: 'Go Home',
          actionPath: '/',
        };
    }
  };

  const defaults = getDefaults();
  const finalTitle = title || defaults.title;
  const finalDesc = description || defaults.description;
  const finalActionText = actionText || defaults.actionText;
  const finalActionPath = actionPath || defaults.actionPath;

  return (
    <div className="empty-state-container">
      <div className="empty-state-card">
        <div className="empty-icon-wrapper">{getIcon()}</div>
        <h3>{finalTitle}</h3>
        <p>{finalDesc}</p>
        {finalActionText && finalActionPath && (
          <Link to={finalActionPath} className="empty-state-action-btn">
            {finalActionText}
          </Link>
        )}
      </div>
    </div>
  );
};
