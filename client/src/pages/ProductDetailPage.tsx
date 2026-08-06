import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { Star, ShoppingCart, ArrowLeft, ShieldAlert, Check, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'reviews' | 'shipping'>('specs');
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

  const getRatingStars = (rating: number, size = 18) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 !== 0;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Star key={i} size={size} className="star-icon star-full" />);
      } else if (i === fullStars + 1 && hasHalf) {
        stars.push(<Star key={i} size={size} className="star-icon star-half" />);
      } else {
        stars.push(<Star key={i} size={size} className="star-icon star-empty" />);
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

  // Simulated Specifications mapping based on Category
  const getSpecsList = () => {
    const defaultSpecs = [
      { name: 'Model Year', value: '2026' },
      { name: 'Manufacturer Warranty', value: '1 Year Limited' },
      { name: 'Availability', value: product.stock > 0 ? 'In Stock' : 'Out of Stock' },
      { name: 'Product Type', value: product.category },
    ];

    if (product.category === 'Mobiles') {
      return [
        { name: 'Processor', value: 'Next-Gen Octa-core Core' },
        { name: 'Connectivity', value: '5G, Wi-Fi 6E, Bluetooth 5.3' },
        ...defaultSpecs,
      ];
    } else if (product.category === 'Electronics') {
      return [
        { name: 'Hardware Interface', value: 'USB-C, HDMI 2.1, Jack 3.5mm' },
        { name: 'Power Consumption', value: 'Energy-Efficient standard' },
        ...defaultSpecs,
      ];
    }
    return defaultSpecs;
  };

  const mockReviews = [
    { name: 'Sarah K.', date: 'August 1, 2026', stars: 5, verified: true, text: 'Absolutely spectacular. Exceeded all my quality expectations, shipping was fast too!' },
    { name: 'Alex M.', date: 'July 24, 2026', stars: 4.5, verified: true, text: 'Great premium feel. Performs exactly as described in the vector specifications. Highly recommended.' }
  ];

  return (
    <div className="product-detail-page-container">
      <div className="detail-header-nav">
        <Link to="/products" className="back-link">
          <ArrowLeft size={16} /> Back to Catalog
        </Link>
      </div>

      <div className="detail-product-layout">
        {/* Left: Product Media Gallery */}
        <div className="detail-image-gallery">
          <img
            src={product.images[0] || 'https://placehold.co/600x600?text=Product'}
            alt={product.name}
            className="detail-main-img"
          />
        </div>

        {/* Right: Info & Actions */}
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
                  <Check size={14} className="inline-icon" /> In Stock ({product.stock} left)
                </span>
              ) : (
                <span className="status-indicator out-of-stock">
                  <ShieldAlert size={14} /> Out of Stock
                </span>
              )}
            </div>
          </div>

          <div className="product-info-description">
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
                <ShoppingCart size={18} /> Add to Cart
              </button>
            </div>
          )}

          {/* Secure Badges */}
          <div className="detail-secure-badges-row">
            <div className="secure-badge-pill">
              <ShieldCheck size={16} /> Secure Checkout
            </div>
            <div className="secure-badge-pill">
              <Truck size={16} /> Free Shipping
            </div>
            <div className="secure-badge-pill">
              <RefreshCw size={16} /> 30-Day Returns
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section for Specs, Reviews & Shipping */}
      <section className="product-detail-tabs-section glass-panel">
        <div className="tabs-nav-bar">
          <button
            onClick={() => setActiveTab('specs')}
            className={`tab-nav-btn ${activeTab === 'specs' ? 'active' : ''}`}
          >
            Specifications
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`tab-nav-btn ${activeTab === 'reviews' ? 'active' : ''}`}
          >
            Reviews ({mockReviews.length})
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            className={`tab-nav-btn ${activeTab === 'shipping' ? 'active' : ''}`}
          >
            Shipping & Returns
          </button>
        </div>

        <div className="tab-content-area">
          {activeTab === 'specs' && (
            <div className="specs-tab-view">
              <table className="specs-table">
                <tbody>
                  {getSpecsList().map((spec, i) => (
                    <tr key={i}>
                      <td className="spec-label-col">{spec.name}</td>
                      <td className="spec-val-col">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="reviews-tab-view">
              <div className="reviews-summary-card">
                <h3>Customer Feedback</h3>
                <div className="review-average-row">
                  <span className="big-rating">{product.rating}</span>
                  <div>
                    <div className="stars-row">{getRatingStars(product.rating, 14)}</div>
                    <span className="total-ratings-label">Based on mock reviews</span>
                  </div>
                </div>
              </div>

              <div className="reviews-list-wrapper">
                {mockReviews.map((rev, i) => (
                  <div key={i} className="review-item-card">
                    <div className="review-item-header">
                      <span className="reviewer-name">{rev.name}</span>
                      {rev.verified && <span className="verified-buyer-badge">Verified Buyer</span>}
                      <span className="review-date">{rev.date}</span>
                    </div>
                    <div className="stars-row margin-y-xs">{getRatingStars(rev.stars, 12)}</div>
                    <p className="review-text">{rev.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="shipping-tab-view">
              <h3>Delivery & Return Policies</h3>
              <p>We process and ship orders within 24 hours. Delivery is free for all orders over $500, or a flat $50 shipping fee is applied.</p>
              <h4>Fast Dispatch</h4>
              <p>Shipped directly from our regional fulfillment centers to guarantee prompt arrival.</p>
              <h4>Hassle-Free Returns</h4>
              <p>We stand by our product vector quality. If you are not completely satisfied, return the product within 30 days for a full refund.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
export default ProductDetailPage;
