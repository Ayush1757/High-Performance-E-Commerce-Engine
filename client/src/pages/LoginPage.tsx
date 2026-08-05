import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { LogIn, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const redirectPath = searchParams.get('redirect') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate(redirectPath);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Invalid email or password');
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo-circle">
            <LogIn size={28} className="text-accent" />
          </div>
          <h2>Sign In</h2>
          <p>Access your AuraStore account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                id="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary auth-submit-btn">
            {loading ? <LoadingSpinner message="Authenticating..." /> : <>Sign In</>}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            New to AuraStore? <Link to={`/register?redirect=${encodeURIComponent(redirectPath)}`}>Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
