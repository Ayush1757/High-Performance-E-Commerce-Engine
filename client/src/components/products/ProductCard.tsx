import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { Star, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to detail page when clicking button
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  const getRatingStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 !== 0;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Star key={i} size={14} className="star-icon star-full" />);
      } else if (i === fullStars + 1 && hasHalf) {
        stars.push(<Star key={i} size={14} className="star-icon star-half" />);
      } else {
        stars.push(<Star key={i} size={14} className="star-icon star-empty" />);
      }
    }
    return stars;
  };

  return (
    <Link to={`/products/${product._id}`} className="product-card">
      <div className="product-image-container">
        <img
          src={product.images[0] || 'https://placehold.co/400x400?text=Product'}
          alt={product.name}
          loading="lazy"
          className="product-card-img"
        />
        {product.stock === 0 && (
          <span className="out-of-stock-badge">Out of Stock</span>
        )}
        <span className="product-category-badge">{product.category}</span>
      </div>

      <div className="product-card-details">
        <span className="product-brand">{product.brand}</span>
        <h3 className="product-title" title={product.name}>
          {product.name}
        </h3>

        <div className="product-rating-wrapper">
          <div className="stars-row">{getRatingStars(product.rating)}</div>
          <span className="rating-value">({product.rating})</span>
        </div>

        <div className="product-card-footer">
          <span className="product-price">${product.price.toFixed(2)}</span>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="product-card-add-btn"
            title="Add to Cart"
          >
            <ShoppingCart size={16} />
            Add
          </button>
        </div>
      </div>
    </Link>
  );
};
export default ProductCard;
