import React, { useState } from 'react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useNavigate } from 'react-router-dom';
import { X, Star, ShoppingCart, Heart, ShieldCheck, Check, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success(`${quantity} × ${product.name} added to cart!`);
    onClose();
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    onClose();
    navigate('/checkout');
  };

  const isWishlisted = isInWishlist(product._id);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" style={{ zIndex: 'var(--z-modal)' }} onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          onClick={(e) => e.stopPropagation()}
          className="card bg-surface w-full max-w-3xl overflow-hidden shadow-2xl relative"
        >
          <button onClick={onClose} className="absolute top-4 right-4 btn-icon z-10">
            <X size={20} />
          </button>

          <div className="grid md:grid-cols-2 gap-6 p-6 sm:p-8">
            {/* Image */}
            <div className="aspect-square bg-bg-alt rounded-xl p-6 flex items-center justify-center relative">
              <img
                src={product.images?.[0] || 'https://placehold.co/400x400?text=Product'}
                alt={product.name}
                className="max-w-full max-h-full object-contain"
              />
              <span className="absolute top-3 left-3 badge badge-accent">{product.category}</span>
            </div>

            {/* Product Details */}
            <div className="space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">{product.brand}</span>
                <h2 className="text-xl font-bold text-text leading-tight">{product.name}</h2>

                <div className="flex items-center gap-2">
                  <div className="flex text-amber-400">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} size={14} className={i < Math.floor(product.rating) ? 'star-filled' : 'star-empty'} />
                    ))}
                  </div>
                  <span className="text-xs text-text-muted">{product.rating} / 5</span>
                </div>

                <div className="flex items-baseline gap-3 pt-1">
                  <span className="text-2xl font-extrabold text-text">${product.price.toFixed(2)}</span>
                  <span className="text-sm text-text-muted line-through">${(product.price * 1.2).toFixed(2)}</span>
                </div>

                <p className="text-xs text-text-secondary line-clamp-3 pt-2 leading-relaxed">{product.description}</p>
              </div>

              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex items-center justify-between text-xs text-text-secondary">
                  <span>Availability:</span>
                  {product.stock > 0 ? (
                    <span className="text-green-600 font-semibold flex items-center gap-1"><Check size={12} /> In Stock ({product.stock})</span>
                  ) : (
                    <span className="text-danger font-semibold">Out of Stock</span>
                  )}
                </div>

                {product.stock > 0 && (
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-text-muted uppercase">Qty:</label>
                    <select
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="select text-xs py-1 px-3 w-20"
                    >
                      {Array.from({ length: Math.min(10, product.stock) }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex gap-2">
                  <button onClick={handleAddToCart} disabled={product.stock === 0} className="btn btn-primary flex-1 btn-sm">
                    <ShoppingCart size={16} /> Add to Cart
                  </button>
                  <button onClick={handleBuyNow} disabled={product.stock === 0} className="btn btn-secondary flex-1 btn-sm">
                    <Zap size={16} className="text-amber-500" /> Buy Now
                  </button>
                  <button
                    onClick={() => toggleWishlist(product)}
                    className={`btn-icon border border-border rounded-lg ${isWishlisted ? 'text-danger bg-danger-light' : 'text-text-muted hover:text-danger'}`}
                    aria-label="Wishlist"
                  >
                    <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
                  </button>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-text-muted pt-1">
                  <ShieldCheck size={14} className="text-green-600" /> Guaranteed 100% Authentic Product
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
