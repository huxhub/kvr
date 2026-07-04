import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { Eye, EyeOff } from 'lucide-react';
import loginIllustration from '../../assets/login_illustration.png';

export default function LoginOverlay({ companyName = 'KVR TATA' }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login, error } = useAuth();
  const { showToast } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(username, password);
    setLoading(false);
    
    if (success) {
      showToast('Login Successful', `Welcome back to ${companyName}`);
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
                  type="text"
                  placeholder="Enter your email"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  className="login-input"
                  autoComplete="username"
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

          {/* Social Sign-in Section */}
          <div className="login-social-section">
            <span className="login-social-label">Sign In with</span>
            <div className="login-social-row">
              <button 
                type="button" 
                className="login-social-btn" 
                onClick={() => handleSocialClick('Facebook')}
                aria-label="Sign in with Facebook"
              >
                <svg viewBox="0 0 24 24" fill="#1877F2" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>
              <button 
                type="button" 
                className="login-social-btn" 
                onClick={() => handleSocialClick('Google')}
                aria-label="Sign in with Google"
              >
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Footer Link */}
          <div className="login-footer">
            Don't have an account ?{' '}
            <a 
              href="/" 
              className="login-footer-link"
              onClick={(e) => {
                e.preventDefault();
                showToast('Registration', 'Registration is closed. Please ask your administrator to create a login account.');
              }}
            >
              Sign Up
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
