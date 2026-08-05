import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { Star, ShoppingCart, ArrowLeft, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        if (res.data.success) {
          setProduct(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load product details:', err);
        toast.error('Product not found');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      toast.success(`${quantity} x ${product.name} added to cart!`);
      navigate('/cart');
    }
  };

  const getRatingStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 !== 0;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Star key={i} size={18} className="star-icon star-full" />);
      } else if (i === fullStars + 1 && hasHalf) {
        stars.push(<Star key={i} size={18} className="star-icon star-half" />);
      } else {
        stars.push(<Star key={i} size={18} className="star-icon star-empty" />);
      }
    }
    return stars;
  };

  if (loading) {
    return <LoadingSpinner fullPage message="Fetching product specifications..." />;
  }

  if (!product) {
    return <EmptyState type="error" title="Product Not Found" description="The product with the requested ID does not exist." actionText="Back to Shop" actionPath="/products" />;
  }

  return (
    <div className="product-detail-page-container">
      <div className="detail-header-nav">
        <Link to="/products" className="back-link">
          <ArrowLeft size={16} /> Back to Catalog
        </Link>
      </div>

      <div className="detail-product-layout">
        <div className="detail-image-gallery">
          <img
            src={product.images[0] || 'https://placehold.co/600x600?text=Product'}
            alt={product.name}
            className="detail-main-img"
          />
        </div>

        <div className="detail-product-info">
          <span className="product-info-brand">{product.brand}</span>
          <h1 className="product-info-name">{product.name}</h1>

          <div className="product-info-rating-row">
            <div className="stars-row">{getRatingStars(product.rating)}</div>
            <span className="rating-value">{product.rating} / 5</span>
            <span className="category-tag-badge">{product.category}</span>
          </div>

          <div className="product-info-price-card">
            <span className="info-price-text">${product.price.toFixed(2)}</span>
            <div className="stock-status-row">
              {product.stock > 0 ? (
                <span className="status-indicator in-stock">
                  In Stock ({product.stock} units left)
                </span>
              ) : (
                <span className="status-indicator out-of-stock">
                  <ShieldAlert size={14} /> Out of Stock
                </span>
              )}
            </div>
          </div>

          <div className="product-info-description">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>

          {product.stock > 0 && (
            <div className="product-info-actions-card">
              <div className="quantity-select-wrapper">
                <label htmlFor="quantity-detail-select">Quantity</label>
                <select
                  id="quantity-detail-select"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                >
                  {Array.from({ length: Math.min(10, product.stock) }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>

              <button onClick={handleAddToCart} className="btn-primary detail-add-cart-btn">
                <ShoppingCart size={18} /> Add to Shopping Cart
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default ProductDetailPage;
