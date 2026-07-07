import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { Eye, EyeOff } from 'lucide-react';
import loginIllustration from '../../assets/login_illustration.png';

export default function LoginOverlay({ companyName = 'KVR TATA' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login, error } = useAuth();
  const { showToast } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    
    if (result.success) {
      showToast('Login Successful', `Welcome back to ${companyName}`);
    } else {
      showToast('Login Failed', result.error || 'Invalid credentials', 'error');
    }
  };

  const handleSocialClick = (platform) => {
    showToast(`${platform} Login`, `Social login via ${platform} is simulated. Please use standard email/username.`);
  };

  return (
    <div className="login-screen-container">
      {/* Left Panel: Branding & Illustration */}
      <div className="login-left-panel">
        <div className="login-illustration-container">
          <img 
            src={loginIllustration} 
            alt="Workspace illustration" 
            className="login-illustration-image" 
          />
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="login-right-panel">
        <div className="login-form-wrapper">
          <h1 className="login-title">Welcome To {companyName}</h1>
          <p className="login-subtitle">Sign in your account</p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            {/* Email Field */}
            <div className="login-input-group">
              <label htmlFor="login-email" className="login-input-label">Email</label>
              <div className="login-input-wrapper">
                <input
                  id="login-email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="login-input"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="login-input-group">
              <label htmlFor="login-password" className="login-input-label">Password</label>
              <div className="login-input-wrapper">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="login-input"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="login-password-toggle"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 600, textAlign: 'left', marginBottom: '16px' }}>
                {error}
              </div>
            )}

            {/* Actions Row */}
            <div className="login-actions-row">
              <label className="login-remember-me">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <a 
                href="/" 
                className="login-forgot-password"
                onClick={(e) => {
                  e.preventDefault();
                  showToast('Password Reset', 'A password reset link is simulated. Please contact your administrator.');
                }}
              >
                Forgot Password ?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="login-submit-btn"
              disabled={loading}
            >
              {loading ? 'Sign In...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
