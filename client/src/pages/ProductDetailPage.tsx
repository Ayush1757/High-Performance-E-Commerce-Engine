import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { motion } from 'framer-motion';
import {
  Star, ShoppingCart, ChevronRight, ShieldCheck, Truck,
  RefreshCw, Minus, Plus, Check, AlertTriangle
} from 'lucide-react';
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
        if (res.data.success) setProduct(res.data.data);
      } catch {
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
      toast.success(`${quantity} × ${product.name} added to cart!`);
      navigate('/cart');
    }
  };

  const renderStars = (rating: number, size = 16) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star key={i} size={size} className={i < Math.floor(rating) ? 'star-filled' : 'star-empty'} />
    ));

  if (loading) return <LoadingSpinner fullPage count={1} message="Loading product..." />;
  if (!product) return <EmptyState type="error" title="Product Not Found" description="This product doesn't exist." actionText="Back to Shop" actionPath="/products" />;

  const specs = [
    { name: 'Category', value: product.category },
    { name: 'Brand', value: product.brand },
    { name: 'Availability', value: product.stock > 0 ? `In Stock (${product.stock} units)` : 'Out of Stock' },
    { name: 'Rating', value: `${product.rating} / 5` },
    { name: 'Model Year', value: '2026' },
    { name: 'Warranty', value: '1 Year Limited' },
  ];

  const reviews = [
    { name: 'Sarah K.', date: 'Aug 1, 2026', stars: 5, verified: true, text: 'Absolutely spectacular. Exceeded my expectations!' },
    { name: 'Alex M.', date: 'Jul 24, 2026', stars: 4, verified: true, text: 'Great quality. Performs exactly as described.' },
  ];

  const tabs = [
    { key: 'specs' as const, label: 'Specifications' },
    { key: 'reviews' as const, label: `Reviews (${reviews.length})` },
    { key: 'shipping' as const, label: 'Shipping & Returns' },
  ];

  return (
    <div className="container-main py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-text-muted mb-8">
        <Link to="/" className="hover:text-text">Home</Link>
        <ChevronRight size={14} />
        <Link to="/products" className="hover:text-text">Shop</Link>
        <ChevronRight size={14} />
        <span className="text-text font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Product Layout */}
      <div className="grid lg:grid-cols-2 gap-10 mb-16">
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card overflow-hidden"
        >
          <div className="aspect-square bg-bg-alt flex items-center justify-center p-8">
            <img
              src={product.images?.[0] || 'https://placehold.co/600x600?text=Product'}
              alt={product.name}
              className="max-w-full max-h-full object-contain hover:scale-105 transition-transform duration-500"
            />
          </div>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div>
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">{product.brand}</span>
            <h1 className="text-2xl md:text-3xl font-bold mt-1">{product.name}</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex gap-0.5">{renderStars(product.rating)}</div>
            <span className="text-sm text-text-secondary">{product.rating} / 5</span>
            <span className="badge badge-accent">{product.category}</span>
          </div>

          <div className="card p-5 space-y-3">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold">${product.price.toFixed(2)}</span>
              <span className="text-lg text-text-muted line-through">${(product.price * 1.25).toFixed(2)}</span>
              <span className="badge badge-success">Save 20%</span>
            </div>
            {product.stock > 0 ? (
              <span className="flex items-center gap-1.5 text-sm text-green-600"><Check size={14} /> In Stock · {product.stock} available</span>
            ) : (
              <span className="flex items-center gap-1.5 text-sm text-danger"><AlertTriangle size={14} /> Out of Stock</span>
            )}
          </div>

          <p className="text-sm text-text-secondary leading-relaxed">{product.description}</p>

          {product.stock > 0 && (
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-border rounded-lg">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-bg-alt transition-colors rounded-l-lg">
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center text-sm font-semibold">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="w-10 h-10 flex items-center justify-center hover:bg-bg-alt transition-colors rounded-r-lg">
                  <Plus size={16} />
                </button>
              </div>
              <button onClick={handleAddToCart} className="btn btn-primary btn-lg flex-1">
                <ShoppingCart size={18} /> Add to Cart
              </button>
            </div>
          )}

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: <ShieldCheck size={18} />, label: 'Secure Checkout' },
              { icon: <Truck size={18} />, label: 'Free Shipping' },
              { icon: <RefreshCw size={18} />, label: '30-Day Returns' },
            ].map((b) => (
              <div key={b.label} className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-bg-alt text-center">
                <span className="text-accent">{b.icon}</span>
                <span className="text-[11px] font-medium text-text-secondary">{b.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="card overflow-hidden">
        <div className="flex border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-4 text-sm font-medium transition-colors relative ${
                activeTab === tab.key ? 'text-accent' : 'text-text-secondary hover:text-text'
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
              )}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'specs' && (
            <div className="divide-y divide-border">
              {specs.map((s) => (
                <div key={s.name} className="flex py-3 text-sm">
                  <span className="w-48 text-text-muted font-medium">{s.name}</span>
                  <span className="text-text">{s.value}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-bg-alt">
                <span className="text-4xl font-extrabold text-accent">{product.rating}</span>
                <div>
                  <div className="flex gap-0.5 mb-1">{renderStars(product.rating, 14)}</div>
                  <span className="text-xs text-text-muted">Based on {reviews.length} reviews</span>
                </div>
              </div>
              {reviews.map((r, i) => (
                <div key={i} className="space-y-2 pb-6 border-b border-border last:border-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent-light text-accent flex items-center justify-center text-xs font-bold">{r.name.charAt(0)}</div>
                      <div>
                        <span className="text-sm font-semibold">{r.name}</span>
                        {r.verified && <span className="badge badge-success ml-2 text-[10px]">Verified</span>}
                      </div>
                    </div>
                    <span className="text-xs text-text-muted">{r.date}</span>
                  </div>
                  <div className="flex gap-0.5">{renderStars(r.stars, 12)}</div>
                  <p className="text-sm text-text-secondary">{r.text}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-4 text-sm text-text-secondary leading-relaxed">
              <div>
                <h4 className="font-semibold text-text mb-1">Delivery</h4>
                <p>Orders processed within 24 hours. Free shipping on orders over $500, otherwise a flat $50 fee applies.</p>
              </div>
              <div>
                <h4 className="font-semibold text-text mb-1">Express Shipping</h4>
                <p>Available at checkout for an additional fee. Delivered within 1–2 business days.</p>
              </div>
              <div>
                <h4 className="font-semibold text-text mb-1">Returns</h4>
                <p>30-day hassle-free returns. Return items in original condition for a full refund.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
