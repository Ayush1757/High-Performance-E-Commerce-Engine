import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { Order } from '../types';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { ShoppingBag, Calendar, DollarSign, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

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
      } catch (err) {
        console.error('Failed to load orders:', err);
        toast.error('Failed to retrieve order history');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  // Auth guard
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return <LoadingSpinner fullPage message="Retrieving order history..." />;
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        type="cart"
        title="No Orders Found"
        description="You haven't placed any orders yet."
        actionText="View Catalog"
        actionPath="/products"
      />
    );
  }

  const getStatusBadgeClass = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return 'status-badge-green';
      case 'cancelled':
        return 'status-badge-red';
      case 'pending':
        return 'status-badge-yellow';
      default:
        return 'status-badge-blue';
    }
  };

  return (
    <div className="orders-page-container">
      <h1 className="page-heading">
        <ShoppingBag className="inline-icon" /> Order History
      </h1>

      <div className="orders-list-layout">
        {orders.map((order) => (
          <div key={order._id} className="order-item-card">
            <div className="order-card-header">
              <div className="order-header-details">
                <span className="order-id-label">Order ID: {order._id.substring(0, 10)}...</span>
                <span className="order-date">
                  <Calendar size={14} /> {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="order-header-status">
                <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                  {order.status.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="order-card-items-preview">
              {order.orderItems.map((item, index) => (
                <div key={index} className="order-subitem-row">
                  <img
                    src={item.image || 'https://placehold.co/50x50?text=Product'}
                    alt={item.name}
                    className="order-subitem-img"
                  />
                  <div className="order-subitem-details">
                    <span className="subitem-name">{item.name}</span>
                    <span className="subitem-qty-price">
                      {item.quantity} x ${item.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="order-card-footer">
              <div className="payment-delivery-indicators">
                <span className={`payment-indicator ${order.isPaid ? 'paid' : 'unpaid'}`}>
                  {order.isPaid ? <CheckCircle size={14} /> : <Clock size={14} />}
                  {order.isPaid ? 'Paid' : 'Unpaid'}
                </span>
                <span className={`delivery-indicator ${order.isDelivered ? 'delivered' : 'pending'}`}>
                  {order.isDelivered ? <CheckCircle size={14} /> : <Clock size={14} />}
                  {order.isDelivered ? 'Delivered' : 'Pending Delivery'}
                </span>
              </div>
              <div className="order-total-price">
                <DollarSign size={16} />
                <span>Total: ${order.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default OrdersPage;
