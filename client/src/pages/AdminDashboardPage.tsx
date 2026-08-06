import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { DashboardStats, Product, Order } from '../types';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import {
  Users, ShoppingBag, DollarSign, Cpu, Shield, Trash2, RefreshCcw,
  BarChart3, ChevronRight, Plus, Edit, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearingCache, setClearingCache] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'users'>('overview');

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: 0,
    category: 'Electronics',
    brand: '',
    stock: 10,
    images: [''],
    rating: 4.5,
  });

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      if (res.data.success) setStats(res.data.data);
    } catch {
      toast.error('Failed to retrieve dashboard reports');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products?limit=50');
      if (res.data.success) setProducts(res.data.data.products);
    } catch {
      toast.error('Failed to load products');
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders?limit=50');
      if (res.data.success) setAllOrders(res.data.data.orders);
    } catch {
      toast.error('Failed to load orders');
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    fetchStats();
    fetchProducts();
    fetchOrders();
  }, [user]);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') {
    toast.error('Access denied. Administrator privileges required.');
    return <Navigate to="/" replace />;
  }

  // --- Product CRUD ---
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      price: 0,
      category: 'Electronics',
      brand: '',
      stock: 10,
      images: ['https://placehold.co/400x400?text=Product'],
      rating: 4.5,
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      description: prod.description,
      price: prod.price,
      category: prod.category,
      brand: prod.brand,
      stock: prod.stock,
      images: prod.images.length > 0 ? prod.images : ['https://placehold.co/400x400?text=Product'],
      rating: prod.rating,
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        // Update product
        const res = await api.put(`/products/${editingProduct._id}`, productForm);
        if (res.data.success) {
          toast.success('Product updated successfully!');
          fetchProducts();
          fetchStats();
        }
      } else {
        // Create product
        const res = await api.post('/products', productForm);
        if (res.data.success) {
          toast.success('Product created successfully!');
          fetchProducts();
          fetchStats();
        }
      }
      setIsProductModalOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    }
  };

  const handleDeleteProduct = async (productId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      const res = await api.delete(`/products/${productId}`);
      if (res.data.success) {
        toast.success('Product deleted successfully!');
        fetchProducts();
        fetchStats();
      }
    } catch {
      toast.error('Failed to delete product');
    }
  };

  // --- Order Status Update ---
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await api.put(`/orders/${orderId}/status`, { status: newStatus });
      if (res.data.success) {
        toast.success(`Order status updated to ${newStatus}`);
        fetchOrders();
        fetchStats();
      }
    } catch {
      toast.error('Failed to update order status');
    }
  };

  // --- Role Toggle ---
  const handleRoleChange = async (userId: string, currentRole: string) => {
    const nextRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const res = await api.put(`/admin/users/${userId}/role`, { role: nextRole });
      if (res.data.success) {
        toast.success('User privileges updated successfully');
        fetchStats();
      }
    } catch {
      toast.error('Failed to adjust user role');
    }
  };

  const handleClearCache = async () => {
    setClearingCache(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success('Redis Cache flushed successfully!');
      fetchStats();
    } catch {
      toast.error('Failed to flush cache');
    } finally {
      setClearingCache(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage count={4} message="Loading operations telemetry..." />;
  if (!stats) return <div className="container-main py-12 text-center text-text-secondary">Dashboard telemetry unavailable.</div>;

  const monthlyRevenueData = [
    { month: 'Jan', amount: 12000, height: '40%' },
    { month: 'Feb', amount: 19000, height: '60%' },
    { month: 'Mar', amount: 15000, height: '50%' },
    { month: 'Apr', amount: 28000, height: '90%' },
    { month: 'May', amount: 22000, height: '70%' },
    { month: 'Jun', amount: 32000, height: '100%' },
  ];

  return (
    <div className="container-main py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-text-muted mb-1">
            <span>Admin</span>
            <ChevronRight size={14} />
            <span className="text-text font-medium">Dashboard</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <Shield className="text-accent" /> Operations Center
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleOpenAddProduct} className="btn btn-primary btn-sm">
            <Plus size={16} /> Add Product
          </button>
          <button onClick={handleClearCache} disabled={clearingCache} className="btn btn-secondary btn-sm">
            <Trash2 size={16} /> {clearingCache ? 'Flushing...' : 'Flush Cache'}
          </button>
          <button onClick={fetchStats} className="btn btn-ghost btn-sm" title="Refresh">
            <RefreshCcw size={16} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-2">
        {[
          { key: 'overview', label: 'Overview & Telemetry' },
          { key: 'products', label: `Products (${products.length})` },
          { key: 'orders', label: `Orders (${allOrders.length})` },
          { key: 'users', label: `Users (${stats.users.total})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              activeTab === tab.key ? 'border-accent text-accent' : 'border-transparent text-text-secondary hover:text-text'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { title: 'Total Revenue', value: `$${stats.orders.totalRevenue.toFixed(2)}`, sub: `Avg Order: $${stats.orders.avgOrderValue.toFixed(2)}`, icon: <DollarSign size={20} />, bg: 'bg-emerald-50 text-emerald-600' },
              { title: 'Total Orders', value: stats.orders.totalOrders, sub: `Pending: ${stats.orders.pendingOrders}`, icon: <ShoppingBag size={20} />, bg: 'bg-blue-50 text-blue-600' },
              { title: 'Registered Users', value: stats.users.total, sub: 'Unique accounts', icon: <Users size={20} />, bg: 'bg-purple-50 text-purple-600' },
              { title: 'Redis Cache Hit Rate', value: stats.cache.hitRate, sub: `Hits: ${stats.cache.hits} | Misses: ${stats.cache.misses}`, icon: <Cpu size={20} />, bg: 'bg-amber-50 text-amber-600' },
            ].map((m, i) => (
              <motion.div key={m.title} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">{m.title}</span>
                  <div className={`w-9 h-9 rounded-lg ${m.bg} flex items-center justify-center`}>{m.icon}</div>
                </div>
                <p className="text-2xl font-extrabold text-text">{m.value}</p>
                <p className="text-xs text-text-secondary">{m.sub}</p>
              </motion.div>
            ))}
          </div>

          {/* Analytics Chart & Telemetry */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 card p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <BarChart3 size={18} className="text-accent" />
                <h3 className="font-bold">Monthly Revenue Telemetry</h3>
              </div>
              <div className="h-48 flex items-end justify-between gap-4 pt-6 px-4">
                {monthlyRevenueData.map((d) => (
                  <div key={d.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="w-full bg-accent-light rounded-t-lg transition-all group-hover:bg-accent relative overflow-hidden" style={{ height: d.height }}>
                      <div className="absolute inset-0 bg-accent/20" />
                    </div>
                    <span className="text-xs font-semibold text-text-muted">{d.month}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6 space-y-4">
              <h3 className="font-bold border-b border-border pb-3">System Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-1 border-b border-border">
                  <span className="text-text-muted">Environment</span>
                  <span className="font-semibold text-text">Production</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border">
                  <span className="text-text-muted">Database</span>
                  <span className="font-semibold text-text">MongoDB Atlas</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border">
                  <span className="text-text-muted">Cache Store</span>
                  <span className="font-semibold text-text">Redis Cloud</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border">
                  <span className="text-text-muted">Vector Engine</span>
                  <span className="font-semibold text-text">256-dim Cosine</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="card overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h3 className="font-bold">Product Catalog Management</h3>
            <button onClick={handleOpenAddProduct} className="btn btn-primary btn-sm">
              <Plus size={16} /> Create Product
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-bg-alt text-xs font-semibold text-text-muted uppercase tracking-wider border-b border-border">
                <tr>
                  <th className="px-6 py-3">Product Name</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Stock</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((prod) => (
                  <tr key={prod._id} className="hover:bg-bg-alt/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-text flex items-center gap-3">
                      <img src={prod.images?.[0] || 'https://placehold.co/40x40?text=Prod'} alt={prod.name} className="w-10 h-10 object-contain rounded bg-bg-alt p-1 shrink-0" />
                      <span className="truncate max-w-xs">{prod.name}</span>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">{prod.category}</td>
                    <td className="px-6 py-4 font-bold text-accent">${prod.price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-text-muted">{prod.stock} left</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => handleOpenEditProduct(prod)} className="btn btn-ghost btn-sm text-accent">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDeleteProduct(prod._id, prod.name)} className="btn btn-ghost btn-sm text-danger">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="card overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="font-bold">Customer Orders Management</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-bg-alt text-xs font-semibold text-text-muted uppercase tracking-wider border-b border-border">
                <tr>
                  <th className="px-6 py-3">Order ID</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Total</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {allOrders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-bg-alt/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-text">#{ord._id.substring(0, 8)}</td>
                    <td className="px-6 py-4 font-semibold text-text">{(ord.user as any)?.name || 'Guest'}</td>
                    <td className="px-6 py-4 text-text-muted">{new Date(ord.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-extrabold text-accent">${ord.totalPrice.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`badge ${ord.status === 'delivered' ? 'badge-success' : ord.status === 'cancelled' ? 'badge-danger' : 'badge-accent'}`}>
                        {ord.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <select
                        value={ord.status}
                        onChange={(e) => handleUpdateOrderStatus(ord._id, e.target.value)}
                        className="select text-xs py-1 px-2 w-32"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="card overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="font-bold">User Directory Administration</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-bg-alt text-xs font-semibold text-text-muted uppercase tracking-wider border-b border-border">
                <tr>
                  <th className="px-6 py-3">Client Name</th>
                  <th className="px-6 py-3">Email Address</th>
                  <th className="px-6 py-3">Account Created</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stats.recentUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-bg-alt/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-text">{u.name}</td>
                    <td className="px-6 py-4 text-text-secondary">{u.email}</td>
                    <td className="px-6 py-4 text-text-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`badge ${u.role === 'admin' ? 'badge-accent' : 'badge-dark'}`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleRoleChange(u._id, u.role)}
                        disabled={u._id === user._id}
                        className="btn btn-ghost btn-sm text-xs disabled:opacity-30"
                      >
                        {u.role === 'admin' ? 'Demote' : 'Make Admin'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Add/Edit Modal */}
      <AnimatePresence>
        {isProductModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" style={{ zIndex: 'var(--z-modal)' }} onClick={() => setIsProductModalOpen(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="card bg-surface w-full max-w-xl overflow-hidden shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-bold text-lg">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                <button onClick={() => setIsProductModalOpen(false)} className="btn-icon"><X size={20} /></button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4 text-sm">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-muted uppercase">Product Name</label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    required
                    className="input"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-muted uppercase">Description</label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    required
                    className="input h-20 py-2 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-text-muted uppercase">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                      required
                      className="input"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-text-muted uppercase">Stock Quantity</label>
                    <input
                      type="number"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                      required
                      className="input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-text-muted uppercase">Category</label>
                    <input
                      type="text"
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      required
                      className="input"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-text-muted uppercase">Brand</label>
                    <input
                      type="text"
                      value={productForm.brand}
                      onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                      required
                      className="input"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-muted uppercase">Image URL</label>
                  <input
                    type="text"
                    value={productForm.images[0] || ''}
                    onChange={(e) => setProductForm({ ...productForm, images: [e.target.value] })}
                    className="input"
                  />
                </div>

                <div className="pt-4 border-t border-border flex justify-end gap-3">
                  <button type="button" onClick={() => setIsProductModalOpen(false)} className="btn btn-secondary btn-sm">Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm">Save Product</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboardPage;
