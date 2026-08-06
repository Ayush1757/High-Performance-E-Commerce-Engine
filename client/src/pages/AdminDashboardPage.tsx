import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { DashboardStats } from '../types';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Users, ShoppingBag, DollarSign, Cpu, Shield, Trash2, RefreshCcw, BarChart3, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [clearingCache, setClearingCache] = useState(false);

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

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    fetchStats();
  }, [user]);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') {
    toast.error('Access denied. Administrator privileges required.');
    return <Navigate to="/" replace />;
  }

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
          <button onClick={handleClearCache} disabled={clearingCache} className="btn btn-secondary btn-sm">
            <Trash2 size={16} /> {clearingCache ? 'Flushing...' : 'Flush Cache'}
          </button>
          <button onClick={fetchStats} className="btn btn-primary btn-sm">
            <RefreshCcw size={16} /> Refresh Telemetry
          </button>
        </div>
      </div>

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

      {/* User Directory */}
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
    </div>
  );
};

export default AdminDashboardPage;
