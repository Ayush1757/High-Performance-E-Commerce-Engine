import React from 'react';
import { useCompare } from '../../context/CompareContext';
import { useCart } from '../../context/CartContext';
import { X, Trash2, ShoppingCart, Star, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({ isOpen, onClose }) => {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const { addToCart } = useCart();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" style={{ zIndex: 'var(--z-modal)' }} onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="card bg-surface w-full max-w-5xl overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col"
        >
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div>
              <h2 className="text-xl font-bold">Product Comparison</h2>
              <p className="text-xs text-text-secondary">Comparing {compareList.length} products side by side</p>
            </div>
            <div className="flex items-center gap-2">
              {compareList.length > 0 && (
                <button onClick={clearCompare} className="btn btn-ghost btn-sm text-xs text-danger">Clear All</button>
              )}
              <button onClick={onClose} className="btn-icon"><X size={20} /></button>
            </div>
          </div>

          <div className="p-6 overflow-x-auto flex-1">
            {compareList.length === 0 ? (
              <div className="text-center py-12 text-text-muted">
                <p className="text-sm">No products added for comparison yet.</p>
                <p className="text-xs mt-1">Click the compare button on any product card to compare specs.</p>
              </div>
            ) : (
              <div className="grid grid-cols-5 gap-4 min-w-[600px]">
                {/* Labels column */}
                <div className="space-y-6 text-xs font-bold text-text-muted uppercase tracking-wider pt-32">
                  <div className="h-8 flex items-center">Price</div>
                  <div className="h-8 flex items-center">Brand</div>
                  <div className="h-8 flex items-center">Category</div>
                  <div className="h-8 flex items-center">Rating</div>
                  <div className="h-8 flex items-center">Availability</div>
                  <div className="h-10 flex items-center">Action</div>
                </div>

                {/* Products columns */}
                {compareList.map((product) => (
                  <div key={product._id} className="space-y-6 text-sm card p-4 relative">
                    <button
                      onClick={() => removeFromCompare(product._id)}
                      className="absolute top-2 right-2 text-text-muted hover:text-danger p-1"
                    >
                      <Trash2 size={14} />
                    </button>

                    <div className="h-28 flex flex-col items-center justify-center text-center gap-2">
                      <img
                        src={product.images?.[0] || 'https://placehold.co/80x80?text=Product'}
                        alt={product.name}
                        className="w-16 h-16 object-contain bg-bg-alt rounded p-1"
                      />
                      <p className="text-xs font-bold text-text line-clamp-2">{product.name}</p>
                    </div>

                    <div className="h-8 flex items-center font-extrabold text-accent">${product.price.toFixed(2)}</div>
                    <div className="h-8 flex items-center text-xs text-text-secondary">{product.brand}</div>
                    <div className="h-8 flex items-center text-xs text-text-secondary">{product.category}</div>
                    <div className="h-8 flex items-center text-xs text-amber-500 font-semibold flex gap-1">
                      <Star size={14} fill="currentColor" /> {product.rating}
                    </div>
                    <div className="h-8 flex items-center text-xs font-semibold">
                      {product.stock > 0 ? (
                        <span className="text-green-600 flex items-center gap-1"><Check size={12} /> In Stock ({product.stock})</span>
                      ) : (
                        <span className="text-danger">Out of Stock</span>
                      )}
                    </div>
                    <div className="h-10 flex items-center">
                      <button
                        onClick={() => addToCart(product)}
                        disabled={product.stock === 0}
                        className="btn btn-primary btn-sm w-full text-xs"
                      >
                        <ShoppingCart size={14} /> Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
