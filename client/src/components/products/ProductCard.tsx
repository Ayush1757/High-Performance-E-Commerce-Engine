import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCompare } from '../../context/CompareContext';
import { Star, ShoppingCart, Heart, Eye, ArrowLeftRight } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
  index?: number;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0, onQuickView }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCompare, isInCompare } = useCompare();

  const isWishlisted = isInWishlist(product._id);
  const isCompared = isInCompare(product._id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) onQuickView(product);
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCompare(product);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={12}
        className={i < Math.floor(rating) ? 'star-filled' : 'star-empty'}
      />
    ));
  };

  const discount = Math.floor(Math.random() * 20) + 10;
  const originalPrice = (product.price / (1 - discount / 100)).toFixed(2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
    >
      <Link
        to={`/products/${product._id}`}
        className="group block bg-surface border border-border rounded-xl overflow-hidden shadow-xs hover:shadow-card-hover transition-all duration-300"
      >
        {/* Image */}
        <div className="relative aspect-square bg-bg-alt overflow-hidden">
          <img
            src={product.images?.[0] || 'https://placehold.co/400x400?text=Product'}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            <span className="badge badge-accent text-[10px]">-{discount}%</span>
            {product.stock === 0 && <span className="badge badge-danger text-[10px]">Sold Out</span>}
            {product.stock > 0 && product.stock <= 5 && <span className="badge badge-warning text-[10px]">Low Stock</span>}
          </div>

          {/* Hover Actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
            <button
              onClick={handleWishlist}
              className={`w-8 h-8 rounded-lg shadow-md flex items-center justify-center transition-colors ${
                isWishlisted ? 'bg-danger text-white' : 'bg-white text-text-secondary hover:text-danger'
              }`}
              aria-label="Wishlist"
              title="Add to Wishlist"
            >
              <Heart size={14} fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={handleQuickView}
              className="w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center text-text-secondary hover:text-accent transition-colors"
              aria-label="Quick view"
              title="Quick View"
            >
              <Eye size={14} />
            </button>
            <button
              onClick={handleCompare}
              className={`w-8 h-8 rounded-lg shadow-md flex items-center justify-center transition-colors ${
                isCompared ? 'bg-accent text-white' : 'bg-white text-text-secondary hover:text-accent'
              }`}
              aria-label="Compare"
              title="Compare Product"
            >
              <ArrowLeftRight size={14} />
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">{product.brand}</span>
            <span className="text-[11px] text-text-muted">{product.category}</span>
          </div>

          <h3 className="text-sm font-semibold text-text leading-snug line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>

          <div className="flex items-center gap-1.5">
            <div className="flex">{renderStars(product.rating)}</div>
            <span className="text-xs text-text-muted">{product.rating}</span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-text">${product.price.toFixed(2)}</span>
              <span className="text-xs text-text-muted line-through">${originalPrice}</span>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-9 h-9 rounded-lg bg-accent text-white flex items-center justify-center hover:bg-accent-hover disabled:bg-border disabled:text-text-muted transition-colors"
              aria-label="Add to cart"
              title="Add to Cart"
            >
              <ShoppingCart size={16} />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
