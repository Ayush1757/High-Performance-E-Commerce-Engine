import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, SearchX, PackageX, AlertTriangle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  type?: 'cart' | 'search' | 'orders' | 'error';
  title?: string;
  description?: string;
  actionText?: string;
  actionPath?: string;
}

const configs = {
  cart: {
    icon: <ShoppingBag size={48} />,
    title: 'Your cart is empty',
    description: 'Looks like you haven\'t added anything to your cart yet. Start shopping to fill it up!',
    actionText: 'Start Shopping',
    actionPath: '/products',
    color: 'text-accent',
    bg: 'bg-accent-light',
  },
  search: {
    icon: <SearchX size={48} />,
    title: 'No products found',
    description: 'We couldn\'t find products matching your search. Try adjusting your filters or search terms.',
    actionText: 'Clear Filters',
    actionPath: '/products',
    color: 'text-warning',
    bg: 'bg-warning-light',
  },
  orders: {
    icon: <PackageX size={48} />,
    title: 'No orders yet',
    description: 'You haven\'t placed any orders yet. Explore our catalog and place your first order!',
    actionText: 'Browse Products',
    actionPath: '/products',
    color: 'text-secondary',
    bg: 'bg-bg-alt',
  },
  error: {
    icon: <AlertTriangle size={48} />,
    title: 'Something went wrong',
    description: 'An unexpected error occurred. Please try again later.',
    actionText: 'Go Home',
    actionPath: '/',
    color: 'text-danger',
    bg: 'bg-danger-light',
  },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'search',
  title,
  description,
  actionText,
  actionPath,
}) => {
  const config = configs[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      <div className={`w-24 h-24 rounded-2xl ${config.bg} ${config.color} flex items-center justify-center mb-6`}>
        {config.icon}
      </div>
      <h2 className="text-xl font-bold text-text mb-2">{title || config.title}</h2>
      <p className="text-sm text-text-secondary max-w-md mb-8">{description || config.description}</p>
      <Link to={actionPath || config.actionPath} className="btn btn-primary">
        {actionText || config.actionText} <ArrowRight size={16} />
      </Link>
    </motion.div>
  );
};

export default EmptyState;
