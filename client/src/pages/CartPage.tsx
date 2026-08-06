import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { EmptyState } from '../components/ui/EmptyState';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

export const CartPage: React.FC = () => {
  const {
    cartItems,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    itemsPrice,
  } = useCart();

  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState('');

  const handleQuantityChange = (productId: string, val: string, stock: number) => {
    const qty = Number(val);
    if (qty > stock) {
      toast.error(`Only ${stock} items available in stock`);
      return;
    }
    updateCartQuantity(productId, qty);
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
      toast.success('Promo code AURA20 applied: 20% discount on products!');
    } else {
      toast.error('Invalid promo code. Try AURA20');
    }
  };

  if (cartItems.length === 0) {
    return <EmptyState type="cart" />;
  }

  // Calculate pricing with optional promo discount
  const discountAmount = Number((itemsPrice * (discountPercent / 100)).toFixed(2));
  const activeItemsPrice = Number((itemsPrice - discountAmount).toFixed(2));
  const shippingPrice = activeItemsPrice > 500 || activeItemsPrice === 0 ? 0 : 50;
  const taxPrice = Number((activeItemsPrice * 0.18).toFixed(2));
  const totalPrice = Number((activeItemsPrice + shippingPrice + taxPrice).toFixed(2));

  // Shipping progress math
  const freeShippingThreshold = 500;
  const shippingProgress = Math.min(100, (activeItemsPrice / freeShippingThreshold) * 100);
  const remainingForFreeShipping = freeShippingThreshold - activeItemsPrice;

  return (
    <div className="cart-page-container">
      <h1 className="page-heading">
        <ShoppingBag size={24} className="inline-icon" /> Shopping Cart
      </h1>

      {/* Free Shipping Progress Indicator */}
      <div className="shipping-progress-banner glass-panel margin-bottom-md">
        <div className="progress-header">
          {remainingForFreeShipping > 0 ? (
            <p>
              Add <span className="text-accent font-bold">${remainingForFreeShipping.toFixed(2)}</span> more to qualify for <strong>Free Shipping!</strong>
            </p>
          ) : (
            <p className="text-success font-bold">🎉 Your order qualifies for Free Shipping!</p>
          )}
        </div>
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${shippingProgress}%` }}></div>
        </div>
      </div>

      <div className="cart-page-layout">
        {/* Cart items list */}
        <div className="cart-items-section">
          <div className="cart-header-row">
            <span>Product Details</span>
            <span>Quantity</span>
            <span>Subtotal</span>
            <span>Remove</span>
          </div>

          <div className="cart-items-list">
            {cartItems.map((item) => (
              <div key={item.product._id} className="cart-item-row">
                <div className="cart-item-info">
                  <img
                    src={item.product.images[0] || 'https://placehold.co/100x100?text=Product'}
                    alt={item.product.name}
                    className="cart-item-img"
                  />
                  <div>
                    <Link to={`/products/${item.product._id}`} className="cart-item-name">
                      {item.product.name}
                    </Link>
                    <span className="cart-item-brand">{item.product.brand}</span>
                    <span className="cart-item-price">${item.product.price.toFixed(2)}</span>
                  </div>
                </div>

                <div className="cart-item-quantity">
                  <select
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(item.product._id, e.target.value, item.product.stock)}
                    aria-label={`Change quantity for ${item.product.name}`}
                  >
                    {Array.from({ length: Math.min(10, item.product.stock) }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="cart-item-subtotal">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </div>

                <div className="cart-item-actions">
                  <button
                    onClick={() => handleRemove(item.product._id, item.product.name)}
                    className="cart-remove-btn"
                    title="Remove from cart"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-bottom-actions">
            <button onClick={clearCart} className="btn-secondary clear-cart-btn">
              Clear Shopping Cart
            </button>
          </div>
        </div>

        {/* Order Summary sidebar */}
        <aside className="order-summary-sidebar">
          <h3>Order Summary</h3>
          <div className="summary-details-card">
            <div className="summary-row">
              <span>Items price:</span>
              <span>${itemsPrice.toFixed(2)}</span>
            </div>
            
            {discountPercent > 0 && (
              <div className="summary-row text-success font-semibold">
                <span>Promo Discount ({discountPercent}%):</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="summary-row">
              <span>Shipping cost:</span>
              <span>${shippingPrice.toFixed(2)}</span>
            </div>
            
            <div className="summary-row">
              <span>Tax (GST 18%):</span>
              <span>${taxPrice.toFixed(2)}</span>
            </div>
            
            <div className="summary-divider"></div>
            <div className="summary-row grand-total">
              <span>Grand Total:</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>

          {/* Promo Code Form */}
          <form onSubmit={handleApplyPromo} className="promo-code-form">
            <div className="promo-input-row">
              <input
                type="text"
                placeholder="Promo Code (e.g. AURA20)"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="promo-input-field"
              />
              <button type="submit" className="btn-secondary promo-submit-btn">
                Apply
              </button>
            </div>
            {appliedPromo && (
              <div className="applied-promo-tag">
                <Tag size={12} />
                <span>Code {appliedPromo} Applied</span>
              </div>
            )}
          </form>

          <Link to="/checkout" className="btn-primary checkout-proceed-btn">
            Proceed to Checkout <ArrowRight size={18} />
          </Link>

          {/* Trust Seal */}
          <div className="checkout-trust-seals">
            <ShieldCheck size={16} className="text-success" />
            <span>SSL Encrypted Transaction checkout</span>
          </div>
        </aside>
      </div>
    </div>
  );
};
export default CartPage;
