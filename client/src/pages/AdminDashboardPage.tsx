import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { DashboardStats } from '../types';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Users, ShoppingBag, DollarSign, Cpu, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;

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
        // Refresh dashboard stats
        const statsRes = await api.get('/admin/dashboard');
        if (statsRes.data.success) {
          setStats(statsRes.data.data);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to adjust user role');
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
