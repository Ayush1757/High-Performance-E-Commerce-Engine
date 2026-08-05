import React from 'react';
import { Sparkles, Cpu } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="main-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div className="brand-logo">
            <Sparkles className="logo-icon text-accent" />
            <span>AuraStore AI</span>
          </div>
          <p className="brand-tagline">
            Next-generation shopping driven by semantic search intelligence.
          </p>
        </div>

        <div className="footer-links">
          <div className="footer-section">
            <h4>Platform</h4>
            <ul>
              <li><a href="/products">Browse Catalog</a></li>
              <li><a href="/products?category=Electronics">Electronics</a></li>
              <li><a href="/products?category=Mobiles">Mobiles</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Technology</h4>
            <ul>
              <li><span className="flex-row-gap"><Cpu size={14} /> Vector Search</span></li>
              <li><span>Redis Cache-Aside</span></li>
              <li><span>Express API</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-social">
          <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-github"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/></svg>
          </a>
          <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} AuraStore AI. Built for production excellence.</p>
      </div>
    </footer>
  );
};
