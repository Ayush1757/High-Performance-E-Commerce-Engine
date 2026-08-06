import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { Order } from '../types';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { ShoppingBag, Calendar, CheckCircle, Clock, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export const OrdersPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders/my');
        if (res.data.success) {
          setOrders(res.data.data.orders);
        }
      } catch {
        toast.error('Failed to retrieve order history');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  if (!user) return <Navigate to="/login" replace />;
  if (loading) return <LoadingSpinner fullPage count={3} message="Retrieving your orders..." />;
  if (orders.length === 0) {
    return (
      <EmptyState
        type="orders"
        title="No Orders Found"
        description="You haven't placed any orders yet. Start shopping!"
        actionText="Browse Catalog"
        actionPath="/products"
      />
    );
  }

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'delivered': return <span className="badge badge-success">Delivered</span>;
      case 'cancelled': return <span className="badge badge-danger">Cancelled</span>;
      case 'pending': return <span className="badge badge-warning">Pending</span>;
      default: return <span className="badge badge-accent">{status}</span>;
    }
  };

  return (
    <div className="container-main py-8 space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-text-muted">
        <Link to="/" className="hover:text-text">Home</Link>
        <ChevronRight size={14} />
        <span className="text-text font-medium">My Orders</span>
      </nav>

      <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
        <ShoppingBag className="text-accent" /> Order History
      </h1>

      <div className="space-y-4">
        {orders.map((order, i) => (
          <motion.div
            key={order._id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card p-6 space-y-4"
          >
            {/* Order Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <span className="text-xs font-bold text-text-muted uppercase">Order #{order._id.substring(0, 8)}</span>
                <div className="flex items-center gap-2 text-xs text-text-secondary mt-0.5">
                  <Calendar size={12} /> {new Date(order.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {getStatusBadge(order.status)}
                <span className="text-lg font-extrabold text-accent">${order.totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Order Items List */}
            <div className="divide-y divide-border">
              {order.orderItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <img
                    src={item.image || 'https://placehold.co/60x60?text=Product'}
                    alt={item.name}
                    className="w-12 h-12 object-contain bg-bg-alt rounded-lg p-1 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text truncate">{item.name}</p>
                    <p className="text-xs text-text-muted">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                  </div>
                  <span className="text-sm font-bold text-text">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Footer Indicators */}
            <div className="flex items-center justify-between border-t border-border pt-4 text-xs text-text-secondary">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  {order.isPaid ? <CheckCircle size={14} className="text-green-600" /> : <Clock size={14} className="text-amber-600" />}
                  {order.isPaid ? 'Payment Received' : 'Payment Pending'}
                </span>
                <span className="flex items-center gap-1">
                  {order.isDelivered ? <CheckCircle size={14} className="text-green-600" /> : <Clock size={14} className="text-amber-600" />}
                  {order.isDelivered ? 'Delivered' : 'In Transit'}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;
