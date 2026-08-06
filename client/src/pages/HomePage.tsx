import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { Product } from '../types';
import { ProductGrid } from '../components/products/ProductGrid';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Sparkles, ArrowRight, Cpu, Laptop, Mail, ArrowUpRight } from 'lucide-react';
import toast from 'react-hot-toast';

export const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await api.get('/products?limit=4');
        if (res.data.success) {
          setProducts(res.data.data.products);
        }
      } catch (err) {
        console.error('Failed to load trending products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  const handleAISearchDirect = (query: string) => {
    navigate(`/products?search=${encodeURIComponent(query)}&isVector=true`);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter a valid email address.');
      return;
    }
    toast.success('Thank you for subscribing! Premium deals are on your way.');
    setEmail('');
  };

  const trendingCategories = [
    { name: 'Mobiles', icon: <Cpu size={24} />, description: 'AI smartphones & tablets', count: '120+ Items' },
    { name: 'Electronics', icon: <Laptop size={24} />, description: 'Sleek monitors & audio', count: '85+ Items' },
    { name: 'Shoes', icon: <Sparkles size={24} />, description: 'Active & running shoes', count: '140+ Items' },
  ];

  return (
    <div className="home-page-wrapper">
      {/* Hero Section */}
      <section className="hero-banner-section">
        <div className="hero-overlay"></div>
        <div className="hero-content-container">
          <span className="hero-pre-title">Revolutionizing D2C Shopping</span>
          <h1 className="hero-main-title">
            The Smartest E-Commerce <br />
            Engine with <span className="text-gradient">AI Semantic Search</span>
          </h1>
          <p className="hero-description">
            Shop intelligently. Our vector search engine understands your intentions and concepts. Describe what you want naturally.
          </p>
          <div className="hero-action-buttons-group">
            <Link to="/products" className="btn-primary hero-btn">
              Explore Store <ArrowRight size={18} />
            </Link>
            <Link to="/products?isVector=true" className="btn-secondary hero-btn">
              Try AI Vector Search <Sparkles size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Concept search tags */}
      <section className="semantic-prompts-showcase">
        <h3>Try describing what you need naturally:</h3>
        <div className="prompts-grid-list">
          <button onClick={() => handleAISearchDirect('comfortable shoes for running long distances')} className="prompt-suggestion-pill">
            "Comfortable running shoes" <ArrowUpRight size={14} className="inline-icon" />
          </button>
          <button onClick={() => handleAISearchDirect('premium phone with best camera capabilities')} className="prompt-suggestion-pill">
            "Smartphone with high-end camera" <ArrowUpRight size={14} className="inline-icon" />
          </button>
          <button onClick={() => handleAISearchDirect('stylish jacket to wear during light winter')} className="prompt-suggestion-pill">
            "Stylish winter jacket" <ArrowUpRight size={14} className="inline-icon" />
          </button>
        </div>
      </section>

      {/* Featured Shop Categories */}
      <section className="featured-categories-section">
        <div className="section-header-row">
          <h2>Browse Collections</h2>
        </div>
        <div className="categories-grid">
          {trendingCategories.map((cat) => (
            <Link key={cat.name} to={`/products?category=${cat.name}`} className="category-card-premium glass-panel">
              <div className="category-icon-circle">{cat.icon}</div>
              <h3>{cat.name}</h3>
              <p>{cat.description}</p>
              <div className="category-item-count-badge">{cat.count}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Product Search Engine Explanation flow */}
      <section className="search-flow-explanation glass-panel">
        <div className="explanation-header">
          <h2>Semantic Vector Search vs Keyword Search</h2>
          <p>Under the hood of AuraStore AI's high-performance search infrastructure</p>
        </div>
        <div className="explanation-grid">
          <div className="explanation-box">
            <div className="box-num-badge">01</div>
            <h3>Embeddings Generation</h3>
            <p>Every product is represented as a high-dimensional vector capturing semantic attributes.</p>
          </div>
          <div className="explanation-box">
            <div className="box-num-badge">02</div>
            <h3>Vector Similarity</h3>
            <p>Your query is converted into a vector and compared with products using cosine similarity.</p>
          </div>
          <div className="explanation-box">
            <div className="box-num-badge">03</div>
            <h3>Redis Buffering</h3>
            <p>Cached pages are retrieved via a Cache-Aside mechanism in milliseconds, bypassing database load.</p>
          </div>
        </div>
      </section>

      {/* Trending Products */}
      <section className="featured-products-showcase">
        <div className="section-header-row">
          <h2>Trending Now</h2>
          <Link to="/products" className="view-all-link">
            View All Catalog <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="center-loader-wrapper">
            <LoadingSpinner message="Retrieving catalog..." />
          </div>
        ) : (
          <ProductGrid products={products} />
        )}
      </section>

      {/* Tech Newsletter Section */}
      <section className="newsletter-section glass-panel">
        <div className="newsletter-content">
          <Mail size={32} className="newsletter-icon text-accent" />
          <h2>Join the AI Retail Revolution</h2>
          <p>Get early notifications on high-performance deals and new vector-indexed product drops.</p>
          <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="newsletter-input"
            />
            <button type="submit" className="btn-primary newsletter-btn">
              Subscribe Now
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};
export default HomePage;
