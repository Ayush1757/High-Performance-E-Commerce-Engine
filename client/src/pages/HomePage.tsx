import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { Product } from '../types';
import { ProductGrid } from '../components/products/ProductGrid';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

export const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
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
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  const handleAISearchDirect = (query: string) => {
    navigate(`/products?search=${encodeURIComponent(query)}&isVector=true`);
  };

  return (
    <div className="home-page-wrapper">
      {/* Hero Section */}
      <section className="hero-banner-section">
        <div className="hero-overlay"></div>
        <div className="hero-content-container">
          <span className="hero-pre-title">Welcome to AuraStore AI</span>
          <h1 className="hero-main-title">
            The Smartest E-Commerce <br />
            Engine with <span className="text-gradient">Semantic Search</span>
          </h1>
          <p className="hero-description">
            Experience shopping powered by deep vector database integration. Toggle AI search and type what you need naturally.
          </p>
          <div className="hero-action-buttons-group">
            <Link to="/products" className="btn-primary hero-btn">
              Explore Products <ArrowRight size={18} />
            </Link>
            <Link to="/products?isVector=true" className="btn-secondary hero-btn">
              Try AI Vector Search <Sparkles size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Semantic Search Prompt Recommendations */}
      <section className="semantic-prompts-showcase">
        <h3>Try semantic search prompts:</h3>
        <div className="prompts-grid-list">
          <button onClick={() => handleAISearchDirect('running shoes for heavy workouts')} className="prompt-suggestion-pill">
            "Running shoes for heavy workouts"
          </button>
          <button onClick={() => handleAISearchDirect('latest smartphone with high battery life')} className="prompt-suggestion-pill">
            "Latest smartphone with high battery life"
          </button>
          <button onClick={() => handleAISearchDirect('cozy and stylish apparel')} className="prompt-suggestion-pill">
            "Cozy and stylish apparel"
          </button>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="value-props-section">
        <div className="value-prop-card">
          <Sparkles className="prop-icon text-accent" size={32} />
          <h3>AI Vector Search</h3>
          <p>Find what you want by describing it naturally rather than relying on exact keyword matching.</p>
        </div>
        <div className="value-prop-card">
          <Zap className="prop-icon text-accent" size={32} />
          <h3>High Performance Caching</h3>
          <p>Supercharged responses utilizing a robust Redis Cache-Aside database buffering strategy.</p>
        </div>
        <div className="value-prop-card">
          <ShieldCheck className="prop-icon text-accent" size={32} />
          <h3>Secure Authentication</h3>
          <p>Equipped with strict authorization middleware, bcrypt password hashing, and token verification.</p>
        </div>
      </section>

      {/* Featured Products Listing */}
      <section className="featured-products-showcase">
        <div className="section-header-row">
          <h2>Trending Products</h2>
          <Link to="/products" className="view-all-link">
            View All <ArrowRight size={16} />
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
    </div>
  );
};
export default HomePage;
