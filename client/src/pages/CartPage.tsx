import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { EmptyState } from '../components/ui/EmptyState';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export const CartPage: React.FC = () => {
  const {
    cartItems,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
  } = useCart();

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

  if (cartItems.length === 0) {
    return <EmptyState type="cart" />;
  }

  return (
    <div className="cart-page-container">
      <h1 className="page-heading">
        <ShoppingBag size={24} className="inline-icon" /> Shopping Cart
      </h1>

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

          <Link to="/checkout" className="btn-primary checkout-proceed-btn">
            Proceed to Checkout <ArrowRight size={18} />
          </Link>
        </aside>
      </div>
    </div>
  );
};
export default CartPage;
