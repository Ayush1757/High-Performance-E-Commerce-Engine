import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../api';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { CreditCard, ShoppingBag, Truck } from 'lucide-react';
import toast from 'react-hot-toast';

export const CheckoutPage: React.FC = () => {
  const { user } = useAuth();
  const { cartItems, itemsPrice, shippingPrice, taxPrice, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'USA',
    phone: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod'>('card');
  const [submitting, setSubmitting] = useState(false);

  // Auth guard
  if (!user) {
    toast.error('Please sign in to complete your checkout');
    return <Navigate to="/login?redirect=/checkout" replace />;
  }

  // Cart guard
  if (cartItems.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic Validation
    const { fullName, address, city, state, postalCode, phone } = shippingAddress;
    if (!fullName || !address || !city || !state || !postalCode || !phone) {
      toast.error('Please complete all shipping address fields');
      return;
    }

    setSubmitting(true);
    try {
      const orderItems = cartItems.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
      }));

      const res = await api.post('/orders', {
        orderItems,
        shippingAddress,
        paymentMethod,
      });

      if (res.data.success) {
        toast.success('Order placed successfully!');
        clearCart();
        navigate(`/orders`);
      } else {
        toast.error(res.data.message || 'Failed to place order');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      toast.error(err.response?.data?.message || 'Transaction processing failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="checkout-page-container">
      <h1 className="page-heading">
        <Truck className="inline-icon" /> Secure Checkout
      </h1>

      <form onSubmit={handleSubmit} className="checkout-page-layout">
        {/* Shipping address form */}
        <div className="checkout-form-section">
          <h3>Shipping Address</h3>
          <div className="form-grid">
            <div className="form-group full-width">
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={shippingAddress.fullName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group full-width">
              <label htmlFor="address">Address Line</label>
              <input
                type="text"
                id="address"
                name="address"
                value={shippingAddress.address}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="city">City</label>
              <input
                type="text"
                id="city"
                name="city"
                value={shippingAddress.city}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="state">State / Region</label>
              <input
                type="text"
                id="state"
                name="state"
                value={shippingAddress.state}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="postalCode">Postal Code</label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                value={shippingAddress.postalCode}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={shippingAddress.phone}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="payment-method-section">
            <h3>Payment Options</h3>
            <div className="payment-options-row">
              <label className={`payment-option-card ${paymentMethod === 'card' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                />
                <CreditCard size={20} />
                <span>Credit / Debit Card</span>
              </label>

              <label className={`payment-option-card ${paymentMethod === 'cod' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                />
                <ShoppingBag size={20} />
                <span>Cash on Delivery</span>
              </label>
            </div>
          </div>
        </div>

        {/* Pricing Summary & Place Order */}
        <aside className="order-summary-sidebar">
          <h3>Order Overview</h3>
          <div className="summary-details-card">
            {cartItems.map((item) => (
              <div key={item.product._id} className="checkout-item-summary">
                <span className="item-qty-name">
                  {item.quantity} x {item.product.name}
                </span>
                <span className="item-price">${(item.product.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="summary-divider-thin"></div>
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>${itemsPrice.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping:</span>
              <span>${shippingPrice.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Tax (GST 18%):</span>
              <span>${taxPrice.toFixed(2)}</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row grand-total">
              <span>Total Price:</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary place-order-btn"
          >
            {submitting ? (
              <LoadingSpinner message="Processing transaction..." />
            ) : (
              <>Place Order</>
            )}
          </button>
        </aside>
      </form>
    </div>
  );
};
export default CheckoutPage;
