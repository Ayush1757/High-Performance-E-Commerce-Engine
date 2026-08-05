import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Layout } from './components/layout/Layout';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

// Pages
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { OrdersPage } from './pages/OrdersPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <Router>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                },
              }}
            />
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Layout>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
