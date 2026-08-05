import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { ShoppingCart, User, LogOut, ShieldAlert, Sparkles } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { itemsCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <Sparkles className="logo-icon text-accent" />
          <span className="logo-text">AuraStore <span className="logo-subtext">AI</span></span>
        </Link>

        <nav className="navbar-links">
          <Link to="/products" className="nav-link">Shop</Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className="nav-link admin-badge-link">
              <ShieldAlert className="inline-icon" size={16} />
              Admin Dashboard
            </Link>
          )}
        </nav>

        <div className="navbar-actions">
          <Link to="/cart" className="navbar-cart-btn">
            <ShoppingCart size={22} />
            {itemsCount > 0 && <span className="cart-badge">{itemsCount}</span>}
          </Link>

          {user ? (
            <div className="navbar-user-dropdown">
              <Link to="/profile" className="navbar-profile-btn" title="View Profile">
                <User size={22} />
                <span className="user-name">{user.name.split(' ')[0]}</span>
              </Link>
              <button onClick={handleLogout} className="logout-btn" title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="navbar-login-btn">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
