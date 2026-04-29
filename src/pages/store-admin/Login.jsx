import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '@/styles/login.css';
import { Sun, Moon, BarChart3, Package, Store, Landmark, AlertCircle, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import logoImg from '@/assets/revue-logo.jpeg';

/* ── Demo credentials ─────────────────────────────────────── */

const Login = () => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('loginTheme') || 'light-theme';
  });

  useEffect(() => {
    localStorage.setItem('loginTheme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light-theme' ? 'dark-theme' : 'light-theme'));
  };

  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = typeof location.state?.from === 'string' ? location.state.from : '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const validateField = (name, value) => {
    let errorMsg = '';
    if (name === 'email') {
      if (!value.trim()) {
        errorMsg = 'Email is required';
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errorMsg = 'Please enter a valid email';
        }
      }
    } else if (name === 'password') {
      if (!value) {
        errorMsg = 'Password is required';
      } else if (value.length < 6) {
        errorMsg = 'Password must be at least 6 characters';
      }
    }
    setFieldErrors(prev => ({ ...prev, [name]: errorMsg }));
    return errorMsg;
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    setError(''); // clear general error
    validateField('email', val);
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    setError(''); // clear general error
    validateField('password', val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Final validation check
    const emailErr = validateField('email', email);
    const passErr = validateField('password', password);

    if (emailErr || passErr) {
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }

    setLoading(true);

    /* Simulate network delay */
    await new Promise(r => setTimeout(r, 800));

    if (
      email.trim().toLowerCase() === "admin@primebasket.com" &&
      password === "admin1234"
    ) {
      sessionStorage.setItem("isAuthenticated", "true");
      navigate("/dashboard");
    } else {
      setLoading(false);
      setError('Invalid credentials');
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  };

  return (
    <div className={`login-page ${theme}`}>
      {/* ── Theme toggle top-right ── */}
      <button
        className="login-theme-btn"
        onClick={toggleTheme}
        title="Toggle theme"
      >
        {theme === 'dark-theme' ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className="login-center">
        {/* ── Brand panel ── */}
        <div className="login-brand-panel">
          <div className="login-brand-logo">
            <img
              src={logoImg}
              alt="Prime-Basket"
              style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '8px' }}
            />
          </div>
          <h1 className="login-brand-name">Prime-Basket</h1>
          <p className="login-brand-tagline">
            Your complete eCommerce management hub
          </p>

          <div className="login-feature-list">
            {[
              { Icon: BarChart3, text: 'Real-time analytics & reports' },
              { Icon: Package, text: 'Full product & order management' },
              { Icon: Store, text: 'Multi-seller marketplace control' },
              { Icon: Landmark, text: 'Financial transactions overview' },
            ].map((f, i) => (
              <div className="login-feature-item" key={i}>
                <div className="login-feature-icon">
                  <f.Icon size={16} />
                </div>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Form card ── */}
        <div className={`login-card${shake ? ' shake' : ''}`}>
          {/* Header */}
          <div className="login-card-header">
            <div className="login-card-logo-sm">
              <img
                src={logoImg}
                alt="PB"
                style={{ width: '80%', height: '80%', objectFit: 'contain' }}
              />
            </div>
            <h2>Welcome back</h2>
            <p>Sign in to your dashboard</p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="login-error">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form" noValidate>
            {/* Email */}
            <div className="login-field">
              <label htmlFor="email">Email address</label>
              <div className={`login-input-wrap${fieldErrors.email ? ' invalid' : ''}`}>
                <div className="login-input-icon"><Mail size={18} /></div>
                <input
                  id="email"
                  type="email"
                  placeholder="admin@primebasket.com"
                  value={email}
                  onChange={handleEmailChange}
                  autoComplete="email"
                />
              </div>
              {fieldErrors.email && (
                <span className="field-error-msg">
                  <AlertCircle size={14} />
                  {fieldErrors.email}
                </span>
              )}
            </div>

            {/* Password */}
            <div className="login-field">
              <div className="login-field-row">
                <label htmlFor="password">Password</label>
                <button type="button" className="login-forgot">Forgot password?</button>
              </div>
              <div className={`login-input-wrap${fieldErrors.password ? ' invalid' : ''}`}>
                <div className="login-input-icon"><Lock size={18} /></div>
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={handlePasswordChange}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="login-eye-btn"
                  onClick={() => setShowPass(v => !v)}
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.password && (
                <span className="field-error-msg">
                  <AlertCircle size={14} />
                  {fieldErrors.password}
                </span>
              )}
            </div>

            {/* Remember me */}
            <div className="login-remember">
              <label className="login-checkbox-label">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                />
                Remember me
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="login-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="login-spinner" />
                  Logging in…
                </>
              ) : (
                <>
                  Login
                </>
              )}
            </button>
          </form>

          {/* Demo credentials */}


          <p className="login-footer-note">
            © {new Date().getFullYear()} Prime-Basket. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
