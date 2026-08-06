import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { Product } from '../types';
import { ProductGrid } from '../components/products/ProductGrid';
import { SearchBar } from '../components/products/SearchBar';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { motion } from 'framer-motion';
import {
  ArrowRight, Sparkles, Cpu, Laptop, Shirt, Headphones,
  Watch, Zap, Shield, Clock, Star, TrendingUp
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await api.get('/products?limit=8&sort=rating_desc');
        if (res.data.success) {
          setProducts(res.data.data.products);
        }
      } catch (err) {
        console.error('Failed to load trending:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  const handleSearch = (query: string, isVector: boolean) => {
    navigate(`/products?search=${encodeURIComponent(query)}&isVector=${isVector}`);
  };

  const categories = [
    { name: 'Electronics', icon: <Laptop size={24} />, color: 'bg-blue-50 text-blue-600' },
    { name: 'Mobiles', icon: <Cpu size={24} />, color: 'bg-purple-50 text-purple-600' },
    { name: 'Clothing', icon: <Shirt size={24} />, color: 'bg-pink-50 text-pink-600' },
    { name: 'Accessories', icon: <Watch size={24} />, color: 'bg-amber-50 text-amber-600' },
    { name: 'Audio', icon: <Headphones size={24} />, color: 'bg-green-50 text-green-600' },
  ];

  const features = [
    { icon: <Zap size={22} />, title: 'Blazing Fast', desc: 'Redis cache delivers results in < 5ms' },
    { icon: <Sparkles size={22} />, title: 'AI Search', desc: '256-dim vector embeddings for semantic matching' },
    { icon: <Shield size={22} />, title: 'Secure', desc: 'Encrypted transactions with JWT auth' },
    { icon: <Clock size={22} />, title: 'Real-time', desc: 'Live inventory and instant order processing' },
  ];

  const testimonials = [
    { name: 'Sarah K.', role: 'Verified Buyer', rating: 5, text: 'The AI search is incredible — I described what I wanted and it found exactly the right product. This is the future of e-commerce.' },
    { name: 'Alex M.', role: 'Tech Reviewer', rating: 5, text: 'Fastest e-commerce platform I\'ve tested. The caching architecture makes everything feel instant.' },
    { name: 'Priya R.', role: 'Regular Shopper', rating: 4, text: 'Beautiful UI, smooth checkout, and the product recommendations are surprisingly accurate.' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-primary overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-light to-primary" />
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, rgba(59,130,246,0.3) 0%, transparent 50%), radial-gradient(circle at 75% 50%, rgba(59,130,246,0.2) 0%, transparent 50%)' }} />

        <div className="container-main relative py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-accent text-sm font-medium mb-6">
              <Sparkles size={14} /> Powered by AI Vector Search
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6" style={{ fontFamily: 'var(--font-display)' }}>
              Shop Smarter with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                AI Intelligence
              </span>
            </h1>
            <p className="text-lg text-white/60 mb-10 max-w-xl mx-auto">
              Describe what you need naturally. Our semantic search engine understands concepts, not just keywords.
            </p>

            {/* Hero Search */}
            <div className="max-w-2xl mx-auto mb-8">
              <SearchBar onSearch={handleSearch} large placeholder="Try: &quot;wireless noise canceling headphones&quot;" />
            </div>

            {/* AI Prompt Suggestions */}
            <div className="flex flex-wrap justify-center gap-2">
              {['comfortable running shoes', 'premium phone with camera', 'stylish winter jacket'].map((q) => (
                <button
                  key={q}
                  onClick={() => handleSearch(q, true)}
                  className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 text-sm hover:bg-white/10 hover:text-white transition-all"
                >
                  "{q}" →
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="section container-main">
        <div className="section-header flex items-end justify-between">
          <div>
            <h2 className="section-title">Browse Categories</h2>
            <p className="section-subtitle">Find exactly what you're looking for</p>
          </div>
          <Link to="/products" className="btn btn-ghost text-accent hidden md:inline-flex">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                to={`/products?category=${cat.name}`}
                className="card p-6 text-center hover:border-accent/30 group"
              >
                <div className={`w-14 h-14 rounded-xl ${cat.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                  {cat.icon}
                </div>
                <h3 className="text-sm font-semibold">{cat.name}</h3>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="section-sm bg-bg-alt">
        <div className="container-main">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center gap-3 p-6"
              >
                <div className="w-12 h-12 rounded-xl bg-accent-light text-accent flex items-center justify-center">{f.icon}</div>
                <h3 className="text-sm font-bold">{f.title}</h3>
                <p className="text-xs text-text-secondary">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Products */}
      <section className="section container-main">
        <div className="section-header flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={20} className="text-accent" />
              <span className="text-sm font-semibold text-accent">Popular Right Now</span>
            </div>
            <h2 className="section-title">Trending Products</h2>
          </div>
          <Link to="/products" className="btn btn-ghost text-accent hidden md:inline-flex">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        {loading ? <LoadingSpinner /> : <ProductGrid products={products} />}
      </section>

      {/* How AI Search Works */}
      <section className="section bg-primary text-white">
        <div className="container-main">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How AI Search Works</h2>
            <p className="text-white/50 max-w-lg mx-auto">Under the hood of AuraStore's high-performance search</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { num: '01', title: 'Embedding Generation', desc: 'Products are encoded as 256-dimensional vectors capturing semantic attributes.' },
              { num: '02', title: 'Vector Similarity', desc: 'Your query becomes a vector. We find the closest matching products using cosine similarity.' },
              { num: '03', title: 'Redis Caching', desc: 'Results are cached via Cache-Aside pattern, delivering subsequent queries in < 5ms.' },
            ].map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="p-8 rounded-2xl bg-white/5 border border-white/10"
              >
                <span className="text-3xl font-extrabold text-accent/30">{step.num}</span>
                <h3 className="text-lg font-bold mt-4 mb-2">{step.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section container-main">
        <div className="section-header text-center">
          <h2 className="section-title">What Our Customers Say</h2>
          <p className="section-subtitle mx-auto">Trusted by thousands of happy shoppers</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card p-6 space-y-4"
            >
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }, (_, j) => (
                  <Star key={j} size={14} className={j < t.rating ? 'star-filled' : 'star-empty'} />
                ))}
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">"{t.text}"</p>
              <div className="flex items-center gap-3 pt-2">
                <div className="w-10 h-10 rounded-full bg-accent-light text-accent flex items-center justify-center font-bold text-sm">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-text-muted">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
