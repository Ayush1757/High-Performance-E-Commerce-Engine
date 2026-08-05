import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { User, Mail, Lock, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, loading } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updating, setUpdating] = useState(false);

  // Auth Guard
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email) {
      toast.error('Name and email are required');
      return;
    }

    if (password) {
      if (password.length < 6) {
        toast.error('New password must be at least 6 characters');
        return;
      }
      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
    }

    setUpdating(true);
    try {
      await updateProfile(name, email, password || undefined);
      setPassword('');
      setConfirmPassword('');
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="profile-page-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            <User size={36} className="text-accent" />
          </div>
          <h2>My Profile</h2>
          <p>Update your personal information and password settings</p>
          <div className="profile-role-badge">
            <ShieldCheck size={14} />
            <span>Role: {user.role.toUpperCase()}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="profile-name">Full Name</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input
                type="text"
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="profile-email">Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                id="profile-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-divider-row">
            <span>Change Password (Optional)</span>
          </div>

          <div className="form-group">
            <label htmlFor="profile-password">New Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                id="profile-password"
                placeholder="Leave blank to keep current password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="profile-confirm-password">Confirm New Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                id="profile-confirm-password"
                placeholder="Leave blank to keep current password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" disabled={updating || loading} className="btn-primary profile-submit-btn">
            {updating ? <LoadingSpinner message="Saving settings..." /> : <>Save Changes</>}
          </button>
        </form>
      </div>
    </div>
  );
};
export default ProfilePage;
