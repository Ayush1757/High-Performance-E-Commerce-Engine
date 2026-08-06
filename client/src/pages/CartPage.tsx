import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { EmptyState } from '../components/ui/EmptyState';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, Tag, Minus, Plus, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export const CartPage: React.FC = () => {
  const {
    cartItems,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    itemsPrice,
  } = useCart();
  const navigate = useNavigate();

  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState('');

  const handleQuantityChange = (productId: string, newQty: number, stock: number) => {
    if (newQty > stock) {
      toast.error(`Only ${stock} items available in stock`);
      return;
    }
    if (newQty < 1) return;
    updateCartQuantity(productId, newQty);
  };

  const handleRemove = (productId: string, name: string) => {
    removeFromCart(productId);
    toast.success(`${name} removed from cart`);
  };

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'AURA20') {
      setDiscountPercent(20);
      setAppliedPromo('AURA20');
      setPromoCode('');
      toast.success('Promo code AURA20 applied: 20% discount!');
    } else {
      toast.error('Invalid promo code. Try AURA20');
    }
  };

  if (cartItems.length === 0) {
    return <EmptyState type="cart" />;
  }

  const discountAmount = Number((itemsPrice * (discountPercent / 100)).toFixed(2));
  const activeItemsPrice = Number((itemsPrice - discountAmount).toFixed(2));
  const shippingPrice = activeItemsPrice > 500 || activeItemsPrice === 0 ? 0 : 50;
  const taxPrice = Number((activeItemsPrice * 0.18).toFixed(2));
  const totalPrice = Number((activeItemsPrice + shippingPrice + taxPrice).toFixed(2));

  const freeShippingThreshold = 500;
  const shippingProgress = Math.min(100, (activeItemsPrice / freeShippingThreshold) * 100);
  const remainingForFreeShipping = freeShippingThreshold - activeItemsPrice;

  return (
    <div className="container-main py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-text-muted mb-8">
        <Link to="/" className="hover:text-text">Home</Link>
        <ChevronRight size={14} />
        <span className="text-text font-medium">Shopping Cart</span>
      </nav>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
          <ShoppingBag className="text-accent" /> Shopping Cart
        </h1>
        <button onClick={clearCart} className="text-sm text-text-muted hover:text-danger transition-colors">
          Clear Cart
        </button>
      </div>

      {/* Free Shipping Banner */}
      <div className="card p-4 mb-8 bg-accent-light/30 border-accent/20">
        <div className="flex items-center justify-between text-sm mb-2">
          {remainingForFreeShipping > 0 ? (
            <p className="text-text-secondary">
              Add <span className="font-bold text-accent">${remainingForFreeShipping.toFixed(2)}</span> more to qualify for <strong className="text-text">Free Shipping!</strong>
            </p>
          ) : (
            <p className="text-green-600 font-bold flex items-center gap-1">
              🎉 Your order qualifies for Free Shipping!
            </p>
          )}
          <span className="text-xs font-semibold text-text-muted">{shippingProgress.toFixed(0)}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${shippingProgress}%` }} />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item, index) => (
            <motion.div
              key={item.product._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4"
            >
              <img
                src={item.product.images?.[0] || 'https://placehold.co/100x100?text=Product'}
                alt={item.product.name}
                className="w-20 h-20 object-contain rounded-lg bg-bg-alt p-2 shrink-0"
              />

              <div className="flex-1 min-w-0 text-center sm:text-left space-y-1">
                <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">{item.product.brand}</span>
                <Link to={`/products/${item.product._id}`} className="block text-sm font-bold text-text hover:text-accent truncate">
                  {item.product.name}
                </Link>
                <span className="text-sm font-semibold text-accent">${item.product.price.toFixed(2)}</span>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center border border-border rounded-lg">
                <button
                  onClick={() => handleQuantityChange(item.product._id, item.quantity - 1, item.product.stock)}
                  className="w-8 h-8 flex items-center justify-center text-text-secondary hover:bg-bg-alt rounded-l-lg transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
                <button
                  onClick={() => handleQuantityChange(item.product._id, item.quantity + 1, item.product.stock)}
                  className="w-8 h-8 flex items-center justify-center text-text-secondary hover:bg-bg-alt rounded-r-lg transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Subtotal */}
              <div className="text-right shrink-0">
                <p className="text-sm font-extrabold text-text">${(item.product.price * item.quantity).toFixed(2)}</p>
              </div>

              {/* Remove */}
              <button
                onClick={() => handleRemove(item.product._id, item.product.name)}
                className="btn-icon text-text-muted hover:text-danger hover:bg-danger-light"
                title="Remove item"
              >
                <Trash2 size={18} />
              </button>
            </motion.div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <div className="card p-6 space-y-4 sticky top-24">
            <h2 className="text-lg font-bold border-b border-border pb-3">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-text-secondary">
                <span>Subtotal</span>
                <span className="font-semibold text-text">${itemsPrice.toFixed(2)}</span>
              </div>

              {discountPercent > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Promo Discount ({discountPercent}%)</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-text-secondary">
                <span>Estimated Shipping</span>
                <span className="font-semibold text-text">
                  {shippingPrice === 0 ? <span className="text-green-600 font-bold">FREE</span> : `$${shippingPrice.toFixed(2)}`}
                </span>
              </div>

              <div className="flex justify-between text-text-secondary">
                <span>Estimated Tax (18%)</span>
                <span className="font-semibold text-text">${taxPrice.toFixed(2)}</span>
              </div>

              <div className="border-t border-border pt-3 flex justify-between items-baseline">
                <span className="text-base font-bold">Total</span>
                <span className="text-2xl font-extrabold text-accent">${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Promo Code Form */}
            <form onSubmit={handleApplyPromo} className="pt-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Promo code (e.g. AURA20)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="input text-sm"
                />
                <button type="submit" className="btn btn-secondary text-sm">Apply</button>
              </div>
              {appliedPromo && (
                <p className="text-xs text-green-600 font-medium flex items-center gap-1 mt-2">
                  <Tag size={12} /> Code {appliedPromo} applied
                </p>
              )}
            </form>

            <button onClick={() => navigate('/checkout')} className="btn btn-primary btn-lg w-full">
              Proceed to Checkout <ArrowRight size={18} />
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-text-muted pt-2">
              <ShieldCheck size={16} className="text-green-600" />
              <span>SSL Encrypted Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
