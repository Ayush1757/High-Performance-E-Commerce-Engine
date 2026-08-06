import React, { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../api';
import { CreditCard, ShoppingBag, Truck, ShieldCheck, ChevronRight, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const CheckoutPage: React.FC = () => {
  const { user } = useAuth();
  const { cartItems, itemsPrice, shippingPrice, taxPrice, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'USA',
    phone: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod'>('card');
  const [submitting, setSubmitting] = useState(false);

  if (!user) {
    toast.error('Please sign in to complete your checkout');
    return <Navigate to="/login?redirect=/checkout" replace />;
  }

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
    <div className="container-main py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-text-muted mb-8">
        <Link to="/" className="hover:text-text">Home</Link>
        <ChevronRight size={14} />
        <Link to="/cart" className="hover:text-text">Cart</Link>
        <ChevronRight size={14} />
        <span className="text-text font-medium">Checkout</span>
      </nav>

      <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3 mb-8">
        <Truck className="text-accent" /> Secure Checkout
      </h1>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
        {/* Main Details Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Form */}
          <div className="card p-6 space-y-6">
            <h2 className="text-lg font-bold border-b border-border pb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-accent text-white text-xs flex items-center justify-center font-bold">1</span>
              Shipping Address
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-text-muted uppercase">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={shippingAddress.fullName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  required
                  className="input"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-text-muted uppercase">Street Address</label>
                <input
                  type="text"
                  name="address"
                  value={shippingAddress.address}
                  onChange={handleInputChange}
                  placeholder="123 Main St, Apt 4B"
                  required
                  className="input"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted uppercase">City</label>
                <input
                  type="text"
                  name="city"
                  value={shippingAddress.city}
                  onChange={handleInputChange}
                  placeholder="New York"
                  required
                  className="input"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted uppercase">State / Region</label>
                <input
                  type="text"
                  name="state"
                  value={shippingAddress.state}
                  onChange={handleInputChange}
                  placeholder="NY"
                  required
                  className="input"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted uppercase">Postal Code</label>
                <input
                  type="text"
                  name="postalCode"
                  value={shippingAddress.postalCode}
                  onChange={handleInputChange}
                  placeholder="10001"
                  required
                  className="input"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted uppercase">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={shippingAddress.phone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 000-0000"
                  required
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="card p-6 space-y-6">
            <h2 className="text-lg font-bold border-b border-border pb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-accent text-white text-xs flex items-center justify-center font-bold">2</span>
              Payment Method
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label
                onClick={() => setPaymentMethod('card')}
                className={`card p-4 flex items-center gap-3 cursor-pointer transition-all ${
                  paymentMethod === 'card' ? 'border-accent bg-accent-light/20 shadow-md' : 'hover:bg-bg-alt'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                  className="hidden"
                />
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${paymentMethod === 'card' ? 'bg-accent text-white' : 'bg-bg-alt text-text-secondary'}`}>
                  <CreditCard size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-text">Credit / Debit Card</p>
                  <p className="text-xs text-text-muted">Instant & Secure</p>
                </div>
              </label>

              <label
                onClick={() => setPaymentMethod('cod')}
                className={`card p-4 flex items-center gap-3 cursor-pointer transition-all ${
                  paymentMethod === 'cod' ? 'border-accent bg-accent-light/20 shadow-md' : 'hover:bg-bg-alt'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="hidden"
                />
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${paymentMethod === 'cod' ? 'bg-accent text-white' : 'bg-bg-alt text-text-secondary'}`}>
                  <ShoppingBag size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-text">Cash on Delivery</p>
                  <p className="text-xs text-text-muted">Pay when delivered</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="space-y-6">
          <div className="card p-6 space-y-4 sticky top-24">
            <h2 className="text-lg font-bold border-b border-border pb-3">Order Items ({cartItems.length})</h2>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 divide-y divide-border">
              {cartItems.map((item) => (
                <div key={item.product._id} className="flex items-center gap-3 pt-3 first:pt-0">
                  <img
                    src={item.product.images?.[0] || 'https://placehold.co/50x50?text=Prod'}
                    alt={item.product.name}
                    className="w-12 h-12 object-contain bg-bg-alt rounded p-1 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-text truncate">{item.product.name}</p>
                    <p className="text-xs text-text-muted">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-xs font-bold text-text">${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-text-secondary">
                <span>Items Subtotal</span>
                <span>${itemsPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Shipping</span>
                <span>{shippingPrice === 0 ? 'FREE' : `$${shippingPrice.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Tax (18%)</span>
                <span>${taxPrice.toFixed(2)}</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between items-baseline">
                <span className="font-bold">Total</span>
                <span className="text-xl font-extrabold text-accent">${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-lg w-full flex items-center justify-center gap-2"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 size={18} /> Place Order
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-text-muted">
              <ShieldCheck size={16} className="text-green-600" /> 256-bit Encrypted Transaction
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
