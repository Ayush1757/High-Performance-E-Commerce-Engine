import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Mail, ArrowRight, Globe } from 'lucide-react';
import { PolicyModal } from './PolicyModal';
import toast from 'react-hot-toast';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [activePolicy, setActivePolicy] = useState<string | null>(null);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success('Subscribed! Premium deals are on their way.');
    setEmail('');
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-white mt-auto">
      {/* Newsletter Banner */}
      <div className="border-b border-white/10">
        <div className="container-main py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
              <Mail size={22} className="text-accent" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Join the AI Retail Revolution</h3>
              <p className="text-sm text-white/60">Get early access to deals and new product drops.</p>
            </div>
          </div>
          <form onSubmit={handleNewsletter} className="flex gap-2 w-full md:w-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 md:w-72 px-4 py-3 rounded-lg bg-white/10 border border-white/10 text-white placeholder-white/40 text-sm outline-none focus:border-accent transition-colors"
            />
            <button type="submit" className="btn btn-primary shrink-0">
              Subscribe <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer Grid */}
      <div className="container-main py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <Sparkles size={16} className="text-white" />
              </div>
              <span className="text-lg font-bold">Aura<span className="text-accent">Store</span></span>
            </Link>
            <p className="text-sm text-white/50 leading-relaxed">
              High-performance e-commerce engine powered by AI vector search and Redis caching architecture.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="#" aria-label="Website" className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"><Globe size={16} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { to: '/', label: 'Home' },
                { to: '/products', label: 'Shop All' },
                { to: '/cart', label: 'Cart' },
                { to: '/orders', label: 'My Orders' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-white/60 hover:text-white transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-4">Categories</h4>
            <ul className="space-y-3">
              {['Electronics', 'Mobiles', 'Clothing', 'Accessories', 'Shoes'].map((cat) => (
                <li key={cat}>
                  <Link to={`/products?category=${cat}`} className="text-sm text-white/60 hover:text-white transition-colors">{cat}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-4">Support</h4>
            <ul className="space-y-3">
              {['Help Center', 'Shipping Policy', 'Return Policy', 'Privacy Policy', 'Terms of Service'].map((item) => (
                <li key={item}>
                  <button
                    type="button"
                    onClick={() => setActivePolicy(item)}
                    className="text-sm text-white/60 hover:text-white transition-colors cursor-pointer text-left"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/10">
        <div className="container-main py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">© {currentYear} AuraStore AI. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-white/30">Secured by</span>
            <div className="flex items-center gap-3 text-white/40">
              <span className="text-[10px] font-medium px-2 py-1 rounded border border-white/10">VISA</span>
              <span className="text-[10px] font-medium px-2 py-1 rounded border border-white/10">MASTERCARD</span>
              <span className="text-[10px] font-medium px-2 py-1 rounded border border-white/10">UPI</span>
            </div>
          </div>
        </div>
      </div>

      <PolicyModal type={activePolicy} onClose={() => setActivePolicy(null)} />
    </footer>
  );
};
