import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCompare } from '../../context/CompareContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, User, LogOut, ShieldAlert, Sparkles,
  Search, Menu, X, ChevronDown, Package, Heart, ArrowLeftRight
} from 'lucide-react';
import { CompareModal } from '../products/CompareModal';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { itemsCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { compareCount } = useCompare();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 transition-all duration-300"
        style={{
          zIndex: 'var(--z-sticky)',
          backgroundColor: scrolled ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: scrolled ? '1px solid var(--color-border)' : '1px solid transparent',
          boxShadow: scrolled ? 'var(--shadow-sm)' : 'none',
        }}
      >
        <div className="container-main flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              Aura<span className="text-accent">Store</span>
            </span>
          </Link>

          {/* Center Nav Links — Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                location.pathname === '/' ? 'text-accent bg-accent-light' : 'text-text-secondary hover:text-text hover:bg-bg-alt'
              }`}
            >
              Home
            </Link>
            <Link
              to="/products"
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                location.pathname.startsWith('/products') ? 'text-accent bg-accent-light' : 'text-text-secondary hover:text-text hover:bg-bg-alt'
              }`}
            >
              Shop
            </Link>
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                  location.pathname === '/admin' ? 'text-accent bg-accent-light' : 'text-text-secondary hover:text-text hover:bg-bg-alt'
                }`}
              >
                <ShieldAlert size={14} /> Admin
              </Link>
            )}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1">
            {/* Search Toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="btn-icon"
              aria-label="Search"
              title="Search"
            >
              <Search size={20} />
            </button>

            {/* Compare Trigger */}
            <button
              onClick={() => setCompareModalOpen(true)}
              className="btn-icon relative"
              aria-label="Compare"
              title="Compare Products"
            >
              <ArrowLeftRight size={20} />
              {compareCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {compareCount}
                </span>
              )}
            </button>

            {/* Wishlist */}
            <Link to="/products?filter=wishlist" className="btn-icon relative" aria-label="Wishlist" title="Wishlist">
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="btn-icon relative" aria-label="Shopping Cart" title="Cart">
              <ShoppingCart size={20} />
              {itemsCount > 0 && (
                <motion.span
                  key={itemsCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                >
                  {itemsCount > 99 ? '99+' : itemsCount}
                </motion.span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="btn-icon flex items-center gap-1.5"
                  aria-label="User menu"
                >
                  <div className="w-7 h-7 rounded-full bg-accent-light text-accent flex items-center justify-center text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown size={14} className={`hidden md:block text-text-muted transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-surface border border-border rounded-xl shadow-xl overflow-hidden"
                      style={{ zIndex: 'var(--z-dropdown)' }}
                    >
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-sm font-semibold truncate">{user.name}</p>
                        <p className="text-xs text-text-muted truncate">{user.email}</p>
                      </div>
                      <div className="py-1">
                        <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-bg-alt transition-colors">
                          <User size={16} /> Profile Settings
                        </Link>
                        <Link to="/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-bg-alt transition-colors">
                          <Package size={16} /> My Orders
                        </Link>
                      </div>
                      <div className="border-t border-border py-1">
                        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-danger hover:bg-danger-light transition-colors">
                          <LogOut size={16} /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm hidden md:inline-flex">
                Sign In
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="btn-icon md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Search Expandable */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-border"
            >
              <form onSubmit={handleSearchSubmit} className="container-main py-3 flex gap-2">
                <div className="flex-1 relative">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for products, brands, or categories..."
                    className="input pl-11"
                    autoFocus
                  />
                </div>
                <button type="submit" className="btn btn-primary">Search</button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/30 md:hidden"
              style={{ zIndex: 'calc(var(--z-sticky) - 1)' }}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-72 bg-surface shadow-2xl md:hidden flex flex-col"
              style={{ zIndex: 'var(--z-modal)' }}
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <span className="font-bold text-lg">Menu</span>
                <button onClick={() => setMobileOpen(false)} className="btn-icon"><X size={22} /></button>
              </div>
              <nav className="flex-1 p-4 space-y-1">
                <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-bg-alt transition-colors">Home</Link>
                <Link to="/products" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-bg-alt transition-colors">Shop</Link>
                <Link to="/cart" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-bg-alt transition-colors">
                  Cart {itemsCount > 0 && <span className="badge badge-accent">{itemsCount}</span>}
                </Link>
                {user && (
                  <>
                    <Link to="/profile" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-bg-alt transition-colors">Profile</Link>
                    <Link to="/orders" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-bg-alt transition-colors">My Orders</Link>
                  </>
                )}
                {user?.role === 'admin' && (
                  <Link to="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-accent hover:bg-accent-light transition-colors">Admin Dashboard</Link>
                )}
              </nav>
              <div className="p-4 border-t border-border">
                {user ? (
                  <button onClick={handleLogout} className="btn btn-secondary w-full"><LogOut size={16} /> Sign Out</button>
                ) : (
                  <Link to="/login" className="btn btn-primary w-full">Sign In</Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <CompareModal isOpen={compareModalOpen} onClose={() => setCompareModalOpen(false)} />

      {/* Spacer for fixed header */}
      <div className="h-16 md:h-18" />

      {/* Click-away for user menu */}
      {userMenuOpen && (
        <div className="fixed inset-0" style={{ zIndex: 'calc(var(--z-dropdown) - 1)' }} onClick={() => setUserMenuOpen(false)} />
      )}
    </>
  );
};
