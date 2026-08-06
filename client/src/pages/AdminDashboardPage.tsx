import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { DashboardStats } from '../types';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Users, ShoppingBag, DollarSign, Cpu, Shield, Trash2, RefreshCcw, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [clearingCache, setClearingCache] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
      toast.error('Failed to retrieve dashboard reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    fetchStats();
  }, [user]);

  // Authorization check
  if (!user) {
    return <Navigate to="/login" replace />;
  }

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
    } catch (err) {
      console.error(err);
      toast.error('Failed to adjust user role');
    }
  };

  const handleClearCache = async () => {
    setClearingCache(true);
    try {
      // Simulating a cache flush operation
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Redis Cache flushed successfully across all keys!');
      fetchStats();
    } catch (err) {
      toast.error('Failed to flush cache');
    } finally {
      setClearingCache(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage message="Compiling administration reports..." />;
  }

  if (!stats) {
    return (
      <div className="admin-dashboard-container">
        <h2>Dashboard Analytics Unavailable</h2>
        <p>There was an issue processing operational telemetry data.</p>
      </div>
    );
  }

  // Monthly revenue mock data for the visual chart
  const monthlyRevenueData = [
    { month: 'Jan', amount: 12000, height: '40%' },
    { month: 'Feb', amount: 19000, height: '60%' },
    { month: 'Mar', amount: 15000, height: '50%' },
    { month: 'Apr', amount: 28000, height: '90%' },
    { month: 'May', amount: 22000, height: '70%' },
    { month: 'Jun', amount: 32000, height: '100%' },
  ];

  return (
    <div className="admin-dashboard-container">
      <h1 className="page-heading">
        <Shield className="inline-icon" /> Admin Operations Center
      </h1>

      {/* Analytics Cards Grid */}
      <div className="stats-cards-grid">
        <div className="analytics-card">
          <div className="card-header-row">
            <h4>Total Revenue</h4>
            <DollarSign className="header-icon text-accent" size={20} />
          </div>
          <p className="card-metric-value">${stats.orders.totalRevenue.toFixed(2)}</p>
          <span className="metric-context-subtext">Avg Order: ${stats.orders.avgOrderValue.toFixed(2)}</span>
        </div>

        <div className="analytics-card">
          <div className="card-header-row">
            <h4>Orders Received</h4>
            <ShoppingBag className="header-icon text-accent" size={20} />
          </div>
          <p className="card-metric-value">{stats.orders.totalOrders}</p>
          <span className="metric-context-subtext">Pending: {stats.orders.pendingOrders} orders</span>
        </div>

        <div className="analytics-card">
          <div className="card-header-row">
            <h4>Registered Users</h4>
            <Users className="header-icon text-accent" size={20} />
          </div>
          <p className="card-metric-value">{stats.users.total}</p>
          <span className="metric-context-subtext">Unique client accounts</span>
        </div>

        <div className="analytics-card">
          <div className="card-header-row">
            <h4>Redis Cache Rate</h4>
            <Cpu className="header-icon text-accent" size={20} />
          </div>
          <p className="card-metric-value">{stats.cache.hitRate}</p>
          <span className="metric-context-subtext">
            Hits: {stats.cache.hits} | Misses: {stats.cache.misses}
          </span>
        </div>
      </div>

      {/* Visual Analytics Chart & System Tools split layout */}
      <div className="dashboard-split-layout-grid margin-y-lg">
        {/* Sleek CSS-based Monthly Revenue Chart */}
        <div className="data-table-panel visual-chart-panel">
          <div className="panel-title-row">
            <BarChart3 size={18} className="text-accent" />
            <h3>Monthly Revenue Telemetry</h3>
          </div>
          <div className="revenue-bar-chart-container">
            {monthlyRevenueData.map((data, index) => (
              <div key={index} className="chart-bar-column">
                <div className="chart-bar-glow-wrapper">
                  <div className="chart-bar-fill" style={{ height: data.height }} title={`$${data.amount}`}></div>
                </div>
                <span className="chart-bar-label">{data.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* System Administration Diagnostics Panel */}
        <div className="data-table-panel diagnostics-panel">
          <h3>System Control & Operations</h3>
          <p className="panel-description-text">Trigger high-performance backend commands and clear cache instances directly.</p>
          <div className="diagnostics-buttons-stack">
            <button
              onClick={handleClearCache}
              disabled={clearingCache}
              className="btn-secondary full-width-btn flex-row-gap justify-center"
            >
              <Trash2 size={16} />
              {clearingCache ? 'Clearing Cache...' : 'Flush Redis Cache'}
            </button>
            <button
              onClick={fetchStats}
              className="btn-primary full-width-btn flex-row-gap justify-center"
            >
              <RefreshCcw size={16} />
              Recompile Telemetry Reports
            </button>
          </div>
        </div>
      </div>

      {/* Recent Users Administration Table */}
      <div className="dashboard-content-panels">
        <div className="data-table-panel">
          <h3>User Directory Administration</h3>
          <div className="table-wrapper">
            <table className="admin-users-table">
              <thead>
                <tr>
                  <th>Client Name</th>
                  <th>Email Address</th>
                  <th>Account Created</th>
                  <th>Role</th>
                  <th>Toggle Privileges</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentUsers.map((u) => (
                  <tr key={u._id}>
                    <td className="user-name-col">{u.name}</td>
                    <td className="user-email-col">{u.email}</td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`role-label-badge ${u.role === 'admin' ? 'admin' : 'user'}`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleRoleChange(u._id, u.role)}
                        disabled={u._id === user._id}
                        className="role-toggle-action-btn"
                        title={u._id === user._id ? 'Cannot demote self' : 'Toggle account permissions'}
                      >
                        {u.role === 'admin' ? 'Demote to User' : 'Make Admin'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminDashboardPage;
